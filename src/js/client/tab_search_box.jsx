var bus = require('./bus');

var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

module.exports = React.createClass({
  componentDidUpdate: function() {
    this.refs.input.getDOMNode().focus();
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <input type='text' ref='input' autoFocus='true'
        onKeyDown={this.onKeydown} onChange={this.onChange} />
      /* jshint ignore:end */
    );
  },

  onKeydown: function(evt) {
    switch (evt.which) {
    case KEY_ESC:
      bus.emit('exit');
      break;
    case KEY_ENTER:
      bus.emit('action:activate');
      break;
    case KEY_UP:
      bus.emit('select:previous');
      evt.preventDefault();
      break;
    case KEY_DOWN:
      bus.emit('select:next');
      evt.preventDefault();
      break;
    }
  },

  onChange: function(evt) {
    if (event.target.value !== this.props.filter)
      bus.emit('change:filter', event.target.value);
  }
});
