module.exports = React.createClass({
  componentDidMount: function() {
    this.props.model.on('change:searchAllWindows', this.forceUpdate.bind(this, null));
  },

  onChange: function(evt) {
    this.props.model.setSearchAllWindows(evt.target.checked);
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <label className='status'>
        <input type='checkbox' checked={this.props.model.searchAllWindows}
          onChange={this.onChange} />
        <span>'Show tabs from all windows'</span>
      </label>
      /* jshint ignore:end */
    );
  }
});
