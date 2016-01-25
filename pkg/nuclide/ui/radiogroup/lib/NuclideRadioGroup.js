

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

var PropTypes = React.PropTypes;

// Globally unique ID used as the "name" attribute to group radio inputs.
var uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
var NuclideRadioGroup = React.createClass({
  displayName: 'NuclideRadioGroup',

  propTypes: {
    optionLabels: PropTypes.arrayOf(PropTypes.node).isRequired,
    selectedIndex: React.PropTypes.number.isRequired,
    onSelectedChange: React.PropTypes.func.isRequired
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

module.exports = NuclideRadioGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVSYWRpb0dyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFFakMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7O0FBR2hCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQzs7Ozs7QUFLWixJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUUxQyxXQUFTLEVBQUU7QUFDVCxnQkFBWSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7QUFDMUQsaUJBQWEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2hELG9CQUFnQixFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7R0FDbEQ7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wsa0JBQVksRUFBRSxFQUFFO0FBQ2hCLHNCQUFnQixFQUFFLDRCQUFNLEVBQUU7QUFDMUIsbUJBQWEsRUFBRSxDQUFDO0tBQ2pCLENBQUM7R0FDSDs7QUFFRCxpQkFBZSxFQUFBLDJCQUFRO0FBQ3JCLFdBQU87QUFDTCxTQUFHLEVBQUUsR0FBRyxFQUFFO0tBQ1gsQ0FBQztHQUNIOztBQUVELFFBQU0sRUFBRSxrQkFBeUI7OztBQUMvQixRQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQyxZQUFZLEVBQUUsQ0FBQyxFQUFLO0FBQ2xFLFVBQU0sRUFBRSxHQUFHLHFCQUFxQixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELGFBQ0U7O1VBQUssR0FBRyxFQUFFLENBQUMsQUFBQztRQUNWO0FBQ0UsY0FBSSxFQUFDLE9BQU87QUFDWixpQkFBTyxFQUFFLENBQUMsS0FBSyxNQUFLLEtBQUssQ0FBQyxhQUFhLEFBQUM7QUFDeEMsY0FBSSxFQUFFLGFBQWEsR0FBRyxNQUFLLEtBQUssQ0FBQyxHQUFHLEFBQUM7QUFDckMsWUFBRSxFQUFFLEVBQUUsQUFBQztBQUNQLGtCQUFRLEVBQUUsTUFBSyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQUFBQztVQUNwRDtRQUNGOzs7QUFDRSxxQkFBUyxFQUFDLDZCQUE2QjtBQUN2QyxtQkFBTyxFQUFFLEVBQUUsQUFBQztVQUNYLFlBQVk7U0FDUDtPQUNKLENBQ047S0FDSCxDQUFDLENBQUM7QUFDSCxXQUNFOzs7TUFDRyxVQUFVO0tBQ1AsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiTnVjbGlkZVJhZGlvR3JvdXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbi8vIEdsb2JhbGx5IHVuaXF1ZSBJRCB1c2VkIGFzIHRoZSBcIm5hbWVcIiBhdHRyaWJ1dGUgdG8gZ3JvdXAgcmFkaW8gaW5wdXRzLlxubGV0IHVpZCA9IDA7XG5cbi8qKlxuICogQSBtYW5hZ2VkIHJhZGlvIGdyb3VwIGNvbXBvbmVudC4gQWNjZXB0cyBhcmJpdHJhcnkgUmVhY3QgZWxlbWVudHMgYXMgbGFiZWxzLlxuICovXG5jb25zdCBOdWNsaWRlUmFkaW9Hcm91cCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvcHRpb25MYWJlbHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5ub2RlKS5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdGVkSW5kZXg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wcygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25MYWJlbHM6IFtdLFxuICAgICAgb25TZWxlY3RlZENoYW5nZTogKCkgPT4ge30sXG4gICAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVpZDogdWlkKyssXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hlY2tib3hlcyA9IHRoaXMucHJvcHMub3B0aW9uTGFiZWxzLm1hcCgobGFiZWxDb250ZW50LCBpKSA9PiB7XG4gICAgICBjb25zdCBpZCA9ICdudWNsaWRlLXJhZGlvZ3JvdXAtJyArIHVpZCArICctJyArIGk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17aX0+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgY2hlY2tlZD17aSA9PT0gdGhpcy5wcm9wcy5zZWxlY3RlZEluZGV4fVxuICAgICAgICAgICAgbmFtZT17J3JhZGlvZ3JvdXAtJyArIHRoaXMuc3RhdGUudWlkfVxuICAgICAgICAgICAgaWQ9e2lkfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3RlZENoYW5nZS5iaW5kKG51bGwsIGkpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxhYmVsXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXVpLXJhZGlvZ3JvdXAtbGFiZWxcIlxuICAgICAgICAgICAgaHRtbEZvcj17aWR9PlxuICAgICAgICAgICAge2xhYmVsQ29udGVudH1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHtjaGVja2JveGVzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE51Y2xpZGVSYWRpb0dyb3VwO1xuIl19