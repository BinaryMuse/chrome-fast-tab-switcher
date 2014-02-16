var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function SwitcherModel() {
  EventEmitter.call(this);

  this.lastInput = '';
  this.searchTerm = null;
  this.tabs = [];
  this.selected = 0;
  searchAllWindows = localStorage.getItem('searchAllWindows');
  this.searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.tabs) {
      this.setTabs(request.tabs, request.lastActive);
      this.emit('fetch:tabs');
    }
  }.bind(this));
}

inherits(SwitcherModel, EventEmitter);

SwitcherModel.prototype.fetchTabs = function(cb) {
  if (cb) this.once('fetch:tabs', cb);
  chrome.runtime.sendMessage({sendTabData: true, searchAllWindows: this.searchAllWindows});
};

SwitcherModel.prototype.setTabs = function(tabs, lastSelectedId) {
  var firstTab = [];
  var otherTabs = [];
  for (var tab in tabs) {
    tab = tabs[tab];
    if (tab.id == lastSelectedId) firstTab.push(tab);
    else otherTabs.push(tab);
  }

  this.tabs = firstTab.concat(otherTabs);
  this._origTabs = this.tabs;
  this.setSelected(0);
  this.emit('change:tabs', this.tabs);
};

SwitcherModel.prototype.setSelected = function(index) {
  this.selected = parseInt(index, 10);
  this.emit('change:selected', this.selected);
};

SwitcherModel.prototype.setSearchAllWindows = function(val) {
  this.searchAllWindows = !!val;
  localStorage.setItem('searchAllWindows', JSON.stringify(this.searchAllWindows));
  this.emit('change:searchAllWindows');
  this.fetchTabs(function() {
    if (this.searchTerm) this.filterTabs(this.searchTerm);
  }.bind(this));
};

SwitcherModel.prototype.filterTabs = function(search) {
  this.searchTerm = search;
  for (var tab in this._origTabs) {
    tab = this._origTabs[tab];
    delete tab._htmlTitle;
    delete tab._htmlUrl;
  }

  var optsFor = function(field) {
    return {
      pre: "<span class='match'>",
      post: "</span>",
      extract: function(tab) { return tab[field]; }
    };
  };

  var titleMatches = fuzzy.filter(search, this._origTabs, optsFor('title'));
  var urlMatches = fuzzy.filter(search, this._origTabs, optsFor('url'));
  var newTabs = {};

  var match;
  for (var titleMatchIdx in titleMatches) {
    match = titleMatches[titleMatchIdx];
    match.original._htmlTitle = match.string;
    newTabs[match.original.id] = match;
  }

  for (var urlMatchIdx in urlMatches) {
    match = urlMatches[urlMatchIdx];
    match.original._htmlUrl = match.string;
    if (newTabs[match.original.id]) {
      var titleMatch = newTabs[match.original.id];
      if (match.score > titleMatch.score) {
        newTabs[match.original.id] = match;
      }
    } else {
      newTabs[match.original.id] = match;
    }
  }

  var values = [];
  for (var key in newTabs) {
    values.push(newTabs[key]);
  }

  this.tabs = values
    .sort(function(a, b) {
      return b.score - a.score;
    }).map(function(match) {
      return match.original;
    });

  this.setSelected(0);
  this.emit('change:tabs', this.tabs);
};

SwitcherModel.prototype.setFilter = function(filter) {
  if (filter != this.lastInput) {
    if (filter) this.filterTabs(filter);
    else this.resetFilter();
    this.lastInput = filter;
  }
};

SwitcherModel.prototype.resetFilter = function() {
  this.searchTerm = '';
  for (var tab in this._origTabs) {
    tab = this._origTabs[tab];
    delete this._origTabs[tab]._htmlTitle;
    delete this._origTabs[tab]._htmlUrl;
  }
  this.setTabs(this._origTabs);
};

SwitcherModel.prototype.activateSelected = function() {
  tab = this.tabs[this.selected];
  chrome.runtime.sendMessage({switchToTabId: tab.id});
  this.emit('exit');
};

module.exports = SwitcherModel;
