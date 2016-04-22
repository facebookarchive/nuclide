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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhZGlvR3JvdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2VBV2dCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7SUFFTCxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOzs7QUFHaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7OztBQUtMLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUUxQyxXQUFTLEVBQUU7QUFDVCxnQkFBWSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7QUFDMUQsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0dBQzVDOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLGtCQUFZLEVBQUUsRUFBRTtBQUNoQixzQkFBZ0IsRUFBRSw0QkFBTSxFQUFFO0FBQzFCLG1CQUFhLEVBQUUsQ0FBQztLQUNqQixDQUFDO0dBQ0g7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wsU0FBRyxFQUFFLEdBQUcsRUFBRTtLQUNYLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQTBCOzs7QUFDaEMsUUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUMsWUFBWSxFQUFFLENBQUMsRUFBSztBQUNsRSxVQUFNLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqRCxhQUNFOztVQUFLLEdBQUcsRUFBRSxDQUFDLEFBQUM7UUFDVjtBQUNFLGNBQUksRUFBQyxPQUFPO0FBQ1osaUJBQU8sRUFBRSxDQUFDLEtBQUssTUFBSyxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ3hDLGNBQUksRUFBRSxhQUFhLEdBQUcsTUFBSyxLQUFLLENBQUMsR0FBRyxBQUFDO0FBQ3JDLFlBQUUsRUFBRSxFQUFFLEFBQUM7QUFDUCxrQkFBUSxFQUFFLE1BQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEFBQUM7VUFDcEQ7UUFDRjs7O0FBQ0UscUJBQVMsRUFBQyw2QkFBNkI7QUFDdkMsbUJBQU8sRUFBRSxFQUFFLEFBQUM7VUFDWCxZQUFZO1NBQ1A7T0FDSixDQUNOO0tBQ0gsQ0FBQyxDQUFDO0FBQ0gsV0FDRTs7O01BQ0csVUFBVTtLQUNQLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJSYWRpb0dyb3VwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbi8vIEdsb2JhbGx5IHVuaXF1ZSBJRCB1c2VkIGFzIHRoZSBcIm5hbWVcIiBhdHRyaWJ1dGUgdG8gZ3JvdXAgcmFkaW8gaW5wdXRzLlxubGV0IHVpZCA9IDA7XG5cbi8qKlxuICogQSBtYW5hZ2VkIHJhZGlvIGdyb3VwIGNvbXBvbmVudC4gQWNjZXB0cyBhcmJpdHJhcnkgUmVhY3QgZWxlbWVudHMgYXMgbGFiZWxzLlxuICovXG5leHBvcnQgY29uc3QgUmFkaW9Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvcHRpb25MYWJlbHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5ub2RlKS5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdGVkSW5kZXg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25MYWJlbHM6IFtdLFxuICAgICAgb25TZWxlY3RlZENoYW5nZTogKCkgPT4ge30sXG4gICAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVpZDogdWlkKyssXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IGNoZWNrYm94ZXMgPSB0aGlzLnByb3BzLm9wdGlvbkxhYmVscy5tYXAoKGxhYmVsQ29udGVudCwgaSkgPT4ge1xuICAgICAgY29uc3QgaWQgPSAnbnVjbGlkZS1yYWRpb2dyb3VwLScgKyB1aWQgKyAnLScgKyBpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2l9PlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e2kgPT09IHRoaXMucHJvcHMuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICAgIG5hbWU9eydyYWRpb2dyb3VwLScgKyB0aGlzLnN0YXRlLnVpZH1cbiAgICAgICAgICAgIGlkPXtpZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0ZWRDaGFuZ2UuYmluZChudWxsLCBpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1yYWRpb2dyb3VwLWxhYmVsXCJcbiAgICAgICAgICAgIGh0bWxGb3I9e2lkfT5cbiAgICAgICAgICAgIHtsYWJlbENvbnRlbnR9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7Y2hlY2tib3hlc31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59KTtcbiJdfQ==