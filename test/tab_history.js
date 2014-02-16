var Q = require('q');
var tabHistory = require('../src/newjs/background/tab_history');
var api;

var localStorageWith = function(val) {
  return {
    local: {
      get: function(key, cb) {
        cb({lastTabs: val});
      }
    }
  }
};

var windowsWith = function(windows) {
  return {
    getAll: function(cb) {
      cb(windows);
    }
  }
};

var standardChrome = {
  storage: localStorageWith(JSON.stringify({1: [2, 3]})),
  windows: windowsWith([{id: 1}])
};

exports.withEmptyLocalStorage = {
  setUp: function(cb) {
    var chrome = {
      storage: localStorageWith(null),
      windows: windowsWith([])
    };

    api = tabHistory(chrome);
    cb();
  },

  returnsEmptyObject: function(test) {
    api.getRecentTabs().then(function(tabs) {
      test.deepEqual(tabs, {});
      test.done();
    });
  }
};

exports.withDataInLocalStorage = {
  setUp: function(cb) {
    var chrome = {
      storage: localStorageWith(JSON.stringify({1: [2, 3], 4: [5, 6]})),
      windows: windowsWith([{id: 1}, {id: 4}])
    };

    api = tabHistory(chrome);
    cb();
  },

  restoresFromLocalStorage: function(test) {
    api.getRecentTabs(true).then(function(tabs){
      test.deepEqual(tabs, {1:[2, 3], 4: [5, 6]});
      test.done();
    });
  },

  cachesResultsAfterFirstFetch: function(test) {
    api.getFromLocalStorage = function() {
      return Q.when({lastTabs: null});
    };

    api.getRecentTabs(true).then(function(tabs) {
      test.deepEqual(tabs, {});
      api.getFromLocalStorage = function() {
        return Q.when({lastTabs: JSON.stringify({1: [2, 3]})});
      };
    })
    .then(api.getRecentTabs)
    .then(function(tabs) {
      test.deepEqual(tabs, {});
      test.done();
    });
  }
};

exports.withMissingWindows = {
  setUp: function(cb) {
    var chrome = {
      storage: localStorageWith(JSON.stringify({1: [2, 3], 4: [5, 6]})),
      windows: windowsWith([{id: 1}])
    };

    api = tabHistory(chrome);
    cb();
  },

  doesntIncludeMissingWindows: function(test) {
    api.getRecentTabs(true).then(function(tabs){
      test.deepEqual(tabs, {1: [2, 3]});
      test.done();
    });
  }
};

exports.addRecentTab = {
  setUp: function(cb) {
    api = tabHistory(standardChrome);
    cb();
  },

  addsTabsToExistingHistory: function(test) {
    api.addRecentTab(1, 4)
    .then(api.getRecentTabs)
    .then(function(tabs) {
      test.deepEqual(tabs, {1: [3, 4]});
      test.done();
    });
  },

  createsNewHistory: function(test) {
    api.addRecentTab(2, 4)
    .then(api.getRecentTabs)
    .then(function(tabs) {
      test.deepEqual(tabs, {1: [2, 3], 2: [null, 4]});
      test.done();
    });
  }
};

exports.removeHistoryForWindow = {
  setUp: function(cb) {
    api = tabHistory(standardChrome);
    cb();
  },

  removesHistory: function(test) {
    api.removeHistoryForWindow(1)
    .then(api.getRecentTabs)
    .then(function(tabs) {
      test.deepEqual(tabs, {});
      test.done();
    });
  },
};
