Mousetrap.stopCallback = function() { return false; };
var TabSwitcher = require('./client/tab_switcher.jsx');

/* jshint ignore:start */
React.renderComponent(<TabSwitcher />, document.getElementById('switcher'));
/* jshint ignore:end */
