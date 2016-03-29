Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var _require2 = require('../../nuclide-commons');

var array = _require2.array;

var classnames = require('classnames');

var NuclideTabs = React.createClass({
  displayName: 'NuclideTabs',

  propTypes: {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      tabContent: PropTypes.node.isRequired
    })).isRequired,
    activeTabName: PropTypes.string.isRequired,
    onActiveTabChange: PropTypes.func.isRequired,
    triggeringEvent: PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      triggeringEvent: 'onClick'
    };
  },

  _handleTabChange: function _handleTabChange(selectedTabName) {
    if (typeof this.props.onActiveTabChange === 'function') {
      this.props.onActiveTabChange(array.find(this.props.tabs, function (tab) {
        return tab.name === selectedTabName;
      }));
    }
  },

  _renderTabMenu: function _renderTabMenu() {
    var _this = this;

    var tabs = this.props.tabs.map(function (tab) {
      var handler = {};
      handler[_this.props.triggeringEvent] = _this._handleTabChange.bind(_this, tab.name);
      return React.createElement(
        'li',
        _extends({
          className: classnames({
            tab: true,
            active: _this.props.activeTabName === tab.name
          }),
          key: tab.name
        }, handler),
        React.createElement(
          'div',
          { className: 'title' },
          tab.tabContent
        )
      );
    });
    return React.createElement(
      'ul',
      { className: 'tab-bar list-inline inset-panel' },
      tabs
    );
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'nuclide-tabs' },
      this._renderTabMenu()
    );
  }
});
exports.NuclideTabs = NuclideTabs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUYWJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7SUFFTCxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOztnQkFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUM7O0lBQXpDLEtBQUssYUFBTCxLQUFLOztBQUNaLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFbEMsSUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRTNDLFdBQVMsRUFBRTtBQUNULFFBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDdEMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxnQkFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtLQUN0QyxDQUFDLENBQUMsQ0FBQyxVQUFVO0FBQ2QsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMscUJBQWlCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzVDLG1CQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0dBQzdDOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLHFCQUFlLEVBQUUsU0FBUztLQUMzQixDQUFDO0dBQ0g7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsZUFBdUIsRUFBRTtBQUN4QyxRQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7QUFDdEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFBLEdBQUc7ZUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGVBQWU7T0FBQSxDQUFDLENBQ2pFLENBQUM7S0FDSDtHQUNGOztBQUVELGdCQUFjLEVBQUEsMEJBQWlCOzs7QUFDN0IsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3RDLFVBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixhQUFPLENBQUMsTUFBSyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsTUFBSyxnQkFBZ0IsQ0FBQyxJQUFJLFFBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pGLGFBQ0U7OztBQUNFLG1CQUFTLEVBQUUsVUFBVSxDQUFDO0FBQ3BCLGVBQUcsRUFBRSxJQUFJO0FBQ1Qsa0JBQU0sRUFBRSxNQUFLLEtBQUssQ0FBQyxhQUFhLEtBQUssR0FBRyxDQUFDLElBQUk7V0FDOUMsQ0FBQyxBQUFDO0FBQ0gsYUFBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEFBQUM7V0FDVixPQUFPO1FBQ1g7O1lBQUssU0FBUyxFQUFDLE9BQU87VUFDbkIsR0FBRyxDQUFDLFVBQVU7U0FDWDtPQUNILENBQ0w7S0FDSCxDQUFDLENBQUM7QUFDSCxXQUNFOztRQUFJLFNBQVMsRUFBQyxpQ0FBaUM7TUFDNUMsSUFBSTtLQUNGLENBQ0w7R0FDSDs7QUFFRCxRQUFNLEVBQUEsa0JBQWlCO0FBQ3JCLFdBQ0U7O1FBQUssU0FBUyxFQUFDLGNBQWM7TUFDMUIsSUFBSSxDQUFDLGNBQWMsRUFBRTtLQUNsQixDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUMiLCJmaWxlIjoiTnVjbGlkZVRhYnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3Qge2FycmF5fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuZXhwb3J0IGNvbnN0IE51Y2xpZGVUYWJzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB0YWJDb250ZW50OiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZVRhYk5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvbkFjdGl2ZVRhYkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB0cmlnZ2VyaW5nRXZlbnQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJpZ2dlcmluZ0V2ZW50OiAnb25DbGljaycsXG4gICAgfTtcbiAgfSxcblxuICBfaGFuZGxlVGFiQ2hhbmdlKHNlbGVjdGVkVGFiTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlKFxuICAgICAgICBhcnJheS5maW5kKHRoaXMucHJvcHMudGFicywgdGFiID0+IHRhYi5uYW1lID09PSBzZWxlY3RlZFRhYk5hbWUpXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVyVGFiTWVudSgpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHRhYnMgPSB0aGlzLnByb3BzLnRhYnMubWFwKHRhYiA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0ge307XG4gICAgICBoYW5kbGVyW3RoaXMucHJvcHMudHJpZ2dlcmluZ0V2ZW50XSA9IHRoaXMuX2hhbmRsZVRhYkNoYW5nZS5iaW5kKHRoaXMsIHRhYi5uYW1lKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICB0YWI6IHRydWUsXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMucHJvcHMuYWN0aXZlVGFiTmFtZSA9PT0gdGFiLm5hbWUsXG4gICAgICAgICAgfSl9XG4gICAgICAgICAga2V5PXt0YWIubmFtZX1cbiAgICAgICAgICB7Li4uaGFuZGxlcn0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICAgICAge3RhYi50YWJDb250ZW50fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhYi1iYXIgbGlzdC1pbmxpbmUgaW5zZXQtcGFuZWxcIj5cbiAgICAgICAge3RhYnN9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10YWJzXCI+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJUYWJNZW51KCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxufSk7XG4iXX0=