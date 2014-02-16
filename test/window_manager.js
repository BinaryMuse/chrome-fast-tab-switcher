var Q = require('q');
var windowManager = require('../src/js/background/window_manager');
var api;

var windowsWith = function(windows) {
  return {
    getAll: function(cb) {
      cb(windows);
    }
  }
};

exports.switcherWindowId = {
  setUp: function(cb) {
    api = windowManager();
    cb();
  },

  defaultsToNull: function(test) {
    api.getSwitcherWindowId().then(function(id) {
      test.equal(id, null);
      test.done();
    });
  },

  canBeSet: function(test) {
    api.setSwitcherWindowId(123)
    .then(api.getSwitcherWindowId)
    .then(function(id) {
      test.equal(id, 123);
      test.done();
    });
  }
};

exports.lastWindowId = {
  setUp: function(cb) {
    api = windowManager();
    cb();
  },

  defaultsToNull: function(test) {
    api.getLastWindowId().then(function(id) {
      test.equal(id, null);
      test.done();
    });
  },

  canBeSet: function(test) {
    api.setLastWindowId(123)
    .then(api.getLastWindowId)
    .then(function(id) {
      test.equal(id, 123);
      test.done();
    });
  }
};

exports.showSwitcher = {
  setUp: function(cb) {
    var chrome = {
      runtime: {
        getURL: function() { return ""; }
      },
      windows: {
        create: function(opts, cb) {
          cb({id: 456});
        }
      }
    };

    api = windowManager(chrome);
    cb();
  },

  setsSwitcherWindowId: function(test) {
    api.showSwitcher()
    .then(api.getSwitcherWindowId)
    .then(function(id) {
      test.equal(id, 456);
      test.done();
    });
  }
};

exports.switchToTab = {
  setUp: function(cb) {
    var chrome = {
      tabs: {
        update: function(tabId, options) {
          if (!chrome.tabs.update.calls) chrome.tabs.update.calls = [];
          chrome.tabs.update.calls.push([tabId, options]);
        }, get: function(tabId, callback) {
          callback({windowId: 1})
        }
      }, windows: {
        update: function(windowId, options) {
          if (!chrome.windows.update.calls) chrome.windows.update.calls = [];
          chrome.windows.update.calls.push([windowId, options]);
        }
      }
    };
    this.chrome = chrome;

    api = windowManager(chrome);
    cb();
  },

  switchesToTheTabAndWindow: function(test) {
    api.switchToTab(10).then(function() {
      test.deepEqual(this.chrome.tabs.update.calls, [[10, {active: true}]]);
      test.deepEqual(this.chrome.windows.update.calls, [[1, {focused: true}]]);
      test.done();
    }.bind(this));
  }
};

exports.queryTabsInCurrentWindow = {
  setUp: function(cb) {
    var chrome = {
      tabs: {
        query: function(options, callback) {
          if (!chrome.tabs.query.calls) chrome.tabs.query.calls = [];
          chrome.tabs.query.calls.push([options, callback]);
          callback([{id: 1}, {id: 2}, {id: 3}]);
        }
      }
    };
    this.chrome = chrome;

    api = windowManager(chrome);
    cb();
  },

  fetchesTabInfoMinusSendingTab: function(test) {
    api.queryTabs(2, false, {}, 10)
    .then(function(data) {
      test.deepEqual(data, { tabs: [{id: 1}, {id: 3}], lastActive: null});
      test.equal(this.chrome.tabs.query.calls[0][0].windowId, 10);
      test.done();
    }.bind(this));
  },

  fetchesTabInfoMinusSendingTabInAllWindows: function(test) {
    api.queryTabs(2, true, {}, 10)
    .then(function(data) {
      test.deepEqual(data, { tabs: [{id: 1}, {id: 3}], lastActive: null});
      test.equal(this.chrome.tabs.query.calls[0][0].windowId, null);
      test.done();
    }.bind(this));
  },

  fetchesTabInfoPlusLastActive: function(test) {
    api.queryTabs(2, false, {1: [2, 3], 4: [5, 6]}, 1)
    .then(function(data) {
      test.deepEqual(data, { tabs: [{id: 1}, {id: 3}], lastActive: 2});
      test.done();
    });
  }
};
