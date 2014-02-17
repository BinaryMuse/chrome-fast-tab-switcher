var bus = require('./bus');

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
    bus.emit('change:searchAllWindows', evt.target.checked);
  }
});
