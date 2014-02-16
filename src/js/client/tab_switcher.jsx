var TabSearchBox = require('./tab_search_box.jsx');
var TabList = require('./tab_list.jsx');
var StatusBar = require('./status_bar.jsx');

module.exports = React.createClass({
  componentDidMount: function() {
    this.props.model.on('exit', this.close.bind(this));
  },

  close: function() {
    window.close();
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <div>
        <TabSearchBox model={this.props.model} />
        <TabList model={this.props.model} />
        <StatusBar model={this.props.model} />
      </div>
      /* jshint ignore:end */
    );
  }
});
