var Q = require('q');
var tabHistory = require('./background/tab_history')(chrome);
var windowManager = require('./background/window_manager')(chrome);

var PADDING_TOP = 50;
var PADDING_BOTTOM = 50;
var SWITCHER_WIDTH = 600;

// Persist the tab history to local storage every minute.
setInterval(function() {
  tabHistory.saveRecentTabs();
}, 60 * 1000);

// Chrome will wake up the extension, if necessary, to call this listener.
chrome.tabs.onActivated.addListener(function(tab) {
  var windowId = tab.windowId;
  var tabId = tab.tabId;
  tabHistory.addRecentTab(windowId, tabId);
});

// When the user closes a window, remove all that window's history.
chrome.windows.onRemoved.addListener(function(windowId) {
  tabHistory.removeHistoryForWindow(windowId);
});

// Add the currently active tab for each window to the history
// if they're not already the most recent active tab.
tabHistory.getActiveTabs().then(function(tabs) {
  for (var idx in tabs) {
    var tab = tabs[idx];
    var windowId = tab.windowId;
    var tabId = tab.id;
  }
  tabHistory.addRecentTab(windowId, tabId, true);
});

chrome.commands.onCommand.addListener(function(command) {
  // Users can bind a key to this command in their Chrome
  // keyboard shortcuts, at the bottom of their extensions page.
  if (command == 'show-tab-switcher') {
    var currentWindow = windowManager.getCurrentWindow();
    var switcherWindowId = windowManager.getSwitcherWindowId();

    Q.all([currentWindow, switcherWindowId])
    .spread(function(currentWindow, switcherWindowId) {
      // Don't activate the switcher from an existing switcher window.
      if (currentWindow.id == switcherWindowId) return;

      // When the user activates the switcher and doesn't have "search
      // in all windows" enabled, we need to know which was the last
      // non-switcher window that was active.
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
      respond(data);
    });
    // We must return `true` so that Chrome leaves the
    // messaging channel open, thus allowing us to call `respond`.
    return true;
  }
});
