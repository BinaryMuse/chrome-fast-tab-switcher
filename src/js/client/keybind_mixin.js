module.exports = {
  componentWillMount: function() {
    this._boundKeys = [];
  },

  bindKey: function(key, fn) {
    this._boundKeys.push(key);
    Mousetrap.bind(key, function(evt) {
      evt.preventDefault();
      fn(evt);
    }.bind(this));
  },

  componentWillUnmount: function() {
    this._boundKeys.map(Mousetrap.unbind)
  }
};
