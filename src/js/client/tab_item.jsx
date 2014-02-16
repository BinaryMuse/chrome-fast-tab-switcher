module.exports = React.createClass({
  styleForFavico: function(ico) {
    return {backgroundImage: "url(" + ico + ")"};
  },

  className: function() {
    return this.props.selected ? "selected" : "";
  },

  tabTitle: function(tab) {
    return tab._htmlTitle || tab.title;
  },

  tabUrl: function(tab) {
    return tab._htmlUrl || tab.url;
  },

  onMouseEnter: function(evt) {
    this.props.model.setSelected(this.props.index);
  },

  onClick: function(evt) {
    return this.props.model.activateSelected();
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <li className={this.className()} onClick={this.onClick} onMouseEnter={this.onMouseEnter}>
        <div>
          <div className='bkg' style={this.styleForFavico(this.props.tab.favIconUrl)} />
          <span className='title' dangerouslySetInnerHTML={{__html: this.tabTitle(this.props.tab)}} />
        </div>
        <div className='url' dangerouslySetInnerHTML={{__html: this.tabUrl(this.props.tab)}} />
      </li>
      /* jshint ignore:end */
    );
  }
});
