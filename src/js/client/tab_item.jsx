var bus = require('./bus');

module.exports = React.createClass({
  iconBkg: function(tab) {
    return {backgroundImage: "url(" + tab.favIconUrl + ")"};
  },

  className: function() {
    return this.props.selected ? "selected" : "";
  },

  // TODO: move into new 'string spanner'
  tabTitle: function(tab) {
    return tab._htmlTitle || tab.title;
  },

  tabUrl: function(tab) {
    return tab._htmlUrl || tab.url;
  },

  onMouseEnter: function(evt) {
    bus.emit('change:selected', this.props.tab);
  },

  onClick: function(evt) {
    bus.emit('action:activate');
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <li className={this.className()} onClick={this.onClick} onMouseEnter={this.onMouseEnter}>
        <div>
          <div className='bkg' style={this.iconBkg(this.props.tab)} />
          <span className='title' dangerouslySetInnerHTML={{__html: this.tabTitle(this.props.tab)}} />
        </div>
        <div className='url' dangerouslySetInnerHTML={{__html: this.tabUrl(this.props.tab)}} />
      </li>
      /* jshint ignore:end */
    );
  }
});
