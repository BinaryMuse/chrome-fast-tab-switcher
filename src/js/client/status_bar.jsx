var KeybindMixin = require('./keybind_mixin');

module.exports = React.createClass({
  mixins: [KeybindMixin],

  componentDidMount: function() {
    this.bindKey(['alt+a'], this.toggleSearchAllWindows);
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <label className='status'>
        <input type='checkbox' checked={this.props.searchAllWindows}
          onChange={this.onChange} />
        <span>Show tabs from <u>a</u>ll windows</span>
      </label>
      /* jshint ignore:end */
    );
  },

  toggleSearchAllWindows: function() {
    this.props.changeSearchAllWindows(!this.props.searchAllWindows);
  },

  onChange: function(evt) {
    this.props.changeSearchAllWindows(evt.target.checked);
  }
});
