lastTabs = {}

chrome.tabs.onActivated.addListener ({tabId, windowId}) ->
  lastTabs[windowId] ?= [null]
  lastTabs[windowId].push(tabId)
  lastTabs[windowId].shift() while lastTabs[windowId].length > 2

chrome.commands.onCommand.addListener (command) ->
  if command == "show-tab-switcher"
    chrome.windows.getCurrent (currentWindow) ->
      width = currentWindow.width - 200
      width = Math.min(600, width)

      windowOpts =
        url: chrome.runtime.getURL('src/html/test.html')
        left: currentWindow.left + (currentWindow.width - width) / 2
        top: currentWindow.top + 50
        width: width
        height: currentWindow.height - 100
        focused: true
        type: 'popup'
      chrome.windows.create windowOpts, (window) ->

    return
    chrome.tabs.query active: true, currentWindow: true, ([currentTab]) ->
      chrome.tabs.query currentWindow: true, (tabs) ->
        data =
          tabs: tabs
          lastActive: (lastTabs[currentTab.windowId] || [])[0]
        chrome.tabs.sendMessage currentTab.id, data

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  if request.switchToTabId
    chrome.tabs.update request.switchToTabId, active: true
