var stringSpanner = require('./string_spanner');

var MATCH_START = '<span class="match">';
var MATCH_END = '</span>';

module.exports = React.createClass({
  render: function() {
    return (
      /* jshint ignore:start */
      <li className={this.className()}
        onClick={this.onClick} onMouseEnter={this.onMouseEnter}>
        <div>
          <div className='bkg' style={this.iconBkg(this.props.tab)} />
          <span className='title'
            dangerouslySetInnerHTML={{__html: this.tabTitle(this.props.tab)}} />
        </div>
        <div className='url'
          dangerouslySetInnerHTML={{__html: this.tabUrl(this.props.tab)}} />
      </li>
      /* jshint ignore:end */
    );
  },

  iconBkg: function(tab) {
    return {backgroundImage: "url(" + tab.favIconUrl + ")"};
  },

  className: function() {
    return this.props.selected ? "selected" : "";
  },

  tabTitle: function(tab) {
    return stringSpanner(tab.title, this.props.filter, MATCH_START, MATCH_END);
  },

  tabUrl: function(tab) {
    return stringSpanner(tab.url, this.props.filter, MATCH_START, MATCH_END);
  },

  onMouseEnter: function(evt) {
    this.props.changeSelected(this.props.tab);
  },

  onClick: function(evt) {
    this.props.activateSelected();
  }
});
