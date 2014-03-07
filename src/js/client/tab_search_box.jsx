var KeybindMixin = require('./keybind_mixin');

module.exports = React.createClass({
  mixins: [KeybindMixin],

  componentDidUpdate: function() {
    this.refs.input.getDOMNode().focus();
  },

  componentDidMount: function() {
    this.bindKey('esc', this.props.exit);
    this.bindKey('enter', this.props.activateSelected);
    this.bindKey('up', this.selectPrevious);
    this.bindKey('down', this.selectNext);
  },

  componentWillUnmount: function() {
    Mousetrap.reset();
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <input type='text' ref='input' autoFocus='true' onChange={this.onChange} />
      /* jshint ignore:end */
    );
  },

  selectPrevious: function() {
    this.props.modifySelected(-1);
  },

  selectNext: function() {
    this.props.modifySelected(1);
  },

  onChange: function(evt) {
    if (event.target.value !== this.props.filter)
      this.props.changeFilter(event.target.value);
  }
});
