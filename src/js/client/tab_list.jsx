var TabItem = require('./tab_item.jsx');

module.exports = React.createClass({
  render: function() {
    return (
      /* jshint ignore:start */
      <ul>
        {this.props.tabs.map(function(tab, i) {
          return <TabItem tab={tab} key={tab.id} filter={this.props.filter}
            selected={this.props.selectedTab === tab}
            changeSelected={this.props.changeSelected}
            activateSelected={this.props.activateSelected}
            containerScrollTop={this.getScrollTop()}
            containerHeight={this.getHeight()}
            setContainerScrollTop={this.setScrollTop} />;
        }.bind(this))}
      </ul>
      /* jshint ignore:end */
    );
  },

  getHeight: function() {
    return this.getDOMNode().offsetHeight;
  },

  getScrollTop: function() {
    return this.getDOMNode().scrollTop;
  },

  setScrollTop: function(val) {
    this.getDOMNode().scrollTop = val;
  }
});
