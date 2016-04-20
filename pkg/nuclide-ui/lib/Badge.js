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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

var BadgeSizes = Object.freeze({
  medium: 'medium',
  small: 'small',
  large: 'large'
});

exports.BadgeSizes = BadgeSizes;
var BadgeColors = Object.freeze({
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
});

exports.BadgeColors = BadgeColors;
var BadgeSizeClassNames = Object.freeze({
  small: 'badge-small',
  medium: 'badge-medium',
  large: 'badge-large'
});

var BadgeColorClassNames = Object.freeze({
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error'
});

var Badge = function Badge(props) {
  var _classnames;

  var className = props.className;
  var color = props.color;
  var icon = props.icon;
  var size = props.size;
  var value = props.value;

  var sizeClassName = size == null ? '' : BadgeSizeClassNames[size] || '';
  var colorClassName = color == null ? '' : BadgeColorClassNames[color] || '';
  var newClassName = (0, _classnames3['default'])(className, 'badge', (_classnames = {}, _defineProperty(_classnames, sizeClassName, size != null), _defineProperty(_classnames, colorClassName, color != null), _defineProperty(_classnames, 'icon icon-' + icon, icon != null), _classnames));
  return _reactForAtom.React.createElement(
    'span',
    { className: newClassName },
    value
  );
};
exports.Badge = Badge;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** The value displayed inside the badge. */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhZGdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYXVCLFlBQVk7Ozs7NEJBQ2YsZ0JBQWdCOztBQWU3QixJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFFBQU0sRUFBRSxRQUFRO0FBQ2hCLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDLENBQUM7OztBQUVJLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkMsTUFBSSxFQUFFLE1BQU07QUFDWixTQUFPLEVBQUUsU0FBUztBQUNsQixTQUFPLEVBQUUsU0FBUztBQUNsQixPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3hDLE9BQUssRUFBRSxhQUFhO0FBQ3BCLFFBQU0sRUFBRSxjQUFjO0FBQ3RCLE9BQUssRUFBRSxhQUFhO0NBQ3JCLENBQUMsQ0FBQzs7QUFFSCxJQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDekMsTUFBSSxFQUFFLFlBQVk7QUFDbEIsU0FBTyxFQUFFLGVBQWU7QUFDeEIsU0FBTyxFQUFFLGVBQWU7QUFDeEIsT0FBSyxFQUFFLGFBQWE7Q0FDckIsQ0FBQyxDQUFDOztBQUVJLElBQU0sS0FBSyxHQUFHLFNBQVIsS0FBSyxDQUFJLEtBQUssRUFBWTs7O01BRW5DLFNBQVMsR0FLUCxLQUFLLENBTFAsU0FBUztNQUNULEtBQUssR0FJSCxLQUFLLENBSlAsS0FBSztNQUNMLElBQUksR0FHRixLQUFLLENBSFAsSUFBSTtNQUNKLElBQUksR0FFRixLQUFLLENBRlAsSUFBSTtNQUNKLEtBQUssR0FDSCxLQUFLLENBRFAsS0FBSzs7QUFFUCxNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUUsTUFBTSxjQUFjLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzlFLE1BQU0sWUFBWSxHQUFHLDZCQUNuQixTQUFTLEVBQ1QsT0FBTyxrREFFSixhQUFhLEVBQUcsSUFBSSxJQUFJLElBQUksZ0NBQzVCLGNBQWMsRUFBRyxLQUFLLElBQUksSUFBSSwrQ0FDakIsSUFBSSxFQUFLLElBQUksSUFBSSxJQUFJLGdCQUV0QyxDQUFDO0FBQ0YsU0FDRTs7TUFBTSxTQUFTLEVBQUUsWUFBWSxBQUFDO0lBQzNCLEtBQUs7R0FDRCxDQUNQO0NBQ0gsQ0FBQyIsImZpbGUiOiJCYWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPY3RpY29ufSBmcm9tICcuL09jdGljb25zJztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgQmFkZ2VTaXplID0gJ21lZGl1bScgfCAnc21hbGwnIHwgJ2xhcmdlJztcbnR5cGUgQmFkZ2VDb2xvciA9ICdpbmZvJyB8ICdzdWNjZXNzJyB8ICd3YXJuaW5nJyB8ICdlcnJvcic7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgY29sb3I/OiBCYWRnZUNvbG9yO1xuICAvKiogT2N0aWNvbiBpY29uIG5hbWUsIHdpdGhvdXQgdGhlIGBpY29uLWAgcHJlZml4LiBFLmcuIGAnYXJyb3ctdXAnYCAqL1xuICBpY29uPzogT2N0aWNvbjtcbiAgc2l6ZT86IEJhZGdlU2l6ZTtcbiAgLyoqIFRoZSB2YWx1ZSBkaXNwbGF5ZWQgaW5zaWRlIHRoZSBiYWRnZS4gKi9cbiAgdmFsdWU6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBCYWRnZVNpemVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIG1lZGl1bTogJ21lZGl1bScsXG4gIHNtYWxsOiAnc21hbGwnLFxuICBsYXJnZTogJ2xhcmdlJyxcbn0pO1xuXG5leHBvcnQgY29uc3QgQmFkZ2VDb2xvcnMgPSBPYmplY3QuZnJlZXplKHtcbiAgaW5mbzogJ2luZm8nLFxuICBzdWNjZXNzOiAnc3VjY2VzcycsXG4gIHdhcm5pbmc6ICd3YXJuaW5nJyxcbiAgZXJyb3I6ICdlcnJvcicsXG59KTtcblxuY29uc3QgQmFkZ2VTaXplQ2xhc3NOYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBzbWFsbDogJ2JhZGdlLXNtYWxsJyxcbiAgbWVkaXVtOiAnYmFkZ2UtbWVkaXVtJyxcbiAgbGFyZ2U6ICdiYWRnZS1sYXJnZScsXG59KTtcblxuY29uc3QgQmFkZ2VDb2xvckNsYXNzTmFtZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgaW5mbzogJ2JhZGdlLWluZm8nLFxuICBzdWNjZXNzOiAnYmFkZ2Utc3VjY2VzcycsXG4gIHdhcm5pbmc6ICdiYWRnZS13YXJuaW5nJyxcbiAgZXJyb3I6ICdiYWRnZS1lcnJvcicsXG59KTtcblxuZXhwb3J0IGNvbnN0IEJhZGdlID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7XG4gICAgY2xhc3NOYW1lLFxuICAgIGNvbG9yLFxuICAgIGljb24sXG4gICAgc2l6ZSxcbiAgICB2YWx1ZSxcbiAgfSA9IHByb3BzO1xuICBjb25zdCBzaXplQ2xhc3NOYW1lID0gc2l6ZSA9PSBudWxsID8gJycgOiBCYWRnZVNpemVDbGFzc05hbWVzW3NpemVdIHx8ICcnO1xuICBjb25zdCBjb2xvckNsYXNzTmFtZSA9IGNvbG9yID09IG51bGwgPyAnJyA6IEJhZGdlQ29sb3JDbGFzc05hbWVzW2NvbG9yXSB8fCAnJztcbiAgY29uc3QgbmV3Q2xhc3NOYW1lID0gY2xhc3NuYW1lcyhcbiAgICBjbGFzc05hbWUsXG4gICAgJ2JhZGdlJyxcbiAgICB7XG4gICAgICBbc2l6ZUNsYXNzTmFtZV06IHNpemUgIT0gbnVsbCxcbiAgICAgIFtjb2xvckNsYXNzTmFtZV06IGNvbG9yICE9IG51bGwsXG4gICAgICBbYGljb24gaWNvbi0ke2ljb259YF06IGljb24gIT0gbnVsbCxcbiAgICB9LFxuICApO1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT17bmV3Q2xhc3NOYW1lfT5cbiAgICAgIHt2YWx1ZX1cbiAgICA8L3NwYW4+XG4gICk7XG59O1xuIl19