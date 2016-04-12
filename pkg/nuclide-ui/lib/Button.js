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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1dHRvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFhdUIsWUFBWTs7Ozs0QkFDZixnQkFBZ0I7O0FBa0I3QixJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLGFBQVcsRUFBRSxhQUFhO0FBQzFCLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDLENBQUM7OztBQUVJLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkMsU0FBTyxFQUFFLFNBQVM7QUFDbEIsTUFBSSxFQUFFLE1BQU07QUFDWixTQUFPLEVBQUUsU0FBUztBQUNsQixTQUFPLEVBQUUsU0FBUztBQUNsQixPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3pDLGFBQVcsRUFBRSxRQUFRO0FBQ3JCLE9BQUssRUFBRSxRQUFRO0FBQ2YsT0FBSyxFQUFFLFFBQVE7Q0FDaEIsQ0FBQyxDQUFDOztBQUVILElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN6QyxTQUFPLEVBQUUsYUFBYTtBQUN0QixNQUFJLEVBQUUsVUFBVTtBQUNoQixTQUFPLEVBQUUsYUFBYTtBQUN0QixTQUFPLEVBQUUsYUFBYTtBQUN0QixPQUFLLEVBQUUsV0FBVztDQUNuQixDQUFDLENBQUM7Ozs7O0FBS0ksSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksS0FBSyxFQUFZOzs7TUFFcEMsSUFBSSxHQU9GLEtBQUssQ0FQUCxJQUFJO01BQ0osVUFBVSxHQU1SLEtBQUssQ0FOUCxVQUFVO01BQ1YsUUFBUSxHQUtOLEtBQUssQ0FMUCxRQUFRO01BQ1IsSUFBSSxHQUlGLEtBQUssQ0FKUCxJQUFJO01BQ0osUUFBUSxHQUdOLEtBQUssQ0FIUCxRQUFRO01BQ1IsU0FBUyxHQUVQLEtBQUssQ0FGUCxTQUFTOztNQUNOLGNBQWMsNEJBQ2YsS0FBSzs7QUFDVCxNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0UsTUFBTSxtQkFBbUIsR0FBRyxVQUFVLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0YsTUFBTSxZQUFZLEdBQUcsNkJBQ25CLFNBQVMsRUFDVCxLQUFLLGlFQUVXLElBQUksRUFBSyxJQUFJLElBQUksSUFBSSxnQ0FDbEMsYUFBYSxFQUFHLElBQUksSUFBSSxJQUFJLDRDQUM3QixRQUFRLGdDQUNQLG1CQUFtQixFQUFJLFVBQVUsSUFBSSxJQUFJLGdCQUU3QyxDQUFDO0FBQ0YsU0FDRTs7ZUFBSyxTQUFTLEVBQUUsWUFBWSxBQUFDLElBQUssY0FBYztJQUM3QyxRQUFRO0dBQ0wsQ0FDTjtDQUNILENBQUMiLCJmaWxlIjoiQnV0dG9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09jdGljb259IGZyb20gJy4vT2N0aWNvbnMnO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBCdXR0b25UeXBlID0gJ1BSSU1BUlknIHwgJ0lORk8nIHwgJ1NVQ0NFU1MnIHwgJ1dBUk5JTkcnIHwgJ0VSUk9SJztcbnR5cGUgQnV0dG9uU2l6ZSA9ICdFWFRSQV9TTUFMTCcgfCAnU01BTEwnIHwgJ0xBUkdFJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqIE9jdGljb24gaWNvbiBuYW1lLCB3aXRob3V0IHRoZSBgaWNvbi1gIHByZWZpeC4gRS5nLiBgJ2Fycm93LXVwJ2AgKi9cbiAgaWNvbj86IE9jdGljb247XG4gIC8qKiBPcHRpb25hbCBzcGVjaWZpZXIgZm9yIHNwZWNpYWwgYnV0dG9ucywgZS5nLiBwcmltYXJ5LCBpbmZvLCBzdWNjZXNzIG9yIGVycm9yIGJ1dHRvbnMuICovXG4gIGJ1dHRvblR5cGU/OiBCdXR0b25UeXBlO1xuICBzZWxlY3RlZD86IGJvb2xlYW47XG4gIC8qKiAgKi9cbiAgc2l6ZT86IEJ1dHRvblNpemU7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgLyoqIFRoZSBidXR0b24ncyBjb250ZW50OyBnZW5lcmFsbHkgYSBzdHJpbmcuICovXG4gIGNoaWxkcmVuOiBSZWFjdEVsZW1lbnQ7XG59O1xuXG5leHBvcnQgY29uc3QgQnV0dG9uU2l6ZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgRVhUUkFfU01BTEw6ICdFWFRSQV9TTUFMTCcsXG4gIFNNQUxMOiAnU01BTEwnLFxuICBMQVJHRTogJ0xBUkdFJyxcbn0pO1xuXG5leHBvcnQgY29uc3QgQnV0dG9uVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgUFJJTUFSWTogJ1BSSU1BUlknLFxuICBJTkZPOiAnSU5GTycsXG4gIFNVQ0NFU1M6ICdTVUNDRVNTJyxcbiAgV0FSTklORzogJ1dBUk5JTkcnLFxuICBFUlJPUjogJ0VSUk9SJyxcbn0pO1xuXG5jb25zdCBCdXR0b25TaXplQ2xhc3NuYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBFWFRSQV9TTUFMTDogJ2J0bi14cycsXG4gIFNNQUxMOiAnYnRuLXNtJyxcbiAgTEFSR0U6ICdidG4tbGcnLFxufSk7XG5cbmNvbnN0IEJ1dHRvblR5cGVDbGFzc25hbWVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFBSSU1BUlk6ICdidG4tcHJpbWFyeScsXG4gIElORk86ICdidG4taW5mbycsXG4gIFNVQ0NFU1M6ICdidG4tc3VjY2VzcycsXG4gIFdBUk5JTkc6ICdidG4td2FybmluZycsXG4gIEVSUk9SOiAnYnRuLWVycm9yJyxcbn0pO1xuXG4vKipcbiAqIEdlbmVyaWMgQnV0dG9uIHdyYXBwZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBCdXR0b24gPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBpY29uLFxuICAgIGJ1dHRvblR5cGUsXG4gICAgc2VsZWN0ZWQsXG4gICAgc2l6ZSxcbiAgICBjaGlsZHJlbixcbiAgICBjbGFzc05hbWUsXG4gICAgLi4ucmVtYWluaW5nUHJvcHMsXG4gIH0gPSBwcm9wcztcbiAgY29uc3Qgc2l6ZUNsYXNzbmFtZSA9IHNpemUgPT0gbnVsbCA/ICcnIDogQnV0dG9uU2l6ZUNsYXNzbmFtZXNbc2l6ZV0gfHwgJyc7XG4gIGNvbnN0IGJ1dHRvblR5cGVDbGFzc25hbWUgPSBidXR0b25UeXBlID09IG51bGwgPyAnJyA6IEJ1dHRvblR5cGVDbGFzc25hbWVzW2J1dHRvblR5cGVdIHx8ICcnO1xuICBjb25zdCBuZXdDbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgIGNsYXNzTmFtZSxcbiAgICAnYnRuJyxcbiAgICB7XG4gICAgICBbYGljb24gaWNvbi0ke2ljb259YF06IGljb24gIT0gbnVsbCxcbiAgICAgIFtzaXplQ2xhc3NuYW1lXTogc2l6ZSAhPSBudWxsLFxuICAgICAgc2VsZWN0ZWQsXG4gICAgICBbYnV0dG9uVHlwZUNsYXNzbmFtZV06ICBidXR0b25UeXBlICE9IG51bGwsXG4gICAgfSxcbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17bmV3Q2xhc3NOYW1lfSB7Li4ucmVtYWluaW5nUHJvcHN9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcbiJdfQ==