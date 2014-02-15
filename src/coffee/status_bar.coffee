dom = React.DOM

module.exports = React.createClass
  componentDidMount: ->
    @props.model.on 'change:searchAllWindows', => @forceUpdate()

  onChange: (evt) ->
    @props.model.setSearchAllWindows evt.target.checked

  render: ->
    dom.label className: 'status',
      dom.input type: 'checkbox', checked: @props.model.searchAllWindows, onChange: @onChange
      dom.span null, 'Show tabs from all windows'
