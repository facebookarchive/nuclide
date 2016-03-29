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
var NuclideRadioGroup = React.createClass({
  displayName: 'NuclideRadioGroup',

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
exports.NuclideRadioGroup = NuclideRadioGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVSYWRpb0dyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVdnQixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssWUFBTCxLQUFLO0lBRUwsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7O0FBR2hCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQzs7Ozs7QUFLTCxJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUVqRCxXQUFTLEVBQUU7QUFDVCxnQkFBWSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7QUFDMUQsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0dBQzVDOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLGtCQUFZLEVBQUUsRUFBRTtBQUNoQixzQkFBZ0IsRUFBRSw0QkFBTSxFQUFFO0FBQzFCLG1CQUFhLEVBQUUsQ0FBQztLQUNqQixDQUFDO0dBQ0g7O0FBRUQsaUJBQWUsRUFBQSwyQkFBUTtBQUNyQixXQUFPO0FBQ0wsU0FBRyxFQUFFLEdBQUcsRUFBRTtLQUNYLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQXlCOzs7QUFDL0IsUUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUMsWUFBWSxFQUFFLENBQUMsRUFBSztBQUNsRSxVQUFNLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqRCxhQUNFOztVQUFLLEdBQUcsRUFBRSxDQUFDLEFBQUM7UUFDVjtBQUNFLGNBQUksRUFBQyxPQUFPO0FBQ1osaUJBQU8sRUFBRSxDQUFDLEtBQUssTUFBSyxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ3hDLGNBQUksRUFBRSxhQUFhLEdBQUcsTUFBSyxLQUFLLENBQUMsR0FBRyxBQUFDO0FBQ3JDLFlBQUUsRUFBRSxFQUFFLEFBQUM7QUFDUCxrQkFBUSxFQUFFLE1BQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEFBQUM7VUFDcEQ7UUFDRjs7O0FBQ0UscUJBQVMsRUFBQyw2QkFBNkI7QUFDdkMsbUJBQU8sRUFBRSxFQUFFLEFBQUM7VUFDWCxZQUFZO1NBQ1A7T0FDSixDQUNOO0tBQ0gsQ0FBQyxDQUFDO0FBQ0gsV0FDRTs7O01BQ0csVUFBVTtLQUNQLENBQ047R0FDSDtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJOdWNsaWRlUmFkaW9Hcm91cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vLyBHbG9iYWxseSB1bmlxdWUgSUQgdXNlZCBhcyB0aGUgXCJuYW1lXCIgYXR0cmlidXRlIHRvIGdyb3VwIHJhZGlvIGlucHV0cy5cbmxldCB1aWQgPSAwO1xuXG4vKipcbiAqIEEgbWFuYWdlZCByYWRpbyBncm91cCBjb21wb25lbnQuIEFjY2VwdHMgYXJiaXRyYXJ5IFJlYWN0IGVsZW1lbnRzIGFzIGxhYmVscy5cbiAqL1xuZXhwb3J0IGNvbnN0IE51Y2xpZGVSYWRpb0dyb3VwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIG9wdGlvbkxhYmVsczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm5vZGUpLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0ZWRJbmRleDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uU2VsZWN0ZWRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzKCk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbkxhYmVsczogW10sXG4gICAgICBvblNlbGVjdGVkQ2hhbmdlOiAoKSA9PiB7fSxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGUoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdWlkOiB1aWQrKyxcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBjaGVja2JveGVzID0gdGhpcy5wcm9wcy5vcHRpb25MYWJlbHMubWFwKChsYWJlbENvbnRlbnQsIGkpID0+IHtcbiAgICAgIGNvbnN0IGlkID0gJ251Y2xpZGUtcmFkaW9ncm91cC0nICsgdWlkICsgJy0nICsgaTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtpfT5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICBjaGVja2VkPXtpID09PSB0aGlzLnByb3BzLnNlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgICBuYW1lPXsncmFkaW9ncm91cC0nICsgdGhpcy5zdGF0ZS51aWR9XG4gICAgICAgICAgICBpZD17aWR9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGVkQ2hhbmdlLmJpbmQobnVsbCwgaSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGFiZWxcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtdWktcmFkaW9ncm91cC1sYWJlbFwiXG4gICAgICAgICAgICBodG1sRm9yPXtpZH0+XG4gICAgICAgICAgICB7bGFiZWxDb250ZW50fVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAge2NoZWNrYm94ZXN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxufSk7XG4iXX0=