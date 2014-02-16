var Q = require('q');
var util = require('../util');

module.exports = function(chrome) {
  var responses = {};

  return {
    fetchTabs: function(searchAllWindows, reload) {
      if (!responses[searchAllWindows] || reload) {
        var opts = {
          sendTabData: true,
          searchAllWindows: searchAllWindows
        };
        var fn = chrome.runtime.sendMessage.bind(chrome.runtime);
        responses[searchAllWindows] = util.pcall(fn, opts);
      }

      return responses[searchAllWindows];
    },

    query: function(term, searchAllWindows, reload) {
      return this.fetchTabs(searchAllWindows, reload).then(function(data) {
        var tabs = data.tabs;
        var lastActive = data.lastActive;

        var firstTab = [];
        var otherTabs = [];

        for(var idx in tabs) {
          var tab = tabs[idx];
          if (tab.id === lastActive) firstTab.push(tab);
          else otherTabs.push(tab);
        }

        return firstTab.concat(otherTabs);
      });
    },

    // TODO: move this elsewhere
    switchTo: function(tab) {
      chrome.runtime.sendMessage({switchToTabId: tab.id});
    }
  };
};
