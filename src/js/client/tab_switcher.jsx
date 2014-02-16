var bus = require('./bus');
var stringScore = require('../../../vendor/string_score');
var tabDatabase = require('./tab_database')(chrome);
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
    return {
      filter: '',
      selected: null,
      tabs: [],
      searchAllWindows: false
    };
  },

  refreshTabs: function() {
    tabDatabase.query(this.state.filter, this.state.searchAllWindows)
    .then(function(tabs) {
      this.setState({tabs: tabs}, function() {
        this.setState({selected: this.filteredTabs()[0]})
      }.bind(this));
    }.bind(this))
  },

  // We're calculating this on the fly each time instead of caching
  // it in the state because it is very much fast enough, and
  // simplifies some race-y areas of the component's lifecycle.
  filteredTabs: function() {
    if (this.state.filter.length) {
      return tabFilter(this.state.filter, this.state.tabs)
      .map(function(result) {
        return result.tab;
      });
    } else {
      return this.state.tabs;
    }
  },

  componentDidMount: function() {
    bus.on('change:filter', function(newFilter) {
      this.setState({filter: newFilter}, function() {
        this.setState({selected: this.filteredTabs(newFilter)[0]});
      }.bind(this));
    }.bind(this));

    // TODO: DRY
    bus.on('select:previous', function() {
      var filteredTabs = this.filteredTabs();
      if (!filteredTabs.length) return;

      var currentIndex = filteredTabs.indexOf(this.state.selected);
      var newIndex = Math.max(0, currentIndex - 1);
      var newTab = filteredTabs[newIndex];
      bus.emit('change:selected', newTab);
    }.bind(this));

    bus.on('select:next', function() {
      var filteredTabs = this.filteredTabs();
      if (!filteredTabs.length) return;

      var currentIndex = filteredTabs.indexOf(this.state.selected);
      var newIndex = Math.min(filteredTabs.length - 1, currentIndex + 1);
      var newTab = filteredTabs[newIndex];
      bus.emit('change:selected', newTab);
    }.bind(this));

    bus.on('change:selected', function(tab) {
      this.setState({selected: tab});
    }.bind(this));

    bus.on('change:searchAllWindows', function(value) {
      // TODO: move into a model
      localStorage.setItem('searchAllWindows', JSON.stringify(value));
      this.setState({searchAllWindows: value}, this.refreshTabs);
    }.bind(this));

    bus.on('action:activate', function() {
      if (this.state.selected) {
        tabDatabase.switchTo(this.state.selected);
        bus.emit('exit');
      }
    }.bind(this));

    bus.on('exit', this.close);

    // TODO: move into a model
    var searchAllWindows = localStorage.getItem('searchAllWindows');
    searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;
    this.setState({searchAllWindows: searchAllWindows}, this.refreshTabs);
  },

  close: function() {
    window.close();
  },

  render: function() {
    var filteredTabs = this.filteredTabs();
    return (
      /* jshint ignore:start */
      <div>
        <TabSearchBox filter={this.state.filter} />
        <TabList tabs={filteredTabs}
          selectedTab={this.state.selected} />
        <StatusBar searchAllWindows={this.state.searchAllWindows} />
      </div>
      /* jshint ignore:end */
    );
  }
});
