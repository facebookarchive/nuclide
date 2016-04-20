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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _reactForAtom = require('react-for-atom');

var _DiagnosticsMessageText = require('./DiagnosticsMessageText');

// TODO move LESS styles to nuclide-ui
var DiagnosticsTraceItem = function DiagnosticsTraceItem(props) {
  var trace = props.trace;
  var goToLocation = props.goToLocation;

  var locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  var path = trace.filePath;
  if (path) {
    var _atom$project$relativizePath = atom.project.relativizePath(path);

    var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

    var relativePath = _atom$project$relativizePath2[1];

    var locString = relativePath;
    if (trace.range) {
      locString += ':' + (trace.range.start.row + 1);
    }
    var onClick = function onClick() {
      goToLocation(path, Math.max(trace.range ? trace.range.start.row : 0, 0));
    };
    locSpan = _reactForAtom.React.createElement(
      'span',
      null,
      ': ',
      _reactForAtom.React.createElement(
        'a',
        { href: '#', onClick: onClick },
        locString
      )
    );
  }
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(_DiagnosticsMessageText.DiagnosticsMessageText, { message: trace }),
    locSpan
  );
};
exports.DiagnosticsTraceItem = DiagnosticsTraceItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzVHJhY2VJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzRCQWVvQixnQkFBZ0I7O3NDQUNDLDBCQUEwQjs7O0FBUXhELElBQU0sb0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CLENBQUksS0FBSyxFQUFnQztNQUV0RSxLQUFLLEdBRUgsS0FBSyxDQUZQLEtBQUs7TUFDTCxZQUFZLEdBQ1YsS0FBSyxDQURQLFlBQVk7O0FBRWQsTUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUVuQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBQzVCLE1BQUksSUFBSSxFQUFFO3VDQUNpQixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7Ozs7UUFBakQsWUFBWTs7QUFDckIsUUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDO0FBQzdCLFFBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNmLGVBQVMsV0FBUSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBLEFBQUUsQ0FBQztLQUM5QztBQUNELFFBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxHQUFTO0FBQ3BCLGtCQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDMUUsQ0FBQztBQUNGLFdBQU8sR0FBRzs7OztNQUFROztVQUFHLElBQUksRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQztRQUFFLFNBQVM7T0FBSztLQUFPLENBQUM7R0FDeEU7QUFDRCxTQUNFOzs7SUFDRSxvRkFBd0IsT0FBTyxFQUFFLEtBQUssQUFBQyxHQUFHO0lBQ3pDLE9BQU87R0FDSixDQUNOO0NBQ0gsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1RyYWNlSXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgVHJhY2UsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGlhZ25vc3RpY3NNZXNzYWdlVGV4dH0gZnJvbSAnLi9EaWFnbm9zdGljc01lc3NhZ2VUZXh0JztcblxudHlwZSBEaWFnbm9zdGljc1RyYWNlSXRlbVByb3BzID0ge1xuICB0cmFjZTogVHJhY2U7XG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZDtcbn07XG5cbi8vIFRPRE8gbW92ZSBMRVNTIHN0eWxlcyB0byBudWNsaWRlLXVpXG5leHBvcnQgY29uc3QgRGlhZ25vc3RpY3NUcmFjZUl0ZW0gPSAocHJvcHM6IERpYWdub3N0aWNzVHJhY2VJdGVtUHJvcHMpID0+IHtcbiAgY29uc3Qge1xuICAgIHRyYWNlLFxuICAgIGdvVG9Mb2NhdGlvbixcbiAgfSA9IHByb3BzO1xuICBsZXQgbG9jU3BhbiA9IG51bGw7XG4gIC8vIExvY2FsIHZhcmlhYmxlIHNvIHRoYXQgdGhlIHR5cGUgcmVmaW5lbWVudCBob2xkcyBpbiB0aGUgb25DbGljayBoYW5kbGVyLlxuICBjb25zdCBwYXRoID0gdHJhY2UuZmlsZVBhdGg7XG4gIGlmIChwYXRoKSB7XG4gICAgY29uc3QgWywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKTtcbiAgICBsZXQgbG9jU3RyaW5nID0gcmVsYXRpdmVQYXRoO1xuICAgIGlmICh0cmFjZS5yYW5nZSkge1xuICAgICAgbG9jU3RyaW5nICs9IGA6JHt0cmFjZS5yYW5nZS5zdGFydC5yb3cgKyAxfWA7XG4gICAgfVxuICAgIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICBnb1RvTG9jYXRpb24ocGF0aCwgTWF0aC5tYXgodHJhY2UucmFuZ2UgPyB0cmFjZS5yYW5nZS5zdGFydC5yb3cgOiAwLCAwKSk7XG4gICAgfTtcbiAgICBsb2NTcGFuID0gPHNwYW4+OiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e29uQ2xpY2t9Pntsb2NTdHJpbmd9PC9hPjwvc3Bhbj47XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPERpYWdub3N0aWNzTWVzc2FnZVRleHQgbWVzc2FnZT17dHJhY2V9IC8+XG4gICAgICB7bG9jU3Bhbn1cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG4iXX0=