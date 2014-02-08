lastTabs = {}
paddingTop = 50
paddingBottom = 50
switcherWidth = 600
lastWindow = null

# Fetch the `lastTabs` data from local storage;
# clean it up based on current windows in case local storage is out of date
chrome.storage.local.get 'lastTabs', (data) ->
  chrome.windows.getAll (windows) ->
    lastTabs = JSON.parse(data.lastTabs)
    ids = windows.map (win) -> win.id.toString()
    for id, _ of lastTabs
      delete lastTabs[id] unless id.toString() in ids

serialize = ->
  chrome.storage.local.set(lastTabs: JSON.stringify(lastTabs))

# Save the `lastTabs` data whenever the event page is unloaded
chrome.runtime.onSuspend.addListener ->
  serialize()

# Keep track of the next-to-last tab opened per window
chrome.tabs.onActivated.addListener ({tabId, windowId}) ->
  lastTabs[windowId] ?= [null]
  lastTabs[windowId].push(tabId)
  lastTabs[windowId].shift() while lastTabs[windowId].length > 2

chrome.windows.onRemoved.addListener (windowId) ->
  delete lastTabs[windowId]

chrome.commands.onCommand.addListener (command) ->
  if command == "show-tab-switcher"
    chrome.windows.getCurrent (currentWindow) ->
      lastWindow = currentWindow
      width = currentWindow.width - 200
      width = Math.min(600, width)

      windowOpts =
        url: chrome.runtime.getURL('src/html/test.html')
        left: Math.max(0, currentWindow.left + Math.round((currentWindow.width - switcherWidth) / 2))
        top: Math.max(0, currentWindow.top + paddingTop)
        width: switcherWidth
        height: Math.max(currentWindow.height - paddingTop - paddingBottom, 600)
        focused: true
        type: 'popup'
      chrome.windows.create windowOpts

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  if request.switchToTabId
    chrome.tabs.update request.switchToTabId, active: true
    chrome.tabs.get request.switchToTabId, (tab) ->
      chrome.windows.update tab.windowId, focused: true if tab?
  if request.sendTabData
    options = {}
    options.windowId = lastWindow.id unless request.searchAllWindows
    chrome.tabs.query options, (tabs) ->
      tabs = tabs.filter (tab) -> tab.id != sender.tab.id
      data =
        tabs: tabs
        lastActive: (lastTabs[lastWindow.id] || [])[0]
      chrome.tabs.sendMessage sender.tab.id, data
