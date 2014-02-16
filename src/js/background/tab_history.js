var Q = require('q');
var util = require('../util');

module.exports = function(chrome) {
  var recentTabs = null;

  return {
    getFromLocalStorage: function(key) {
      return util.pcall(chrome.storage.local.get.bind(chrome.storage.local), key);
    },

    getAllWindows: function() {
      return util.pcall(chrome.windows.getAll);
    },

    getRecentTabs: function() {
      if (!recentTabs) {
        storeData = this.getFromLocalStorage('lastTabs');
        windows = this.getAllWindows();
        recentTabs = Q.all([storeData, windows]).spread(function(data, windows) {
          data = JSON.parse(data.lastTabs) || {};
          var ids = windows.map(function(win) { return win.id.toString(); });
          for (var key in data) {
            if (ids.indexOf(key.toString()) == -1) {
              delete data[key];
            }
          }
          return data;
        });
      }

      return recentTabs;
    },

    addRecentTab: function(windowId, tabId) {
      return this.getRecentTabs().then(function(tabs) {
        if (!tabs[windowId]) tabs[windowId] = [null];
        tabs[windowId].push(tabId);
        while (tabs[windowId].length > 2) {
          tabs[windowId].shift();
        }
        recentTabs = Q.when(tabs);
      });
    },

    removeHistoryForWindow: function(windowId) {
      return this.getRecentTabs().then(function(tabs) {
        delete tabs[windowId];
        recentTabs = Q.when(tabs);
      });
    },

    saveRecentTabs: function() {
      return recentTabs.then(function(tabs) {
        if (!tabs) return;
        chrome.storage.local.set({lastTabs: JSON.stringify(recentTabs)});
      });
    }
  };
};
