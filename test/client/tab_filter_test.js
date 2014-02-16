var tabFilter = require('../../src/js/client/tab_filter');

exports.filter = {
  setUp: function(cb) {
    var matches = {
      'One': 0.5,
      'http://one': 0.5,
      'Two': 0,
      'http://two': 0,
      'Three': 0,
      'http://three': 0.9
    };

    var simpleScorer = function(target, filter) {
      return matches[target];
    };

    this.filter = tabFilter(simpleScorer);
    cb();
  },

  sortsByScore: function(test) {
    var tab1 = { id: 1, title: 'One', url: 'http://one' };
    var tab2 = { id: 2, title: 'Two', url: 'http://two' };
    var tab3 = { id: 3, title: 'Three', url: 'http://three' };

    var sorted = this.filter('fakeQuery', [tab1, tab2, tab3]);
    test.deepEqual(sorted, [
      { tab: { id: 1, title: 'One', url: 'http://one' }, score: 1.0 },
      { tab: { id: 3, title: 'Three', url: 'http://three' }, score: 0.9 }
    ]);
    test.done();
  }
};
