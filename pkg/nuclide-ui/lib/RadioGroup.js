Object.defineProperty(exports, '__esModule', {
  value: true
});

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

// Globally unique ID used as the "name" attribute to group radio inputs.
var uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
var RadioGroup = React.createClass({
  displayName: 'RadioGroup',

  propTypes: {
    optionLabels: PropTypes.arrayOf(PropTypes.node).isRequired,
    selectedIndex: PropTypes.number.isRequired,
    onSelectedChange: PropTypes.func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      optionLabels: [],
      onSelectedChange: function onSelectedChange() {},
      selectedIndex: 0
    };
  },

  getInitialState: function getInitialState() {
    return {
      uid: uid++
    };
  },

  render: function render() {
    var _this = this;

    var checkboxes = this.props.optionLabels.map(function (labelContent, i) {
      var id = 'nuclide-radiogroup-' + uid + '-' + i;
      return React.createElement(
        'div',
        { key: i },
        React.createElement('input', {
          type: 'radio',
          checked: i === _this.props.selectedIndex,
          name: 'radiogroup-' + _this.state.uid,
          id: id,
          onChange: _this.props.onSelectedChange.bind(null, i)
        }),
        React.createElement(
          'label',
          {
            className: 'nuclide-ui-radiogroup-label',
            htmlFor: id },
          labelContent
        )
      );
    });
    return React.createElement(
      'div',
      null,
      checkboxes
    );
  }
});
exports.RadioGroup = RadioGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhZGlvR3JvdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7SUFFTCxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOzs7QUFHaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7OztBQUtMLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUUxQyxXQUFTLEVBQUU7QUFDVCxnQkFBWSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7QUFDMUQsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0dBQzVDOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLGtCQUFZLEVBQUUsRUFBRTtBQUNoQixzQkFBZ0IsRUFBRSw0QkFBTSxFQUFFO0FBQzFCLG1CQUFhLEVBQUUsQ0FBQztLQUNqQixDQUFDO0dBQ0g7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wsU0FBRyxFQUFFLEdBQUcsRUFBRTtLQUNYLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQXlCOzs7QUFDL0IsUUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUMsWUFBWSxFQUFFLENBQUMsRUFBSztBQUNsRSxVQUFNLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqRCxhQUNFOztVQUFLLEdBQUcsRUFBRSxDQUFDLEFBQUM7UUFDVjtBQUNFLGNBQUksRUFBQyxPQUFPO0FBQ1osaUJBQU8sRUFBRSxDQUFDLEtBQUssTUFBSyxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ3hDLGNBQUksRUFBRSxhQUFhLEdBQUcsTUFBSyxLQUFLLENBQUMsR0FBRyxBQUFDO0FBQ3JDLFlBQUUsRUFBRSxFQUFFLEFBQUM7QUFDUCxrQkFBUSxFQUFFLE1BQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEFBQUM7VUFDcEQ7UUFDRjs7O0FBQ0UscUJBQVMsRUFBQyw2QkFBNkI7QUFDdkMsbUJBQU8sRUFBRSxFQUFFLEFBQUM7VUFDWCxZQUFZO1NBQ1A7T0FDSixDQUNOO0tBQ0gsQ0FBQyxDQUFDO0FBQ0gsV0FDRTs7O01BQ0csVUFBVTtLQUNQLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJSYWRpb0dyb3VwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbi8vIEdsb2JhbGx5IHVuaXF1ZSBJRCB1c2VkIGFzIHRoZSBcIm5hbWVcIiBhdHRyaWJ1dGUgdG8gZ3JvdXAgcmFkaW8gaW5wdXRzLlxubGV0IHVpZCA9IDA7XG5cbi8qKlxuICogQSBtYW5hZ2VkIHJhZGlvIGdyb3VwIGNvbXBvbmVudC4gQWNjZXB0cyBhcmJpdHJhcnkgUmVhY3QgZWxlbWVudHMgYXMgbGFiZWxzLlxuICovXG5leHBvcnQgY29uc3QgUmFkaW9Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvcHRpb25MYWJlbHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5ub2RlKS5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdGVkSW5kZXg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25MYWJlbHM6IFtdLFxuICAgICAgb25TZWxlY3RlZENoYW5nZTogKCkgPT4ge30sXG4gICAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVpZDogdWlkKyssXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hlY2tib3hlcyA9IHRoaXMucHJvcHMub3B0aW9uTGFiZWxzLm1hcCgobGFiZWxDb250ZW50LCBpKSA9PiB7XG4gICAgICBjb25zdCBpZCA9ICdudWNsaWRlLXJhZGlvZ3JvdXAtJyArIHVpZCArICctJyArIGk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17aX0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgY2hlY2tlZD17aSA9PT0gdGhpcy5wcm9wcy5zZWxlY3RlZEluZGV4fVxuICAgICAgICAgICAgbmFtZT17J3JhZGlvZ3JvdXAtJyArIHRoaXMuc3RhdGUudWlkfVxuICAgICAgICAgICAgaWQ9e2lkfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3RlZENoYW5nZS5iaW5kKG51bGwsIGkpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXVpLXJhZGlvZ3JvdXAtbGFiZWxcIlxuICAgICAgICAgICAgaHRtbEZvcj17aWR9PlxuICAgICAgICAgICAge2xhYmVsQ29udGVudH1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHtjaGVja2JveGVzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcbn0pO1xuIl19