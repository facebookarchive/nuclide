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

var _require2 = require('../../../commons');

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

module.exports = NuclideTabs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUYWJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O2dCQUVBLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQzs7SUFBcEMsS0FBSyxhQUFMLEtBQUs7O0FBQ1osSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUV6QyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFcEMsV0FBUyxFQUFFO0FBQ1QsUUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUN0QyxVQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0tBQ3RDLENBQUMsQ0FBQyxDQUFDLFVBQVU7QUFDZCxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxxQkFBaUIsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDNUMsbUJBQWUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDN0M7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wscUJBQWUsRUFBRSxTQUFTO0tBQzNCLENBQUM7R0FDSDs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxlQUF1QixFQUFFO0FBQ3hDLFFBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtBQUN0RCxVQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQUEsR0FBRztlQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssZUFBZTtPQUFBLENBQUMsQ0FDakUsQ0FBQztLQUNIO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBaUI7OztBQUM3QixRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDdEMsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGFBQU8sQ0FBQyxNQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFLLGdCQUFnQixDQUFDLElBQUksUUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakYsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSxVQUFVLENBQUM7QUFDcEIsZUFBRyxFQUFFLElBQUk7QUFDVCxrQkFBTSxFQUFFLE1BQUssS0FBSyxDQUFDLGFBQWEsS0FBSyxHQUFHLENBQUMsSUFBSTtXQUM5QyxDQUFDLEFBQUM7QUFDSCxhQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQUFBQztXQUNWLE9BQU87UUFDWDs7WUFBSyxTQUFTLEVBQUMsT0FBTztVQUNuQixHQUFHLENBQUMsVUFBVTtTQUNYO09BQ0gsQ0FDTDtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7O1FBQUksU0FBUyxFQUFDLGlDQUFpQztNQUM1QyxJQUFJO0tBQ0YsQ0FDTDtHQUNIOztBQUVELFFBQU0sRUFBQSxrQkFBaUI7QUFDckIsV0FDRTs7UUFBSyxTQUFTLEVBQUMsY0FBYztNQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFO0tBQ2xCLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVGFicy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3QgTnVjbGlkZVRhYnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgdGFiczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIHRhYkNvbnRlbnQ6IFByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG4gICAgfSkpLmlzUmVxdWlyZWQsXG4gICAgYWN0aXZlVGFiTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQWN0aXZlVGFiQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHRyaWdnZXJpbmdFdmVudDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICB0cmlnZ2VyaW5nRXZlbnQ6ICdvbkNsaWNrJyxcbiAgICB9O1xuICB9LFxuXG4gIF9oYW5kbGVUYWJDaGFuZ2Uoc2VsZWN0ZWRUYWJOYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMub25BY3RpdmVUYWJDaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3RpdmVUYWJDaGFuZ2UoXG4gICAgICAgIGFycmF5LmZpbmQodGhpcy5wcm9wcy50YWJzLCB0YWIgPT4gdGFiLm5hbWUgPT09IHNlbGVjdGVkVGFiTmFtZSlcbiAgICAgICk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJUYWJNZW51KCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgdGFicyA9IHRoaXMucHJvcHMudGFicy5tYXAodGFiID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB7fTtcbiAgICAgIGhhbmRsZXJbdGhpcy5wcm9wcy50cmlnZ2VyaW5nRXZlbnRdID0gdGhpcy5faGFuZGxlVGFiQ2hhbmdlLmJpbmQodGhpcywgdGFiLm5hbWUpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGxpXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIHRhYjogdHJ1ZSxcbiAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5wcm9wcy5hY3RpdmVUYWJOYW1lID09PSB0YWIubmFtZSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBrZXk9e3RhYi5uYW1lfVxuICAgICAgICAgIHsuLi5oYW5kbGVyfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpdGxlXCI+XG4gICAgICAgICAgICB7dGFiLnRhYkNvbnRlbnR9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFiLWJhciBsaXN0LWlubGluZSBpbnNldC1wYW5lbFwiPlxuICAgICAgICB7dGFic31cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfSxcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRhYnNcIj5cbiAgICAgICAge3RoaXMuX3JlbmRlclRhYk1lbnUoKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVGFicztcbiJdfQ==