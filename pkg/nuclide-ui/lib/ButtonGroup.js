Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

var ButtonGroupSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

exports.ButtonGroupSizes = ButtonGroupSizes;
var ButtonGroupSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-group-xs',
  SMALL: 'btn-group-sm',
  LARGE: 'btn-group-lg'
});

/**
 * Visually groups Buttons passed in as children.
 */
var ButtonGroup = function ButtonGroup(props) {
  var size = props.size;
  var children = props.children;
  var className = props.className;

  var sizeClassName = size == null ? '' : ButtonGroupSizeClassnames[size] || '';
  var newClassName = (0, _classnames3['default'])(className, 'btn-group', _defineProperty({}, sizeClassName, size != null));
  return _reactForAtom.React.createElement(
    'div',
    { className: newClassName },
    children
  );
};
exports.ButtonGroup = ButtonGroup;

/** The size of the buttons within the group. Overrides any `size` props on child buttons. */

/** The contents of the ButtonGroup; Generally, an instance of `Button`. */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1dHRvbkdyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBV3VCLFlBQVk7Ozs7NEJBQ2YsZ0JBQWdCOztBQVk3QixJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDNUMsYUFBVyxFQUFFLGFBQWE7QUFDMUIsT0FBSyxFQUFFLE9BQU87QUFDZCxPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzlDLGFBQVcsRUFBRSxjQUFjO0FBQzNCLE9BQUssRUFBRSxjQUFjO0FBQ3JCLE9BQUssRUFBRSxjQUFjO0NBQ3RCLENBQUMsQ0FBQzs7Ozs7QUFLSSxJQUFNLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxLQUFLLEVBQVk7TUFFekMsSUFBSSxHQUdGLEtBQUssQ0FIUCxJQUFJO01BQ0osUUFBUSxHQUVOLEtBQUssQ0FGUCxRQUFRO01BQ1IsU0FBUyxHQUNQLEtBQUssQ0FEUCxTQUFTOztBQUVYLE1BQU0sYUFBYSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoRixNQUFNLFlBQVksR0FBRyw2QkFDbkIsU0FBUyxFQUNULFdBQVcsc0JBRVIsYUFBYSxFQUFHLElBQUksSUFBSSxJQUFJLEVBRWhDLENBQUM7QUFDRixTQUNFOztNQUFLLFNBQVMsRUFBRSxZQUFZLEFBQUM7SUFDMUIsUUFBUTtHQUNMLENBQ047Q0FDSCxDQUFDIiwiZmlsZSI6IkJ1dHRvbkdyb3VwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgQnV0dG9uR3JvdXBTaXplID0gJ0VYVFJBX1NNQUxMJyB8ICdTTUFMTCcgfCAnTEFSR0UnO1xuXG50eXBlIFByb3BzID0ge1xuICAvKiogVGhlIHNpemUgb2YgdGhlIGJ1dHRvbnMgd2l0aGluIHRoZSBncm91cC4gT3ZlcnJpZGVzIGFueSBgc2l6ZWAgcHJvcHMgb24gY2hpbGQgYnV0dG9ucy4gKi9cbiAgc2l6ZT86IEJ1dHRvbkdyb3VwU2l6ZTtcbiAgLyoqIFRoZSBjb250ZW50cyBvZiB0aGUgQnV0dG9uR3JvdXA7IEdlbmVyYWxseSwgYW4gaW5zdGFuY2Ugb2YgYEJ1dHRvbmAuICovXG4gIGNoaWxkcmVuOiBSZWFjdEVsZW1lbnQ7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBCdXR0b25Hcm91cFNpemVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIEVYVFJBX1NNQUxMOiAnRVhUUkFfU01BTEwnLFxuICBTTUFMTDogJ1NNQUxMJyxcbiAgTEFSR0U6ICdMQVJHRScsXG59KTtcblxuY29uc3QgQnV0dG9uR3JvdXBTaXplQ2xhc3NuYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBFWFRSQV9TTUFMTDogJ2J0bi1ncm91cC14cycsXG4gIFNNQUxMOiAnYnRuLWdyb3VwLXNtJyxcbiAgTEFSR0U6ICdidG4tZ3JvdXAtbGcnLFxufSk7XG5cbi8qKlxuICogVmlzdWFsbHkgZ3JvdXBzIEJ1dHRvbnMgcGFzc2VkIGluIGFzIGNoaWxkcmVuLlxuICovXG5leHBvcnQgY29uc3QgQnV0dG9uR3JvdXAgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBzaXplLFxuICAgIGNoaWxkcmVuLFxuICAgIGNsYXNzTmFtZSxcbiAgfSA9IHByb3BzO1xuICBjb25zdCBzaXplQ2xhc3NOYW1lID0gc2l6ZSA9PSBudWxsID8gJycgOiBCdXR0b25Hcm91cFNpemVDbGFzc25hbWVzW3NpemVdIHx8ICcnO1xuICBjb25zdCBuZXdDbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgIGNsYXNzTmFtZSxcbiAgICAnYnRuLWdyb3VwJyxcbiAgICB7XG4gICAgICBbc2l6ZUNsYXNzTmFtZV06IHNpemUgIT0gbnVsbCxcbiAgICB9LFxuICApO1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtuZXdDbGFzc05hbWV9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcbiJdfQ==