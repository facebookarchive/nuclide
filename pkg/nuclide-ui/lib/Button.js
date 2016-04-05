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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

var ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

exports.ButtonSizes = ButtonSizes;
var ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
});

exports.ButtonTypes = ButtonTypes;
var ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg'
});

var ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error'
});

/**
 * Generic Button wrapper.
 */
/* eslint-disable react/prop-types */
var Button = function Button(props) {
  var _classnames;

  var icon = props.icon;
  var buttonType = props.buttonType;
  var selected = props.selected;
  var size = props.size;
  var children = props.children;
  var className = props.className;

  var remainingProps = _objectWithoutProperties(props, ['icon', 'buttonType', 'selected', 'size', 'children', 'className']);

  var sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
  var buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
  var newClassName = (0, _classnames3['default'])(className, 'btn', (_classnames = {}, _defineProperty(_classnames, 'icon icon-' + icon, icon != null), _defineProperty(_classnames, sizeClassname, size != null), _defineProperty(_classnames, 'selected', selected), _defineProperty(_classnames, buttonTypeClassname, buttonType != null), _classnames));
  return _reactForAtom.React.createElement(
    'div',
    _extends({ className: newClassName }, remainingProps),
    children
  );
};
exports.Button = Button;

/** Octicon icon name, without the `icon-` prefix. E.g. `'arrow-up'` */

/** Optional specifier for special buttons, e.g. primary, info, success or error buttons. */

/**  */

/** The button's content; generally a string. */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1dHRvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFhdUIsWUFBWTs7Ozs0QkFDZixnQkFBZ0I7O0FBa0I3QixJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLGFBQVcsRUFBRSxhQUFhO0FBQzFCLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDLENBQUM7OztBQUVJLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkMsU0FBTyxFQUFFLFNBQVM7QUFDbEIsTUFBSSxFQUFFLE1BQU07QUFDWixTQUFPLEVBQUUsU0FBUztBQUNsQixTQUFPLEVBQUUsU0FBUztBQUNsQixPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3pDLGFBQVcsRUFBRSxRQUFRO0FBQ3JCLE9BQUssRUFBRSxRQUFRO0FBQ2YsT0FBSyxFQUFFLFFBQVE7Q0FDaEIsQ0FBQyxDQUFDOztBQUVILElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN6QyxTQUFPLEVBQUUsYUFBYTtBQUN0QixNQUFJLEVBQUUsVUFBVTtBQUNoQixTQUFPLEVBQUUsYUFBYTtBQUN0QixTQUFPLEVBQUUsYUFBYTtBQUN0QixPQUFLLEVBQUUsV0FBVztDQUNuQixDQUFDLENBQUM7Ozs7OztBQU1JLElBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFJLEtBQUssRUFBWTs7O01BRXBDLElBQUksR0FPRixLQUFLLENBUFAsSUFBSTtNQUNKLFVBQVUsR0FNUixLQUFLLENBTlAsVUFBVTtNQUNWLFFBQVEsR0FLTixLQUFLLENBTFAsUUFBUTtNQUNSLElBQUksR0FJRixLQUFLLENBSlAsSUFBSTtNQUNKLFFBQVEsR0FHTixLQUFLLENBSFAsUUFBUTtNQUNSLFNBQVMsR0FFUCxLQUFLLENBRlAsU0FBUzs7TUFDTixjQUFjLDRCQUNmLEtBQUs7O0FBQ1QsTUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzNFLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdGLE1BQU0sWUFBWSxHQUFHLDZCQUNuQixTQUFTLEVBQ1QsS0FBSyxpRUFFVyxJQUFJLEVBQUssSUFBSSxJQUFJLElBQUksZ0NBQ2xDLGFBQWEsRUFBRyxJQUFJLElBQUksSUFBSSw0Q0FDN0IsUUFBUSxnQ0FDUCxtQkFBbUIsRUFBSSxVQUFVLElBQUksSUFBSSxnQkFFN0MsQ0FBQztBQUNGLFNBQ0U7O2VBQUssU0FBUyxFQUFFLFlBQVksQUFBQyxJQUFLLGNBQWM7SUFDN0MsUUFBUTtHQUNMLENBQ047Q0FDSCxDQUFDIiwiZmlsZSI6IkJ1dHRvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPY3RpY29ufSBmcm9tICcuL09jdGljb25zJztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgQnV0dG9uVHlwZSA9ICdQUklNQVJZJyB8ICdJTkZPJyB8ICdTVUNDRVNTJyB8ICdXQVJOSU5HJyB8ICdFUlJPUic7XG50eXBlIEJ1dHRvblNpemUgPSAnRVhUUkFfU01BTEwnIHwgJ1NNQUxMJyB8ICdMQVJHRSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8qKiBPY3RpY29uIGljb24gbmFtZSwgd2l0aG91dCB0aGUgYGljb24tYCBwcmVmaXguIEUuZy4gYCdhcnJvdy11cCdgICovXG4gIGljb24/OiBPY3RpY29uO1xuICAvKiogT3B0aW9uYWwgc3BlY2lmaWVyIGZvciBzcGVjaWFsIGJ1dHRvbnMsIGUuZy4gcHJpbWFyeSwgaW5mbywgc3VjY2VzcyBvciBlcnJvciBidXR0b25zLiAqL1xuICBidXR0b25UeXBlPzogQnV0dG9uVHlwZTtcbiAgc2VsZWN0ZWQ/OiBib29sZWFuO1xuICAvKiogICovXG4gIHNpemU/OiBCdXR0b25TaXplO1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIC8qKiBUaGUgYnV0dG9uJ3MgY29udGVudDsgZ2VuZXJhbGx5IGEgc3RyaW5nLiAqL1xuICBjaGlsZHJlbjogUmVhY3RFbGVtZW50O1xufVxuXG5leHBvcnQgY29uc3QgQnV0dG9uU2l6ZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgRVhUUkFfU01BTEw6ICdFWFRSQV9TTUFMTCcsXG4gIFNNQUxMOiAnU01BTEwnLFxuICBMQVJHRTogJ0xBUkdFJyxcbn0pO1xuXG5leHBvcnQgY29uc3QgQnV0dG9uVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgUFJJTUFSWTogJ1BSSU1BUlknLFxuICBJTkZPOiAnSU5GTycsXG4gIFNVQ0NFU1M6ICdTVUNDRVNTJyxcbiAgV0FSTklORzogJ1dBUk5JTkcnLFxuICBFUlJPUjogJ0VSUk9SJyxcbn0pO1xuXG5jb25zdCBCdXR0b25TaXplQ2xhc3NuYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBFWFRSQV9TTUFMTDogJ2J0bi14cycsXG4gIFNNQUxMOiAnYnRuLXNtJyxcbiAgTEFSR0U6ICdidG4tbGcnLFxufSk7XG5cbmNvbnN0IEJ1dHRvblR5cGVDbGFzc25hbWVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFBSSU1BUlk6ICdidG4tcHJpbWFyeScsXG4gIElORk86ICdidG4taW5mbycsXG4gIFNVQ0NFU1M6ICdidG4tc3VjY2VzcycsXG4gIFdBUk5JTkc6ICdidG4td2FybmluZycsXG4gIEVSUk9SOiAnYnRuLWVycm9yJyxcbn0pO1xuXG4vKipcbiAqIEdlbmVyaWMgQnV0dG9uIHdyYXBwZXIuXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBjb25zdCBCdXR0b24gPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBpY29uLFxuICAgIGJ1dHRvblR5cGUsXG4gICAgc2VsZWN0ZWQsXG4gICAgc2l6ZSxcbiAgICBjaGlsZHJlbixcbiAgICBjbGFzc05hbWUsXG4gICAgLi4ucmVtYWluaW5nUHJvcHMsXG4gIH0gPSBwcm9wcztcbiAgY29uc3Qgc2l6ZUNsYXNzbmFtZSA9IHNpemUgPT0gbnVsbCA/ICcnIDogQnV0dG9uU2l6ZUNsYXNzbmFtZXNbc2l6ZV0gfHwgJyc7XG4gIGNvbnN0IGJ1dHRvblR5cGVDbGFzc25hbWUgPSBidXR0b25UeXBlID09IG51bGwgPyAnJyA6IEJ1dHRvblR5cGVDbGFzc25hbWVzW2J1dHRvblR5cGVdIHx8ICcnO1xuICBjb25zdCBuZXdDbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgIGNsYXNzTmFtZSxcbiAgICAnYnRuJyxcbiAgICB7XG4gICAgICBbYGljb24gaWNvbi0ke2ljb259YF06IGljb24gIT0gbnVsbCxcbiAgICAgIFtzaXplQ2xhc3NuYW1lXTogc2l6ZSAhPSBudWxsLFxuICAgICAgc2VsZWN0ZWQsXG4gICAgICBbYnV0dG9uVHlwZUNsYXNzbmFtZV06ICBidXR0b25UeXBlICE9IG51bGwsXG4gICAgfSxcbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17bmV3Q2xhc3NOYW1lfSB7Li4ucmVtYWluaW5nUHJvcHN9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcbiJdfQ==