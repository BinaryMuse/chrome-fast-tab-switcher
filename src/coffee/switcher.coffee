template = """
<style>
  * {
    box-sizing: border-box;
  }

  .container {
    position: fixed;
    width: 600px;
    z-index: 9999999;
    left: 50%;
    top: 25px;
    margin-left: -300px;
    border: 1px solid black;
    border-radius: 4px;
    background: #eee;
    box-shadow: #ccc 0 0 10px;
    padding: 7px;
  }

  .container input[type=text] {
    width: 100%;
    height: 40px;
    font-size: 26px;
    margin: 0;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  .container input[type=text]:focus {
    outline: none;
  }

  .container ul {
    list-style: none;
    padding-left: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 10px -7px 0 -7px;
  }

  .container ul li {
    margin-left: 0;
    font-size: 15px;
    font-family: Arial, sans-serif;
    padding: 7px;
    border-top: 1px solid #333;
  }

  .container ul li:last-child {
    border-bottom: 1px solid #333;
  }

  .container ul li.selected {
    background-color: white;
  }

  .container ul li .bkg {
    vertical-align: bottom;
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 5px;
    background-size: 16px 16px;
  }

  .container ul li .title {
  }

  .container ul li .match {
    text-decoration: underline;
  }

  .container ul li .url {
    color: #666;
    margin-left: 21px;
    padding-top: 5px;
  }
</style>

<div class='container'>
  <input type='text' size='30'>
  <ul></ul>
</div>
"""

KEY_ENTER = 13
KEY_ESC = 27
KEY_UP = 38
KEY_DOWN = 40

class SwitcherModel
  constructor: ->
    tabs = []
    selected = 0

    @_tabsChangeCallbacks = []
    @_selectedChangeCallbacks = []

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


class TabItemView
  constructor: (tab) ->
    @element = $("<li>")
    div = $('<div>')
    div.append $("<div>").addClass("bkg").css(backgroundImage: "url(#{tab.favIconUrl})")
    div.append $("<span>").addClass("title").html(tab._htmlTitle || tab.title)

    @element.append div
    @element.append $("<div>").addClass("url").html(tab._htmlUrl || tab.url)

class SwitcherView
  constructor: (@model) ->
    [@list, @input] = []

    @host = $('<div>').attr('id', 'chrome-extension-quick-tab-switcher').attr('reset-style-inheritance', true).appendTo('body')
    shadow = if @host[0].createShadowRoot then @host[0].createShadowRoot() else @host[0].webkitCreateShadowRoot()
    @element = $(shadow)

    @tmpl = $(template)
    @container = @tmpl.find('.container')
    @list = @tmpl.find('ul')
    @input = @tmpl.find('input')

    @input.on 'keyup', @handleInputKeyup
    @host.on 'click', (evt) ->
      evt.stopPropagation()

    @model.onTabsChange (tabs) =>
      @list.empty()
      for tab in tabs
        @list.append new TabItemView(tab).element
      $(@list.children().get(@model.selected)).addClass('selected')

    @model.onSelectedChange (index) =>
      @list.children().removeClass('selected')
      $(@list.children().get(index)).addClass('selected')

  handleInputKeyup: (evt) =>
    switch evt.which
      when KEY_ESC
        @hide()
      when KEY_ENTER
        tab = @model.tabs[@model.selected]
        @hide()
        chrome.runtime.sendMessage switchToTabId: tab.id
      when KEY_UP
        @model.setSelected Math.max(0, @model.selected - 1)
      when KEY_DOWN
        @model.setSelected Math.min(@model.tabs.length - 1, @model.selected + 1)
      else
        current = $(evt.target).val()
        if current != @lastInput
          if current
            @model.filterTabs current
          else
            @model.resetFilter()
          @lastInput = current

    null

  show: =>
    @element.append @tmpl
    @element[0].resetStyleInheritance = true
    @input.focus()
    $(document).on 'click.switcher', @hide
    @input.on 'keydown.switcherBlocker', (evt) -> evt.stopPropagation()
    @input.on 'keyup.switcherBlocker', (evt) -> evt.stopPropagation()

  hide: =>
    $(document).off 'click.switcher'
    @input.off 'keydown.switcherBlocker'
    @input.off 'keyup.switcherBlocker'
    @tmpl.detach()
    @input.val('')
    @lastInput = ''

[model, view] = []

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  if request.tabs
    model ?= new SwitcherModel()
    view ?= new SwitcherView(model)

    model.setTabs(request.tabs, request.lastActive)
    view.show()
