

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

module.exports = NuclideRadioGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVSYWRpb0dyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7OztBQUdoQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7O0FBS1osSUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFMUMsV0FBUyxFQUFFO0FBQ1QsZ0JBQVksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVO0FBQzFELGlCQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzFDLG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtHQUM1Qzs7QUFFRCxpQkFBZSxFQUFBLDJCQUFRO0FBQ3JCLFdBQU87QUFDTCxrQkFBWSxFQUFFLEVBQUU7QUFDaEIsc0JBQWdCLEVBQUUsNEJBQU0sRUFBRTtBQUMxQixtQkFBYSxFQUFFLENBQUM7S0FDakIsQ0FBQztHQUNIOztBQUVELGlCQUFlLEVBQUEsMkJBQVE7QUFDckIsV0FBTztBQUNMLFNBQUcsRUFBRSxHQUFHLEVBQUU7S0FDWCxDQUFDO0dBQ0g7O0FBRUQsUUFBTSxFQUFFLGtCQUF5Qjs7O0FBQy9CLFFBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFlBQVksRUFBRSxDQUFDLEVBQUs7QUFDbEUsVUFBTSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDakQsYUFDRTs7VUFBSyxHQUFHLEVBQUUsQ0FBQyxBQUFDO1FBQ1Y7QUFDRSxjQUFJLEVBQUMsT0FBTztBQUNaLGlCQUFPLEVBQUUsQ0FBQyxLQUFLLE1BQUssS0FBSyxDQUFDLGFBQWEsQUFBQztBQUN4QyxjQUFJLEVBQUUsYUFBYSxHQUFHLE1BQUssS0FBSyxDQUFDLEdBQUcsQUFBQztBQUNyQyxZQUFFLEVBQUUsRUFBRSxBQUFDO0FBQ1Asa0JBQVEsRUFBRSxNQUFLLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxBQUFDO1VBQ3BEO1FBQ0Y7OztBQUNFLHFCQUFTLEVBQUMsNkJBQTZCO0FBQ3ZDLG1CQUFPLEVBQUUsRUFBRSxBQUFDO1VBQ1gsWUFBWTtTQUNQO09BQ0osQ0FDTjtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7OztNQUNHLFVBQVU7S0FDUCxDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJOdWNsaWRlUmFkaW9Hcm91cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vLyBHbG9iYWxseSB1bmlxdWUgSUQgdXNlZCBhcyB0aGUgXCJuYW1lXCIgYXR0cmlidXRlIHRvIGdyb3VwIHJhZGlvIGlucHV0cy5cbmxldCB1aWQgPSAwO1xuXG4vKipcbiAqIEEgbWFuYWdlZCByYWRpbyBncm91cCBjb21wb25lbnQuIEFjY2VwdHMgYXJiaXRyYXJ5IFJlYWN0IGVsZW1lbnRzIGFzIGxhYmVscy5cbiAqL1xuY29uc3QgTnVjbGlkZVJhZGlvR3JvdXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgb3B0aW9uTGFiZWxzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubm9kZSkuaXNSZXF1aXJlZCxcbiAgICBzZWxlY3RlZEluZGV4OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25TZWxlY3RlZENoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uTGFiZWxzOiBbXSxcbiAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U6ICgpID0+IHt9LFxuICAgICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICB1aWQ6IHVpZCsrLFxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNoZWNrYm94ZXMgPSB0aGlzLnByb3BzLm9wdGlvbkxhYmVscy5tYXAoKGxhYmVsQ29udGVudCwgaSkgPT4ge1xuICAgICAgY29uc3QgaWQgPSAnbnVjbGlkZS1yYWRpb2dyb3VwLScgKyB1aWQgKyAnLScgKyBpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2l9PlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e2kgPT09IHRoaXMucHJvcHMuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICAgIG5hbWU9eydyYWRpb2dyb3VwLScgKyB0aGlzLnN0YXRlLnVpZH1cbiAgICAgICAgICAgIGlkPXtpZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0ZWRDaGFuZ2UuYmluZChudWxsLCBpKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsYWJlbFxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1yYWRpb2dyb3VwLWxhYmVsXCJcbiAgICAgICAgICAgIGh0bWxGb3I9e2lkfT5cbiAgICAgICAgICAgIHtsYWJlbENvbnRlbnR9XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7Y2hlY2tib3hlc31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlUmFkaW9Hcm91cDtcbiJdfQ==