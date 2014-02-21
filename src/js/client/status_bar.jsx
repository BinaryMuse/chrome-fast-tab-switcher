module.exports = React.createClass({
  render: function() {
    return (
      /* jshint ignore:start */
      <label className='status'>
        <input type='checkbox' checked={this.props.searchAllWindows}
          onChange={this.onChange} />
        <span>Show tabs from all windows</span>
      </label>
      /* jshint ignore:end */
    );
  },

  onChange: function(evt) {
    this.props.changeSearchAllWindows(evt.target.checked);
  }
});
