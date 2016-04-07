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
/* eslint-disable react/prop-types */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1dHRvbkdyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBV3VCLFlBQVk7Ozs7NEJBQ2YsZ0JBQWdCOztBQVk3QixJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDNUMsYUFBVyxFQUFFLGFBQWE7QUFDMUIsT0FBSyxFQUFFLE9BQU87QUFDZCxPQUFLLEVBQUUsT0FBTztDQUNmLENBQUMsQ0FBQzs7O0FBRUgsSUFBTSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzlDLGFBQVcsRUFBRSxjQUFjO0FBQzNCLE9BQUssRUFBRSxjQUFjO0FBQ3JCLE9BQUssRUFBRSxjQUFjO0NBQ3RCLENBQUMsQ0FBQzs7Ozs7O0FBTUksSUFBTSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksS0FBSyxFQUFZO01BRXpDLElBQUksR0FHRixLQUFLLENBSFAsSUFBSTtNQUNKLFFBQVEsR0FFTixLQUFLLENBRlAsUUFBUTtNQUNSLFNBQVMsR0FDUCxLQUFLLENBRFAsU0FBUzs7QUFFWCxNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEYsTUFBTSxZQUFZLEdBQUcsNkJBQ25CLFNBQVMsRUFDVCxXQUFXLHNCQUVSLGFBQWEsRUFBRyxJQUFJLElBQUksSUFBSSxFQUVoQyxDQUFDO0FBQ0YsU0FDRTs7TUFBSyxTQUFTLEVBQUUsWUFBWSxBQUFDO0lBQzFCLFFBQVE7R0FDTCxDQUNOO0NBQ0gsQ0FBQyIsImZpbGUiOiJCdXR0b25Hcm91cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIEJ1dHRvbkdyb3VwU2l6ZSA9ICdFWFRSQV9TTUFMTCcgfCAnU01BTEwnIHwgJ0xBUkdFJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBidXR0b25zIHdpdGhpbiB0aGUgZ3JvdXAuIE92ZXJyaWRlcyBhbnkgYHNpemVgIHByb3BzIG9uIGNoaWxkIGJ1dHRvbnMuICovXG4gIHNpemU/OiBCdXR0b25Hcm91cFNpemU7XG4gIC8qKiBUaGUgY29udGVudHMgb2YgdGhlIEJ1dHRvbkdyb3VwOyBHZW5lcmFsbHksIGFuIGluc3RhbmNlIG9mIGBCdXR0b25gLiAqL1xuICBjaGlsZHJlbjogUmVhY3RFbGVtZW50O1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBCdXR0b25Hcm91cFNpemVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIEVYVFJBX1NNQUxMOiAnRVhUUkFfU01BTEwnLFxuICBTTUFMTDogJ1NNQUxMJyxcbiAgTEFSR0U6ICdMQVJHRScsXG59KTtcblxuY29uc3QgQnV0dG9uR3JvdXBTaXplQ2xhc3NuYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICBFWFRSQV9TTUFMTDogJ2J0bi1ncm91cC14cycsXG4gIFNNQUxMOiAnYnRuLWdyb3VwLXNtJyxcbiAgTEFSR0U6ICdidG4tZ3JvdXAtbGcnLFxufSk7XG5cbi8qKlxuICogVmlzdWFsbHkgZ3JvdXBzIEJ1dHRvbnMgcGFzc2VkIGluIGFzIGNoaWxkcmVuLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgY29uc3QgQnV0dG9uR3JvdXAgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBzaXplLFxuICAgIGNoaWxkcmVuLFxuICAgIGNsYXNzTmFtZSxcbiAgfSA9IHByb3BzO1xuICBjb25zdCBzaXplQ2xhc3NOYW1lID0gc2l6ZSA9PSBudWxsID8gJycgOiBCdXR0b25Hcm91cFNpemVDbGFzc25hbWVzW3NpemVdIHx8ICcnO1xuICBjb25zdCBuZXdDbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgIGNsYXNzTmFtZSxcbiAgICAnYnRuLWdyb3VwJyxcbiAgICB7XG4gICAgICBbc2l6ZUNsYXNzTmFtZV06IHNpemUgIT0gbnVsbCxcbiAgICB9LFxuICApO1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtuZXdDbGFzc05hbWV9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcbiJdfQ==