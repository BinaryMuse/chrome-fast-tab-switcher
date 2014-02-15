(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
var SwitcherModel, TabSwitcher, model;

TabSwitcher = require('./tab_switcher.coffee');

SwitcherModel = require('./switcher_model.coffee');

model = new SwitcherModel();

model.fetchTabs();

React.renderComponent(TabSwitcher({
  model: model
}), document.getElementById('switcher'));


},{"./switcher_model.coffee":4,"./tab_switcher.coffee":8}],3:[function(require,module,exports){
var dom;

dom = React.DOM;

module.exports = React.createClass({
  componentDidMount: function() {
    return this.props.model.on('change:searchAllWindows', (function(_this) {
      return function() {
        return _this.forceUpdate();
      };
    })(this));
  },
  onChange: function(evt) {
    return this.props.model.setSearchAllWindows(evt.target.checked);
  },
  render: function() {
    return dom.label({
      className: 'status'
    }, dom.input({
      type: 'checkbox',
      checked: this.props.model.searchAllWindows,
      onChange: this.onChange
    }), dom.span(null, 'Show tabs from all windows'));
  }
});


},{}],4:[function(require,module,exports){
var EventEmitter, SwitcherModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('events').EventEmitter;

module.exports = SwitcherModel = (function(_super) {
  __extends(SwitcherModel, _super);

  function SwitcherModel() {
    this.activateSelected = __bind(this.activateSelected, this);
    this.resetFilter = __bind(this.resetFilter, this);
    this.filterTabs = __bind(this.filterTabs, this);
    this.setSearchAllWindows = __bind(this.setSearchAllWindows, this);
    this.setSelected = __bind(this.setSelected, this);
    this.setTabs = __bind(this.setTabs, this);
    this.fetchTabs = __bind(this.fetchTabs, this);
    var searchAllWindows;
    SwitcherModel.__super__.constructor.call(this);
    this.lastInput = '';
    this.searchTerm = null;
    this.tabs = [];
    this.selected = 0;
    searchAllWindows = localStorage.getItem('searchAllWindows');
    this.searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;
    chrome.runtime.onMessage.addListener((function(_this) {
      return function(request, sender, sendResponse) {
        if (request.tabs) {
          _this.setTabs(request.tabs, request.lastActive);
          return _this.emit('fetch:tabs');
        }
      };
    })(this));
  }

  SwitcherModel.prototype.fetchTabs = function(cb) {
    if (cb != null) {
      this.once('fetch:tabs', cb);
    }
    return chrome.runtime.sendMessage({
      sendTabData: true,
      searchAllWindows: this.searchAllWindows
    });
  };

  SwitcherModel.prototype.setTabs = function(tabs, lastSelectedId) {
    var firstTab, otherTabs, tab, _i, _len;
    firstTab = [];
    otherTabs = [];
    for (_i = 0, _len = tabs.length; _i < _len; _i++) {
      tab = tabs[_i];
      if (tab.id === lastSelectedId) {
        firstTab.push(tab);
      } else {
        otherTabs.push(tab);
      }
    }
    this.tabs = firstTab.concat(otherTabs);
    this._origTabs = this.tabs;
    this.setSelected(0);
    return this.emit('change:tabs', this.tabs);
  };

  SwitcherModel.prototype.setSelected = function(index) {
    this.selected = parseInt(index, 10);
    return this.emit('change:selected', this.selected);
  };

  SwitcherModel.prototype.setSearchAllWindows = function(val) {
    this.searchAllWindows = !!val;
    localStorage.setItem('searchAllWindows', JSON.stringify(this.searchAllWindows));
    this.emit('change:searchAllWindows');
    return this.fetchTabs((function(_this) {
      return function() {
        if (_this.searchTerm != null) {
          return _this.filterTabs(_this.searchTerm);
        }
      };
    })(this));
  };

  SwitcherModel.prototype.filterTabs = function(search) {
    var key, match, newTabs, optsFor, tab, titleMatch, titleMatches, urlMatches, value, values, _i, _j, _k, _len, _len1, _len2, _ref;
    this.searchTerm = search;
    _ref = this._origTabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tab = _ref[_i];
      delete tab._htmlTitle;
      delete tab._htmlUrl;
    }
    optsFor = function(field) {
      return {
        pre: "<span class='match'>",
        post: "</span>",
        extract: function(tab) {
          return tab[field];
        }
      };
    };
    titleMatches = fuzzy.filter(search, this._origTabs, optsFor('title'));
    urlMatches = fuzzy.filter(search, this._origTabs, optsFor('url'));
    newTabs = {};
    for (_j = 0, _len1 = titleMatches.length; _j < _len1; _j++) {
      match = titleMatches[_j];
      match.original._htmlTitle = match.string;
      newTabs[match.original.id] = match;
    }
    for (_k = 0, _len2 = urlMatches.length; _k < _len2; _k++) {
      match = urlMatches[_k];
      match.original._htmlUrl = match.string;
      if (titleMatch = newTabs[match.original.id]) {
        if (match.score > titleMatch.score) {
          newTabs[match.original.id] = match;
        }
      } else {
        newTabs[match.original.id] = match;
      }
    }
    values = (function() {
      var _results;
      _results = [];
      for (key in newTabs) {
        value = newTabs[key];
        _results.push(value);
      }
      return _results;
    })();
    this.tabs = values.sort(function(a, b) {
      return b.score - a.score;
    }).map(function(match) {
      return match.original;
    });
    this.setSelected(0);
    return this.emit('change:tabs', this.tabs);
  };

  SwitcherModel.prototype.resetFilter = function() {
    var tab, _i, _len, _ref;
    this.searchTerm = '';
    _ref = this._origTabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tab = _ref[_i];
      delete tab._htmlTitle;
      delete tab._htmlUrl;
    }
    return this.setTabs(this._origTabs);
  };

  SwitcherModel.prototype.activateSelected = function() {
    var tab;
    tab = this.tabs[this.selected];
    return chrome.runtime.sendMessage({
      switchToTabId: tab.id
    });
  };

  return SwitcherModel;

})(EventEmitter);


},{"events":1}],5:[function(require,module,exports){
var dom;

dom = React.DOM;

module.exports = React.createClass({
  styleForFavico: function(ico) {
    return {
      backgroundImage: "url(" + ico + ")"
    };
  },
  className: function() {
    if (this.props.selected) {
      return "selected";
    }
  },
  onMouseEnter: function(evt) {
    return this.props.model.setSelected(this.props.index);
  },
  onClick: function(evt) {
    return this.props.model.activateSelected();
  },
  render: function() {
    return dom.li({
      className: this.className(),
      onClick: this.onClick,
      onMouseEnter: this.onMouseEnter
    }, dom.div(null, dom.div({
      className: 'bkg',
      style: this.styleForFavico(this.props.tab.favIconUrl)
    }), dom.span({
      className: 'title',
      dangerouslySetInnerHTML: {
        __html: this.props.tab._htmlTitle || this.props.tab.title
      }
    })), dom.div({
      className: 'url',
      dangerouslySetInnerHTML: {
        __html: this.props.tab._htmlUrl || this.props.tab.url
      }
    }));
  }
});


},{}],6:[function(require,module,exports){
var TabItem, dom;

TabItem = require('./tab_item.coffee');

dom = React.DOM;

module.exports = React.createClass({
  componentDidMount: function() {
    this.props.model.on('change:tabs', (function(_this) {
      return function() {
        return _this.forceUpdate();
      };
    })(this));
    return this.props.model.on('change:selected', (function(_this) {
      return function() {
        return _this.forceUpdate();
      };
    })(this));
  },
  render: function() {
    var index, tab;
    return dom.ul(null, (function() {
      var _i, _len, _ref, _results;
      _ref = this.props.model.tabs;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        tab = _ref[index];
        _results.push(TabItem({
          model: this.props.model,
          tab: tab,
          index: index,
          selected: this.props.model.selected === index
        }));
      }
      return _results;
    }).call(this));
  }
});


},{"./tab_item.coffee":5}],7:[function(require,module,exports){
var KEY_DOWN, KEY_ENTER, KEY_ESC, KEY_UP, dom;

dom = React.DOM;

KEY_ENTER = 13;

KEY_ESC = 27;

KEY_UP = 38;

KEY_DOWN = 40;

module.exports = React.createClass({
  componentDidMount: function() {
    this.refs.input.getDOMNode().focus();
    return this.props.model.on('change:searchAllWindows', (function(_this) {
      return function() {
        return _this.refs.input.getDOMNode().focus();
      };
    })(this));
  },
  onKeydown: function(evt) {
    switch (evt.which) {
      case KEY_ESC:
        return this.close();
      case KEY_ENTER:
        if (this.props.model.tabs.length) {
          this.props.model.activateSelected();
          return this.close();
        }
        break;
      case KEY_UP:
        this.props.model.setSelected(Math.max(0, this.props.model.selected - 1));
        return evt.preventDefault();
      case KEY_DOWN:
        this.props.model.setSelected(Math.min(this.props.model.tabs.length - 1, this.props.model.selected + 1));
        return evt.preventDefault();
    }
  },
  onKeyup: function(evt) {
    var current, _ref;
    if ((_ref = evt.which) === KEY_ESC || _ref === KEY_ENTER || _ref === KEY_UP || _ref === KEY_DOWN) {
      return;
    }
    current = this.refs.input.getDOMNode().value;
    if (current !== this.props.model.lastInput) {
      if (current) {
        this.props.model.filterTabs(current);
      } else {
        this.props.model.resetFilter();
      }
      return this.props.model.lastInput = current;
    }
  },
  close: function() {
    return window.close();
  },
  render: function() {
    return dom.input({
      type: 'text',
      ref: 'input',
      onKeyDown: this.onKeydown,
      onKeyUp: this.onKeyup
    });
  }
});


},{}],8:[function(require,module,exports){
var StatusBar, TabList, TabSearchBox, dom;

TabSearchBox = require('./tab_search_box.coffee');

TabList = require('./tab_list.coffee');

StatusBar = require('./status_bar.coffee');

dom = React.DOM;

module.exports = React.createClass({
  render: function() {
    return dom.div(null, TabSearchBox({
      model: this.props.model
    }), TabList({
      model: this.props.model
    }), StatusBar({
      model: this.props.model
    }));
  }
});


},{"./status_bar.coffee":3,"./tab_list.coffee":6,"./tab_search_box.coffee":7}]},{},[2])