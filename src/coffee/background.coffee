lastTabs = {}

chrome.tabs.onActivated.addListener ({tabId, windowId}) ->
  lastTabs[windowId] ?= [null]
  lastTabs[windowId].push(tabId)
  lastTabs[windowId].shift() while lastTabs[windowId].length > 2

chrome.commands.onCommand.addListener (command) ->
  if command == "show-tab-switcher"
    chrome.tabs.query active: true, currentWindow: true, ([currentTab]) ->
      chrome.tabs.query currentWindow: true, (tabs) ->
        data =
          tabs: tabs
          lastActive: (lastTabs[currentTab.windowId] || [])[0]
        chrome.tabs.sendMessage currentTab.id, data

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  if request.switchToTabId
    chrome.tabs.update request.switchToTabId, active: true
