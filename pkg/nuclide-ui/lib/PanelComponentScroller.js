Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var PanelComponentScroller = function PanelComponentScroller(props) {
  var style = props.overflowX == null ? null : { overflowX: props.overflowX };
  var className = (0, _classnames2['default'])('nuclide-ui-panel-component-scroller', {
    'nuclide-ui-panel-component-scroller--column': props.flexDirection === 'column'
  });

  return _reactForAtom.React.createElement(
    'div',
    { className: className, style: style },
    props.children
  );
};
exports.PanelComponentScroller = PanelComponentScroller;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhbmVsQ29tcG9uZW50U2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7MEJBV3VCLFlBQVk7Ozs7NEJBQ2YsZ0JBQWdCOztBQVE3QixJQUFNLHNCQUFzQixHQUFHLFNBQXpCLHNCQUFzQixDQUFJLEtBQUssRUFBMkI7QUFDckUsTUFBTSxLQUFLLEdBQUcsQUFBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksR0FBSSxJQUFJLEdBQUcsRUFBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBQyxDQUFDO0FBQzlFLE1BQU0sU0FBUyxHQUFHLDZCQUFXLHFDQUFxQyxFQUFFO0FBQ2xFLGlEQUE2QyxFQUFHLEtBQUssQ0FBQyxhQUFhLEtBQUssUUFBUSxBQUFDO0dBQ2xGLENBQUMsQ0FBQzs7QUFFSCxTQUNFOztNQUFLLFNBQVMsRUFBRSxTQUFTLEFBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxBQUFDO0lBQ3JDLEtBQUssQ0FBQyxRQUFRO0dBQ1gsQ0FDTjtDQUNILENBQUMiLCJmaWxlIjoiUGFuZWxDb21wb25lbnRTY3JvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjaGlsZHJlbjogUmVhY3QuRWxlbWVudDtcbiAgZmxleERpcmVjdGlvbj86ICdjb2x1bW4nO1xuICBvdmVyZmxvd1g/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY29uc3QgUGFuZWxDb21wb25lbnRTY3JvbGxlciA9IChwcm9wczogUHJvcHMpOiBSZWFjdC5FbGVtZW50ID0+IHtcbiAgY29uc3Qgc3R5bGUgPSAocHJvcHMub3ZlcmZsb3dYID09IG51bGwpID8gbnVsbCA6IHtvdmVyZmxvd1g6IHByb3BzLm92ZXJmbG93WH07XG4gIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ251Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXNjcm9sbGVyJywge1xuICAgICdudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1zY3JvbGxlci0tY29sdW1uJzogKHByb3BzLmZsZXhEaXJlY3Rpb24gPT09ICdjb2x1bW4nKSxcbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfSBzdHlsZT17c3R5bGV9PlxuICAgICAge3Byb3BzLmNoaWxkcmVufVxuICAgIDwvZGl2PlxuICApO1xufTtcbiJdfQ==