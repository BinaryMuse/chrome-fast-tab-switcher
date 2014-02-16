var TabItem = require('./tab_item.jsx');

module.exports = React.createClass({
  render: function() {
    return (
      /* jshint ignore:start */
      <ul>
        {this.props.tabs.map(function(tab, i) {
          return <TabItem tab={tab} key={tab.id}
            selected={this.props.selectedTab === tab} />;
        }.bind(this))}
      </ul>
      /* jshint ignore:end */
    );
  }
});
