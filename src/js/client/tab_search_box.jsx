var KEY_BACKSPACE = 8;
var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

module.exports = React.createClass({
  componentDidUpdate: function() {
    this.refs.input.getDOMNode().focus();
    Mousetrap.stopCallback = function() { return false; };
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

  bindKey: function(key, fn) {
    Mousetrap.bind(key, function(e) {
      e.preventDefault();
      fn(e);
    }.bind(this));
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
