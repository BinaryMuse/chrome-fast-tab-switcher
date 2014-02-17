var bus = require('./bus');

var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

module.exports = React.createClass({
  componentDidMount: function() {
    var input = this.refs.input.getDOMNode();
    input.focus();
    bus.on('change:searchAllWindows', input.focus.bind(input));
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <input type='text' ref='input' onKeyDown={this.onKeydown} onChange={this.onChange} />
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
