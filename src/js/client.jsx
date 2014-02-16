var TabSwitcher = require('./client/tab_switcher.jsx');
var SwitcherModel = require('./client/switcher_model.js');

var model = new SwitcherModel();
model.fetchTabs();

/* jshint ignore:start */
React.renderComponent(<TabSwitcher model={model} />, document.getElementById('switcher'));
/* jshint ignore:end */
