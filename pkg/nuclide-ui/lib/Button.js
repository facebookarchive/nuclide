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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1dHRvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFhdUIsWUFBWTs7Ozs0QkFDZixnQkFBZ0I7O0FBa0I3QixJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLGFBQVcsRUFBRSxhQUFhO0FBQzFCLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDLENBQUM7OztBQUVJLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkMsU0FBTyxFQUFFLFNBQVM7QUFDbEIsTUFBSSxFQUFFLE1BQU07QUFDWixTQUFPLEVBQUUsU0FBUztBQUNsQixTQUFPLEVBQUUsU0FBUztBQUNsQixPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3pDLGFBQVcsRUFBRSxRQUFRO0FBQ3JCLE9BQUssRUFBRSxRQUFRO0FBQ2YsT0FBSyxFQUFFLFFBQVE7Q0FDaEIsQ0FBQyxDQUFDOztBQUVILElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN6QyxTQUFPLEVBQUUsYUFBYTtBQUN0QixNQUFJLEVBQUUsVUFBVTtBQUNoQixTQUFPLEVBQUUsYUFBYTtBQUN0QixTQUFPLEVBQUUsYUFBYTtBQUN0QixPQUFLLEVBQUUsV0FBVztDQUNuQixDQUFDLENBQUM7Ozs7O0FBS0ksSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksS0FBSyxFQUFZOzs7TUFFcEMsSUFBSSxHQU9GLEtBQUssQ0FQUCxJQUFJO01BQ0osVUFBVSxHQU1SLEtBQUssQ0FOUCxVQUFVO01BQ1YsUUFBUSxHQUtOLEtBQUssQ0FMUCxRQUFRO01BQ1IsSUFBSSxHQUlGLEtBQUssQ0FKUCxJQUFJO01BQ0osUUFBUSxHQUdOLEtBQUssQ0FIUCxRQUFRO01BQ1IsU0FBUyxHQUVQLEtBQUssQ0FGUCxTQUFTOztNQUNOLGNBQWMsNEJBQ2YsS0FBSzs7QUFDVCxNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0UsTUFBTSxtQkFBbUIsR0FBRyxVQUFVLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0YsTUFBTSxZQUFZLEdBQUcsNkJBQ25CLFNBQVMsRUFDVCxLQUFLLGlFQUVXLElBQUksRUFBSyxJQUFJLElBQUksSUFBSSxnQ0FDbEMsYUFBYSxFQUFHLElBQUksSUFBSSxJQUFJLDRDQUM3QixRQUFRLGdDQUNQLG1CQUFtQixFQUFJLFVBQVUsSUFBSSxJQUFJLGdCQUU3QyxDQUFDO0FBQ0YsU0FDRTs7ZUFBSyxTQUFTLEVBQUUsWUFBWSxBQUFDLElBQUssY0FBYztJQUM3QyxRQUFRO0dBQ0wsQ0FDTjtDQUNILENBQUMiLCJmaWxlIjoiQnV0dG9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09jdGljb259IGZyb20gJy4vT2N0aWNvbnMnO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBCdXR0b25UeXBlID0gJ1BSSU1BUlknIHwgJ0lORk8nIHwgJ1NVQ0NFU1MnIHwgJ1dBUk5JTkcnIHwgJ0VSUk9SJztcbnR5cGUgQnV0dG9uU2l6ZSA9ICdFWFRSQV9TTUFMTCcgfCAnU01BTEwnIHwgJ0xBUkdFJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqIE9jdGljb24gaWNvbiBuYW1lLCB3aXRob3V0IHRoZSBgaWNvbi1gIHByZWZpeC4gRS5nLiBgJ2Fycm93LXVwJ2AgKi9cbiAgaWNvbj86IE9jdGljb247XG4gIC8qKiBPcHRpb25hbCBzcGVjaWZpZXIgZm9yIHNwZWNpYWwgYnV0dG9ucywgZS5nLiBwcmltYXJ5LCBpbmZvLCBzdWNjZXNzIG9yIGVycm9yIGJ1dHRvbnMuICovXG4gIGJ1dHRvblR5cGU/OiBCdXR0b25UeXBlO1xuICBzZWxlY3RlZD86IGJvb2xlYW47XG4gIC8qKiAgKi9cbiAgc2l6ZT86IEJ1dHRvblNpemU7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgLyoqIFRoZSBidXR0b24ncyBjb250ZW50OyBnZW5lcmFsbHkgYSBzdHJpbmcuICovXG4gIGNoaWxkcmVuOiBSZWFjdC5FbGVtZW50O1xufTtcblxuZXhwb3J0IGNvbnN0IEJ1dHRvblNpemVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIEVYVFJBX1NNQUxMOiAnRVhUUkFfU01BTEwnLFxuICBTTUFMTDogJ1NNQUxMJyxcbiAgTEFSR0U6ICdMQVJHRScsXG59KTtcblxuZXhwb3J0IGNvbnN0IEJ1dHRvblR5cGVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFBSSU1BUlk6ICdQUklNQVJZJyxcbiAgSU5GTzogJ0lORk8nLFxuICBTVUNDRVNTOiAnU1VDQ0VTUycsXG4gIFdBUk5JTkc6ICdXQVJOSU5HJyxcbiAgRVJST1I6ICdFUlJPUicsXG59KTtcblxuY29uc3QgQnV0dG9uU2l6ZUNsYXNzbmFtZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgRVhUUkFfU01BTEw6ICdidG4teHMnLFxuICBTTUFMTDogJ2J0bi1zbScsXG4gIExBUkdFOiAnYnRuLWxnJyxcbn0pO1xuXG5jb25zdCBCdXR0b25UeXBlQ2xhc3NuYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBQUklNQVJZOiAnYnRuLXByaW1hcnknLFxuICBJTkZPOiAnYnRuLWluZm8nLFxuICBTVUNDRVNTOiAnYnRuLXN1Y2Nlc3MnLFxuICBXQVJOSU5HOiAnYnRuLXdhcm5pbmcnLFxuICBFUlJPUjogJ2J0bi1lcnJvcicsXG59KTtcblxuLyoqXG4gKiBHZW5lcmljIEJ1dHRvbiB3cmFwcGVyLlxuICovXG5leHBvcnQgY29uc3QgQnV0dG9uID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7XG4gICAgaWNvbixcbiAgICBidXR0b25UeXBlLFxuICAgIHNlbGVjdGVkLFxuICAgIHNpemUsXG4gICAgY2hpbGRyZW4sXG4gICAgY2xhc3NOYW1lLFxuICAgIC4uLnJlbWFpbmluZ1Byb3BzLFxuICB9ID0gcHJvcHM7XG4gIGNvbnN0IHNpemVDbGFzc25hbWUgPSBzaXplID09IG51bGwgPyAnJyA6IEJ1dHRvblNpemVDbGFzc25hbWVzW3NpemVdIHx8ICcnO1xuICBjb25zdCBidXR0b25UeXBlQ2xhc3NuYW1lID0gYnV0dG9uVHlwZSA9PSBudWxsID8gJycgOiBCdXR0b25UeXBlQ2xhc3NuYW1lc1tidXR0b25UeXBlXSB8fCAnJztcbiAgY29uc3QgbmV3Q2xhc3NOYW1lID0gY2xhc3NuYW1lcyhcbiAgICBjbGFzc05hbWUsXG4gICAgJ2J0bicsXG4gICAge1xuICAgICAgW2BpY29uIGljb24tJHtpY29ufWBdOiBpY29uICE9IG51bGwsXG4gICAgICBbc2l6ZUNsYXNzbmFtZV06IHNpemUgIT0gbnVsbCxcbiAgICAgIHNlbGVjdGVkLFxuICAgICAgW2J1dHRvblR5cGVDbGFzc25hbWVdOiAgYnV0dG9uVHlwZSAhPSBudWxsLFxuICAgIH0sXG4gICk7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e25ld0NsYXNzTmFtZX0gey4uLnJlbWFpbmluZ1Byb3BzfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG4iXX0=