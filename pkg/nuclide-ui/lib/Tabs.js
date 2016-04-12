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
      this.props.onActiveTabChange(this.props.tabs.find(function (tab) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFbEMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRXBDLFdBQVMsRUFBRTtBQUNULFFBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDdEMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxnQkFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtLQUN0QyxDQUFDLENBQUMsQ0FBQyxVQUFVO0FBQ2QsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMscUJBQWlCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzVDLG1CQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0dBQzdDOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLHFCQUFlLEVBQUUsU0FBUztLQUMzQixDQUFDO0dBQ0g7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsZUFBdUIsRUFBRTtBQUN4QyxRQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7QUFDdEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRztlQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssZUFBZTtPQUFBLENBQUMsQ0FDMUQsQ0FBQztLQUNIO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBaUI7OztBQUM3QixRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDdEMsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGFBQU8sQ0FBQyxNQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFLLGdCQUFnQixDQUFDLElBQUksUUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakYsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSxVQUFVLENBQUM7QUFDcEIsZUFBRyxFQUFFLElBQUk7QUFDVCxrQkFBTSxFQUFFLE1BQUssS0FBSyxDQUFDLGFBQWEsS0FBSyxHQUFHLENBQUMsSUFBSTtXQUM5QyxDQUFDLEFBQUM7QUFDSCxhQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQUFBQztXQUNWLE9BQU87UUFDWDs7WUFBSyxTQUFTLEVBQUMsT0FBTztVQUNuQixHQUFHLENBQUMsVUFBVTtTQUNYO09BQ0gsQ0FDTDtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7O1FBQUksU0FBUyxFQUFDLGlDQUFpQztNQUM1QyxJQUFJO0tBQ0YsQ0FDTDtHQUNIOztBQUVELFFBQU0sRUFBQSxrQkFBaUI7QUFDckIsV0FDRTs7UUFBSyxTQUFTLEVBQUMsY0FBYztNQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFO0tBQ2xCLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJUYWJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbmV4cG9ydCBjb25zdCBUYWJzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHRhYnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICB0YWJDb250ZW50OiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZVRhYk5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvbkFjdGl2ZVRhYkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB0cmlnZ2VyaW5nRXZlbnQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJpZ2dlcmluZ0V2ZW50OiAnb25DbGljaycsXG4gICAgfTtcbiAgfSxcblxuICBfaGFuZGxlVGFiQ2hhbmdlKHNlbGVjdGVkVGFiTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aXZlVGFiQ2hhbmdlKFxuICAgICAgICB0aGlzLnByb3BzLnRhYnMuZmluZCh0YWIgPT4gdGFiLm5hbWUgPT09IHNlbGVjdGVkVGFiTmFtZSlcbiAgICAgICk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJUYWJNZW51KCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgdGFicyA9IHRoaXMucHJvcHMudGFicy5tYXAodGFiID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB7fTtcbiAgICAgIGhhbmRsZXJbdGhpcy5wcm9wcy50cmlnZ2VyaW5nRXZlbnRdID0gdGhpcy5faGFuZGxlVGFiQ2hhbmdlLmJpbmQodGhpcywgdGFiLm5hbWUpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIHRhYjogdHJ1ZSxcbiAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5wcm9wcy5hY3RpdmVUYWJOYW1lID09PSB0YWIubmFtZSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBrZXk9e3RhYi5uYW1lfVxuICAgICAgICAgIHsuLi5oYW5kbGVyfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpdGxlXCI+XG4gICAgICAgICAgICB7dGFiLnRhYkNvbnRlbnR9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFiLWJhciBsaXN0LWlubGluZSBpbnNldC1wYW5lbFwiPlxuICAgICAgICB7dGFic31cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfSxcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRhYnNcIj5cbiAgICAgICAge3RoaXMuX3JlbmRlclRhYk1lbnUoKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59KTtcbiJdfQ==