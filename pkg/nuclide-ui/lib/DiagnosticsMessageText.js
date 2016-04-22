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

var _reactForAtom = require('react-for-atom');

var DiagnosticsMessageText = function DiagnosticsMessageText(props) {
  var message = props.message;

  if (message.html != null) {
    return _reactForAtom.React.createElement('span', { dangerouslySetInnerHTML: { __html: message.html } });
  } else if (message.text != null) {
    return _reactForAtom.React.createElement(
      'span',
      null,
      message.text
    );
  } else {
    return _reactForAtom.React.createElement(
      'span',
      null,
      'Diagnostic lacks message.'
    );
  }
};
exports.DiagnosticsMessageText = DiagnosticsMessageText;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzTWVzc2FnZVRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O0FBUzdCLElBQU0sc0JBQXNCLEdBQUcsU0FBekIsc0JBQXNCLENBQUksS0FBSyxFQUFrQztNQUUxRSxPQUFPLEdBQ0wsS0FBSyxDQURQLE9BQU87O0FBRVQsTUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTtBQUN4QixXQUFPLDRDQUFNLHVCQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUMsQUFBQyxHQUFHLENBQUM7R0FDbEUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQy9CLFdBQU87OztNQUFPLE9BQU8sQ0FBQyxJQUFJO0tBQVEsQ0FBQztHQUNwQyxNQUFNO0FBQ0wsV0FBTzs7OztLQUFzQyxDQUFDO0dBQy9DO0NBQ0YsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc01lc3NhZ2VUZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIERpYWdub3N0aWNzTWVzc2FnZVRleHRQcm9wcyA9IHtcbiAgbWVzc2FnZToge1xuICAgIGh0bWw/OiBzdHJpbmc7XG4gICAgdGV4dD86IHN0cmluZztcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljc01lc3NhZ2VUZXh0ID0gKHByb3BzOiBEaWFnbm9zdGljc01lc3NhZ2VUZXh0UHJvcHMpID0+IHtcbiAgY29uc3Qge1xuICAgIG1lc3NhZ2UsXG4gIH0gPSBwcm9wcztcbiAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIDxzcGFuIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLmh0bWx9fSAvPjtcbiAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3Bhbj57bWVzc2FnZS50ZXh0fTwvc3Bhbj47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDxzcGFuPkRpYWdub3N0aWMgbGFja3MgbWVzc2FnZS48L3NwYW4+O1xuICB9XG59O1xuIl19