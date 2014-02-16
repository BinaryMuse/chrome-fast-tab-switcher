var Q = require('q');
var tabHistory = require('./background/tab_history')(chrome);
var windowManager = require('./background/window_manager')(chrome);
var util = require('./util');

var PADDING_TOP = 50;
var PADDING_BOTTOM = 50;
var SWITCHER_WIDTH = 600;

chrome.runtime.onSuspend.addListener(function() {
  tabHistory.saveRecentTabs();
});

chrome.tabs.onActivated.addListener(function(tab) {
  var windowId = tab.windowId;
  var tabId = tab.tabId;
  tabHistory.addRecentTab(windowId, tabId);
});

chrome.windows.onRemoved.addListener(function(windowId) {
  tabHistory.removeHistoryForWindow(windowId);
});

chrome.commands.onCommand.addListener(function(command) {
  if (command == 'show-tab-switcher') {
    var currentWindow = windowManager.getCurrentWindow();
    var switcherWindowId = windowManager.getSwitcherWindowId();
    Q.all([currentWindow, switcherWindowId])
    .spread(function(currentWindow, switcherWindowId) {
      if (currentWindow.id == switcherWindowId) return;

      windowManager.setLastWindowId(currentWindow.id);
      var left = Math.max(0, currentWindow.left +
        Math.round((currentWindow.width - SWITCHER_WIDTH) / 2));
      var top = Math.max(0, currentWindow.top + PADDING_TOP);
      var height = Math.max(currentWindow.height - PADDING_TOP - PADDING_BOTTOM, 600);
      var width = SWITCHER_WIDTH;

      windowManager.showSwitcher(width, height, left, top);
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, respond) {
  if (request.switchToTabId) {
    windowManager.switchToTab(request.switchToTabId);
  }

  if (request.sendTabData) {
    Q.all([tabHistory.getRecentTabs(), windowManager.getLastWindowId()])
    .spread(function(recentTabs, lastWindowId) {
      return windowManager.queryTabs(sender.tab.id, request.searchAllWindows,
                                     recentTabs, lastWindowId);
    }).then(function(data) {
      chrome.tabs.sendMessage(sender.tab.id, data);
    });
  }
});
