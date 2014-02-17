var bus = require('./bus');
var stringScore = require('../../../vendor/string_score');
var tabBroker = require('./tab_broker')(chrome);
var tabFilter = require('./tab_filter')(stringScore);

var TabSearchBox = require('./tab_search_box.jsx');
var TabList = require('./tab_list.jsx');
var StatusBar = require('./status_bar.jsx');

/**
 * TabSwitcher is the main component of our application. It contains
 * all the state, and all other components communicate their intent
 * to change that state via events on the bus (which is a Node.js
 * EventEmitter). All child components receive their data via properties.
 *
 * Bus events:
 * - change:searchAllWindows(boolean) - the 'search all windows'
 *   option was toggled
 * - change:filter(string) - the filter text was changed
 * - change:selected(tab) - the selected tab was changed
 * - action:activate - the user wishes to swich to the currently
 *   selected tab
 * - select:previous - the tab above the selected one should be selected
 * - select:next - the tab below the selected one should be selected
 * - exit - the extension should exit, closing the window
 */

module.exports = React.createClass({
  getInitialState: function() {
    // TODO: move into a model
    var searchAllWindows = localStorage.getItem('searchAllWindows');
    try {
      searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;
    } catch (error) {
      searchAllWindows = false;
    }

    return {
      filter: '',
      selected: null,
      tabs: [],
      searchAllWindows: searchAllWindows
    };
  },

  componentDidMount: function() {
    bus.on('change:filter', this.changeFilter);
    bus.on('change:selected', this.changeSelected);
    bus.on('change:searchAllWindows', this.changeSearchAllWindows);
    bus.on('select:previous', this.moveSelection.bind(this, -1));
    bus.on('select:next', this.moveSelection.bind(this, 1));
    bus.on('action:activate', this.activateSelection);
    bus.on('exit', this.close);
    window.onblur = this.close;

    this.refreshTabs();
  },

  render: function() {
    var filteredTabs = this.filteredTabs();
    return (
      /* jshint ignore:start */
      <div>
        <TabSearchBox filter={this.state.filter} />
        <TabList tabs={filteredTabs} filter={this.state.filter}
          selectedTab={this.state.selected} />
        <StatusBar searchAllWindows={this.state.searchAllWindows} />
      </div>
      /* jshint ignore:end */
    );
  },

  refreshTabs: function() {
    tabBroker.query(this.state.searchAllWindows)
    .then(function(tabs) {
      this.setState({tabs: tabs}, function() {
        this.setState({selected: this.filteredTabs()[0]});
      }.bind(this));
    }.bind(this));
  },

  // We're calculating this on the fly each time instead of caching
  // it in the state because it is very much fast enough, and
  // simplifies some race-y areas of the component's lifecycle.
  filteredTabs: function() {
    if (this.state.filter.trim().length) {
      return tabFilter(this.state.filter, this.state.tabs)
      .map(function(result) {
        return result.tab;
      });
    } else {
      return this.state.tabs;
    }
  },

  activateSelection: function() {
    if (this.state.selected) {
      tabBroker.switchTo(this.state.selected);
      bus.emit('exit');
    }
  },

  changeFilter: function(newFilter) {
    this.setState({filter: newFilter}, function() {
      this.setState({selected: this.filteredTabs()[0]});
    });
  },

  changeSelected: function(tab) {
    this.setState({selected: tab});
  },

  moveSelection: function(change) {
    var filteredTabs = this.filteredTabs();
    if (!filteredTabs.length) return;

    var currentIndex = filteredTabs.indexOf(this.state.selected);
    var newIndex = currentIndex + change;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= filteredTabs.length) newIndex = filteredTabs.length - 1;
    var newTab = filteredTabs[newIndex];
    bus.emit('change:selected', newTab);
  },

  changeSearchAllWindows: function(value) {
    // TODO: move into a model
    localStorage.setItem('searchAllWindows', JSON.stringify(value));
    this.setState({searchAllWindows: value}, this.refreshTabs);
  },

  close: function() {
    window.close();
  }
});
