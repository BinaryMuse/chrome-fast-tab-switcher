TabSwitcher = require './tab_switcher.coffee'
SwitcherModel = require './switcher_model.coffee'

model = new SwitcherModel()
model.fetchTabs()

React.renderComponent TabSwitcher(model: model), document.getElementById 'switcher'
