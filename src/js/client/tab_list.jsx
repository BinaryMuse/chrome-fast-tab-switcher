var TabItem = require('./tab_item.jsx');

module.exports = React.createClass({
  componentDidMount: function() {
    this.props.model.on('change:tabs', this.forceUpdate.bind(this, null));
    this.props.model.on('change:selected', this.forceUpdate.bind(this, null));
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <ul>
        {this.props.model.tabs.map(function(tab, i) {
          return <TabItem model={this.props.model} tab={tab} index={i}
            key={tab.id} selected={this.props.model.selected === i} />;
        }.bind(this))}
      </ul>
      /* jshint ignore:end */
    );
  }
});
