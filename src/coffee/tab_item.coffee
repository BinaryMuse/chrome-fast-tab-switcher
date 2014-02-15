dom = React.DOM

module.exports = React.createClass
  styleForFavico: (ico) ->
    backgroundImage: "url(#{ico})"

  className: ->
    if @props.selected then "selected"

  onMouseEnter: (evt) ->
    @props.model.setSelected @props.index

  onClick: (evt) ->
    @props.model.activateSelected()

  render: ->
    dom.li className: @className(), onClick: @onClick, onMouseEnter: @onMouseEnter,
      dom.div null,
        dom.div className: 'bkg', style: @styleForFavico(@props.tab.favIconUrl)
        dom.span className: 'title', dangerouslySetInnerHTML: {__html: @props.tab._htmlTitle || @props.tab.title}
      dom.div className: 'url', dangerouslySetInnerHTML: {__html: @props.tab._htmlUrl || @props.tab.url}
