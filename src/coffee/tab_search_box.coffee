dom = React.DOM

KEY_ENTER = 13
KEY_ESC = 27
KEY_UP = 38
KEY_DOWN = 40

module.exports = React.createClass
  componentDidMount: ->
    @refs.input.getDOMNode().focus()
    @props.model.on 'change:searchAllWindows', =>
      @refs.input.getDOMNode().focus()

  onKeydown: (evt) ->
    switch evt.which
      when KEY_ESC
        @close()
      when KEY_ENTER
        if @props.model.tabs.length
          @props.model.activateSelected()
          @close()
      when KEY_UP
        @props.model.setSelected Math.max(0, @props.model.selected - 1)
        evt.preventDefault()
      when KEY_DOWN
        @props.model.setSelected Math.min(@props.model.tabs.length - 1, @props.model.selected + 1)
        evt.preventDefault()

  onKeyup: (evt) ->
    return if evt.which in [KEY_ESC, KEY_ENTER, KEY_UP, KEY_DOWN]

    current = @refs.input.getDOMNode().value
    if current != @props.model.lastInput
      if current
        @props.model.filterTabs current
      else
        @props.model.resetFilter()
      @props.model.lastInput = current

  close: ->
    window.close()

  render: ->
    dom.input type: 'text', ref: 'input', onKeyDown: @onKeydown, onKeyUp: @onKeyup
