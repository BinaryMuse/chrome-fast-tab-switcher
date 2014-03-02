var Q = require('q');
var tabBroker = require('../../src/js/client/tab_broker');

exports.query = {
  setUp: function(cb) {
    var chrome = {
      runtime: {
        sendMessage: function(opts, callback) {
          callback({tabs: [{id: 1}, {id: 2}, {id: 3}], lastActive: 2});
        }
      }
    };
    this.api = tabBroker(chrome);
    cb();
  },

  getsTabsInOrderFromServer: function(test) {
    this.api.query('', false)
    .then(function(tabs) {
      test.deepEqual(tabs, [{id: 2}, {id: 1}, {id: 3}]);
      test.done();
    });
  }
};

exports.switchTo = {
  setUp: function(cb) {
    var chrome = this.chrome = {
      runtime: {
        sendMessage: function(opts) {
          if (!chrome.runtime.sendMessage.calls) chrome.runtime.sendMessage.calls = [];
          chrome.runtime.sendMessage.calls.push(opts)
        }
      }
    };
    this.api = tabBroker(this.chrome);
    cb();
  },

  sendsMessageToChangeTabs: function(test) {
    this.api.switchTo({id: 123});
    test.deepEqual(this.chrome.runtime.sendMessage.calls[0], {switchToTabId: 123});
    test.done();
  }
};

exports.close = {
  setUp: function(cb) {
    var chrome = this.chrome = {
      runtime: {
        sendMessage: function(opts) {
          if (!chrome.runtime.sendMessage.calls) chrome.runtime.sendMessage.calls = [];
          chrome.runtime.sendMessage.calls.push(opts)
        }
      }
    };
    this.api = tabBroker(this.chrome);
    cb();
  },

  sendsMessageToCloseTab: function(test) {
    this.api.close({id: 123});
    test.deepEqual(this.chrome.runtime.sendMessage.calls[0], {closeTabId: 123});
    test.done();
  }
}
