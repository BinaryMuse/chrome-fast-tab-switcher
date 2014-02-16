var Q = require('q');
var tabDatabase = require('../../src/js/client/tab_database');

exports.query = {
  setUp: function(cb) {
    this.api = tabDatabase(null);
    this.api.fetchTabs = function() {
      return Q.when({tabs: [{id: 1}, {id: 2}, {id: 3}], lastActive: 2})
    };
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
