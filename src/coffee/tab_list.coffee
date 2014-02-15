TabItem = require './tab_item.coffee'
dom = React.DOM

module.exports = React.createClass
  componentDidMount: ->
    @props.model.on 'change:tabs', => @forceUpdate()
    @props.model.on 'change:selected', => @forceUpdate()

  render: ->
    dom.ul null,
      for tab, index in @props.model.tabs
        TabItem(model: @props.model, tab: tab, index: index, selected: @props.model.selected is index)
