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

var Tabs = React.createClass({
  displayName: 'Tabs',

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
exports.Tabs = Tabs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O2dCQUVBLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBekMsS0FBSyxhQUFMLEtBQUs7O0FBQ1osSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUVsQyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFcEMsV0FBUyxFQUFFO0FBQ1QsUUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUN0QyxVQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0tBQ3RDLENBQUMsQ0FBQyxDQUFDLFVBQVU7QUFDZCxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxxQkFBaUIsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDNUMsbUJBQWUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDN0M7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wscUJBQWUsRUFBRSxTQUFTO0tBQzNCLENBQUM7R0FDSDs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxlQUF1QixFQUFFO0FBQ3hDLFFBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtBQUN0RCxVQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQUEsR0FBRztlQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssZUFBZTtPQUFBLENBQUMsQ0FDakUsQ0FBQztLQUNIO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBaUI7OztBQUM3QixRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDdEMsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGFBQU8sQ0FBQyxNQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFLLGdCQUFnQixDQUFDLElBQUksUUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakYsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSxVQUFVLENBQUM7QUFDcEIsZUFBRyxFQUFFLElBQUk7QUFDVCxrQkFBTSxFQUFFLE1BQUssS0FBSyxDQUFDLGFBQWEsS0FBSyxHQUFHLENBQUMsSUFBSTtXQUM5QyxDQUFDLEFBQUM7QUFDSCxhQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQUFBQztXQUNWLE9BQU87UUFDWDs7WUFBSyxTQUFTLEVBQUMsT0FBTztVQUNuQixHQUFHLENBQUMsVUFBVTtTQUNYO09BQ0gsQ0FDTDtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7O1FBQUksU0FBUyxFQUFDLGlDQUFpQztNQUM1QyxJQUFJO0tBQ0YsQ0FDTDtHQUNIOztBQUVELFFBQU0sRUFBQSxrQkFBaUI7QUFDckIsV0FDRTs7UUFBSyxTQUFTLEVBQUMsY0FBYztNQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFO0tBQ2xCLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJUYWJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IHthcnJheX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbmV4cG9ydCBjb25zdCBUYWJzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB0YWJDb250ZW50OiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZVRhYk5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvbkFjdGl2ZVRhYkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB0cmlnZ2VyaW5nRXZlbnQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJpZ2dlcmluZ0V2ZW50OiAnb25DbGljaycsXG4gICAgfTtcbiAgfSxcblxuICBfaGFuZGxlVGFiQ2hhbmdlKHNlbGVjdGVkVGFiTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlKFxuICAgICAgICBhcnJheS5maW5kKHRoaXMucHJvcHMudGFicywgdGFiID0+IHRhYi5uYW1lID09PSBzZWxlY3RlZFRhYk5hbWUpXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICBfcmVuZGVyVGFiTWVudSgpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHRhYnMgPSB0aGlzLnByb3BzLnRhYnMubWFwKHRhYiA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0ge307XG4gICAgICBoYW5kbGVyW3RoaXMucHJvcHMudHJpZ2dlcmluZ0V2ZW50XSA9IHRoaXMuX2hhbmRsZVRhYkNoYW5nZS5iaW5kKHRoaXMsIHRhYi5uYW1lKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICB0YWI6IHRydWUsXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMucHJvcHMuYWN0aXZlVGFiTmFtZSA9PT0gdGFiLm5hbWUsXG4gICAgICAgICAgfSl9XG4gICAgICAgICAga2V5PXt0YWIubmFtZX1cbiAgICAgICAgICB7Li4uaGFuZGxlcn0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aXRsZVwiPlxuICAgICAgICAgICAge3RhYi50YWJDb250ZW50fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhYi1iYXIgbGlzdC1pbmxpbmUgaW5zZXQtcGFuZWxcIj5cbiAgICAgICAge3RhYnN9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10YWJzXCI+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJUYWJNZW51KCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxufSk7XG4iXX0=