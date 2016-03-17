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

module.exports = NuclideTabs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUYWJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O2dCQUVBLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBekMsS0FBSyxhQUFMLEtBQUs7O0FBQ1osSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUV6QyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFcEMsV0FBUyxFQUFFO0FBQ1QsUUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUN0QyxVQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0tBQ3RDLENBQUMsQ0FBQyxDQUFDLFVBQVU7QUFDZCxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxxQkFBaUIsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDNUMsbUJBQWUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDN0M7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wscUJBQWUsRUFBRSxTQUFTO0tBQzNCLENBQUM7R0FDSDs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxlQUF1QixFQUFFO0FBQ3hDLFFBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtBQUN0RCxVQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQUEsR0FBRztlQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssZUFBZTtPQUFBLENBQUMsQ0FDakUsQ0FBQztLQUNIO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBaUI7OztBQUM3QixRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDdEMsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGFBQU8sQ0FBQyxNQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFLLGdCQUFnQixDQUFDLElBQUksUUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakYsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSxVQUFVLENBQUM7QUFDcEIsZUFBRyxFQUFFLElBQUk7QUFDVCxrQkFBTSxFQUFFLE1BQUssS0FBSyxDQUFDLGFBQWEsS0FBSyxHQUFHLENBQUMsSUFBSTtXQUM5QyxDQUFDLEFBQUM7QUFDSCxhQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQUFBQztXQUNWLE9BQU87UUFDWDs7WUFBSyxTQUFTLEVBQUMsT0FBTztVQUNuQixHQUFHLENBQUMsVUFBVTtTQUNYO09BQ0gsQ0FDTDtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7O1FBQUksU0FBUyxFQUFDLGlDQUFpQztNQUM1QyxJQUFJO0tBQ0YsQ0FDTDtHQUNIOztBQUVELFFBQU0sRUFBQSxrQkFBaUI7QUFDckIsV0FDRTs7UUFBSyxTQUFTLEVBQUMsY0FBYztNQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFO0tBQ2xCLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVGFicy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5jb25zdCBOdWNsaWRlVGFicyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0YWJzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgdGFiQ29udGVudDogUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICB9KSkuaXNSZXF1aXJlZCxcbiAgICBhY3RpdmVUYWJOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25BY3RpdmVUYWJDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdHJpZ2dlcmluZ0V2ZW50OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyaWdnZXJpbmdFdmVudDogJ29uQ2xpY2snLFxuICAgIH07XG4gIH0sXG5cbiAgX2hhbmRsZVRhYkNoYW5nZShzZWxlY3RlZFRhYk5hbWU6IHN0cmluZykge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5vbkFjdGl2ZVRhYkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGl2ZVRhYkNoYW5nZShcbiAgICAgICAgYXJyYXkuZmluZCh0aGlzLnByb3BzLnRhYnMsIHRhYiA9PiB0YWIubmFtZSA9PT0gc2VsZWN0ZWRUYWJOYW1lKVxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbmRlclRhYk1lbnUoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB0YWJzID0gdGhpcy5wcm9wcy50YWJzLm1hcCh0YWIgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHt9O1xuICAgICAgaGFuZGxlclt0aGlzLnByb3BzLnRyaWdnZXJpbmdFdmVudF0gPSB0aGlzLl9oYW5kbGVUYWJDaGFuZ2UuYmluZCh0aGlzLCB0YWIubmFtZSk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8bGlcbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICAgdGFiOiB0cnVlLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLnByb3BzLmFjdGl2ZVRhYk5hbWUgPT09IHRhYi5uYW1lLFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIGtleT17dGFiLm5hbWV9XG4gICAgICAgICAgey4uLmhhbmRsZXJ9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIudGFiQ29udGVudH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJ0YWItYmFyIGxpc3QtaW5saW5lIGluc2V0LXBhbmVsXCI+XG4gICAgICAgIHt0YWJzfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9LFxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdGFic1wiPlxuICAgICAgICB7dGhpcy5fcmVuZGVyVGFiTWVudSgpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE51Y2xpZGVUYWJzO1xuIl19