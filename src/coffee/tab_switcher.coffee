TabSearchBox = require './tab_search_box.coffee'
TabList = require './tab_list.coffee'
StatusBar = require './status_bar.coffee'
dom = React.DOM

module.exports = React.createClass
  render: ->
    dom.div null,
      TabSearchBox(model: @props.model)
      TabList(model: @props.model)
      StatusBar(model: @props.model)
