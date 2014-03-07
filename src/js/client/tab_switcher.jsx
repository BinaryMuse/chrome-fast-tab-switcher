var stringScore = require('../../../lib/string_score');
var tabBroker = require('./tab_broker')(chrome);
var tabFilter = require('./tab_filter')(stringScore);

var TabSearchBox = require('./tab_search_box.jsx');
var TabList = require('./tab_list.jsx');
var StatusBar = require('./status_bar.jsx');

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
    window.onblur = this.close;
    this.refreshTabs();
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <div>
        <TabSearchBox
          filter={this.state.filter}
          exit={this.close}
          changeFilter={this.changeFilter}
          activateSelected={this.activateSelected}
          modifySelected={this.modifySelected}
          closeSelected={this.closeSelected} />
        <TabList
          tabs={this.filteredTabs()}
          filter={this.state.filter}
          selectedTab={this.getSelected()}
          changeSelected={this.changeSelected}
          activateSelected={this.activateSelected}
          closeSelected={this.closeSelected} />
        <StatusBar
          searchAllWindows={this.state.searchAllWindows}
          changeSearchAllWindows={this.changeSearchAllWindows} />
      </div>
      /* jshint ignore:end */
    );
  },

  refreshTabs: function() {
    tabBroker.query(this.state.searchAllWindows)
    .then(function(tabs) {
      this.setState({tabs: tabs, selected: null});
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

  getSelected: function() {
    return this.state.selected || this.filteredTabs()[0];
  },

  activateSelected: function() {
    var selected = this.getSelected();
    if (selected) {
      tabBroker.switchTo(selected);
      this.close();
    }
  },

  closeSelected: function() {
    /* jshint expr: true */
    var selected = this.getSelected();
    var index = this.state.tabs.indexOf(selected);

    if (selected) {
      this.modifySelected(1) || this.modifySelected(-1);
    }

    if (index > -1) {
      var tabs = this.state.tabs;
      tabs.splice(index, 1);
      this.setState({tabs: tabs});
    }

    tabBroker.close(selected);
  },

  changeFilter: function(newFilter) {
    this.setState({filter: newFilter, selected: null});
  },

  changeSelected: function(tab) {
    this.setState({selected: tab});
  },

  modifySelected: function(change) {
    var filteredTabs = this.filteredTabs();
    if (!filteredTabs.length) return;

    var currentIndex = filteredTabs.indexOf(this.getSelected());
    var newIndex = currentIndex + change;
    if (newIndex < 0) return false;
    if (newIndex >= filteredTabs.length) return false;
    var newTab = filteredTabs[newIndex];
    this.changeSelected(newTab);
    return true;
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
