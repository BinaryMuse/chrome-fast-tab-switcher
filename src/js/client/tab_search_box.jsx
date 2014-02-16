var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

module.exports = React.createClass({
  componentDidMount: function() {
    var input = this.refs.input.getDOMNode();
    input.focus();
    this.props.model.on('change:searchAllWindows', input.focus.bind(input));
  },

  onKeydown: function(evt) {
    switch (evt.which) {
    case KEY_ESC:
      this.props.model.emit('exit');
      break;
    case KEY_ENTER:
      if (this.props.model.tabs.length) this.props.model.activateSelected();
      break;
    case KEY_UP:
      this.props.model.setSelected(Math.max(0, this.props.model.selected - 1));
      evt.preventDefault();
      break;
    case KEY_DOWN:
      this.props.model.setSelected(Math.min(this.props.model.tabs.length - 1,
                                            this.props.model.selected + 1));
      evt.preventDefault();
      break;
    }
  },

  onKeyup: function(evt) {
    if ([KEY_ESC, KEY_ENTER, KEY_UP, KEY_DOWN].indexOf(evt.which) > -1) return;

    var current = this.refs.input.getDOMNode().value;
    this.props.model.setFilter(current);
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <input type='text' ref='input' onKeyDown={this.onKeydown} onKeyUp={this.onKeyup} />
      /* jshint ignore:end */
    );
  }
});
