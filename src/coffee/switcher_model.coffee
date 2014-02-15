{EventEmitter} = require 'events'

module.exports = class SwitcherModel extends EventEmitter
  constructor: ->
    super()

    @lastInput = ''
    @searchTerm = null
    @tabs = []
    @selected = 0
    searchAllWindows = localStorage.getItem('searchAllWindows')
    @searchAllWindows = if searchAllWindows then JSON.parse(searchAllWindows) else false

    chrome.runtime.onMessage.addListener (request, sender, sendResponse) =>
      if request.tabs
        @setTabs(request.tabs, request.lastActive)
        @emit 'fetch:tabs'

  fetchTabs: (cb) =>
    @once 'fetch:tabs', cb if cb?
    chrome.runtime.sendMessage sendTabData: true, searchAllWindows: @searchAllWindows

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
    @emit 'change:tabs', @tabs

  setSelected: (index) =>
    @selected = parseInt(index, 10)
    @emit 'change:selected', @selected

  setSearchAllWindows: (val) =>
    @searchAllWindows = !!val
    localStorage.setItem 'searchAllWindows', JSON.stringify(@searchAllWindows)
    @emit 'change:searchAllWindows'
    @fetchTabs =>
      @filterTabs @searchTerm if @searchTerm?

  filterTabs: (search) =>
    @searchTerm = search
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
    @emit 'change:tabs', @tabs

  resetFilter: =>
    @searchTerm = ''
    for tab in @_origTabs
      delete tab._htmlTitle
      delete tab._htmlUrl
    @setTabs(@_origTabs)

  activateSelected: =>
    tab = @tabs[@selected]
    chrome.runtime.sendMessage switchToTabId: tab.id
