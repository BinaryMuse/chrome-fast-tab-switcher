KEY_ENTER = 13
KEY_ESC = 27
KEY_UP = 38
KEY_DOWN = 40

class SwitcherModel
  constructor: ->
    tabs = []
    selected = 0
    searchAllWindows = localStorage.getItem('searchAllWindows')
    @searchAllWindows = if searchAllWindows then JSON.parse(searchAllWindows) else false

    @_tabsChangeCallbacks = []
    @_selectedChangeCallbacks = []
    @_nextFetchListeners = []

    chrome.runtime.onMessage.addListener (request, sender, sendResponse) =>
      if request.tabs
        @setTabs(request.tabs, request.lastActive)
        cb() for cb in @_nextFetchListeners
        @_nextFetchListeners = []

  fetchTabs: (cb) =>
    @_nextFetchListeners.push(cb) if cb?
    chrome.runtime.sendMessage sendTabData: true, searchAllWindows: @searchAllWindows

  onTabsChange: (cb) =>
    @_tabsChangeCallbacks.push(cb)

  onSelectedChange: (cb) =>
    @_selectedChangeCallbacks.push(cb)

  setTabs: (tabs, lastSelectedId) =>
    firstTab = []
    otherTabs = []
    for tab in tabs
      if tab.id == lastSelectedId
        firstTab.push(tab)
      else
        otherTabs.push(tab)
    @tabs = firstTab.concat(otherTabs)
    @_origTabs = @tabs
    @setSelected(0)
    cb(@tabs) for cb in @_tabsChangeCallbacks

  setSelected: (index) =>
    @selected = index
    cb(@selected) for cb in @_selectedChangeCallbacks

  setSearchAllWindows: (val) =>
    @searchAllWindows = !!val
    localStorage.setItem 'searchAllWindows', JSON.stringify(@searchAllWindows)

  filterTabs: (search) =>
    for tab in @_origTabs
      delete tab._htmlTitle
      delete tab._htmlUrl

    optsFor = (field) ->
      pre: "<span class='match'>"
      post: "</span>"
      extract: (tab) -> tab[field]

    titleMatches = fuzzy.filter search, @_origTabs, optsFor('title')
    urlMatches = fuzzy.filter search, @_origTabs, optsFor('url')
    newTabs = {}

    for match in titleMatches
      match.original._htmlTitle = match.string
      newTabs[match.original.id] = match

    for match in urlMatches
      match.original._htmlUrl = match.string
      if titleMatch = newTabs[match.original.id]
        if match.score > titleMatch.score
          newTabs[match.original.id] = match
      else
        newTabs[match.original.id] = match

    values = (value for key, value of newTabs)

    @tabs = values
      .sort (a, b) ->
        b.score - a.score
      .map (match) ->
        match.original
    @setSelected(0)
    cb(@tabs) for cb in @_tabsChangeCallbacks

  resetFilter: =>
    for tab in @_origTabs
      delete tab._htmlTitle
      delete tab._htmlUrl
    @setTabs(@_origTabs)

  activeSelected: =>
    tab = @tabs[@selected]
    chrome.runtime.sendMessage switchToTabId: tab.id


class TabItemView
  constructor: (tab) ->
    @element = $("<li>")
    @element.data 'tab', tab
    div = $('<div>')
    div.append $("<div>").addClass("bkg").css(backgroundImage: "url(#{tab.favIconUrl})")
    div.append $("<span>").addClass("title").html(tab._htmlTitle || tab.title)

    @element.append div
    @element.append $("<div>").addClass("url").html(tab._htmlUrl || tab.url)

class SwitcherView
  constructor: (@model) ->
    [@list, @input] = []

    body = $('body')
    @input = body.find('input[type=text]')
    @checkbox = body.find('input[type=checkbox]')
    @list = body.find('ul')
    @input.focus()

    @checkbox.prop('checked', true) if @model.searchAllWindows

    @input.on 'keydown', @handleInputKeyDown
    @input.on 'keyup', @handleInputKeyUp
    @checkbox.on 'change', @handleSearchAllWindowsChange
    @list.on 'mouseover', 'li', @handleMouseover
    @list.on 'click', 'li', @handleClick

    @model.onTabsChange (tabs) =>
      @list.empty()
      for tab in tabs
        @list.append new TabItemView(tab).element
      $(@list.children().get(@model.selected)).addClass('selected')

    @model.onSelectedChange (index) =>
      @list.children().removeClass('selected')
      $(@list.children().get(index)).addClass('selected')

  handleSearchAllWindowsChange: =>
    val = @checkbox.prop('checked')
    @model.setSearchAllWindows val
    @input.focus()
    @model.fetchTabs =>
      @model.filterTabs @input.val() if @input.val()

  handleInputKeyDown: (evt) =>
    switch evt.which
      when KEY_ESC
        @close()
      when KEY_ENTER
        @model.activeSelected()
        @close()
      when KEY_UP
        @model.setSelected Math.max(0, @model.selected - 1)
        evt.preventDefault()
      when KEY_DOWN
        @model.setSelected Math.min(@model.tabs.length - 1, @model.selected + 1)
        evt.preventDefault()

    null

  handleInputKeyUp: (evt) =>
    return if evt.which in [KEY_ESC, KEY_ENTER, KEY_UP, KEY_DOWN]

    current = $(evt.target).val()
    if current != @lastInput
      if current
        @model.filterTabs current
      else
        @model.resetFilter()
      @lastInput = current

    null

  handleMouseover: (evt) =>
    target = $(evt.target)
    if target.is('li')
      tab = target.data('tab')
    else
      parents = target.parents('li')
      tab = $(parents.get(0)).data('tab') if parents.length

    if tab
      index = @model.tabs.indexOf(tab)
      @model.setSelected index

  handleClick: (evt) =>
    @model.activeSelected()
    @close()

  close: =>
    window.close()

$ ->
  model = new SwitcherModel()
  view = new SwitcherView(model)
  model.fetchTabs()

  $(window).on 'blur', view.close
