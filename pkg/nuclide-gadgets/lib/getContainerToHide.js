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

exports['default'] = getContainerToHide;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _getResizableContainers = require('./getResizableContainers');

var _getResizableContainers2 = _interopRequireDefault(_getResizableContainers);

var containsTextEditor = function containsTextEditor(pane) {
  return pane.getItems().some(function (item) {
    return item instanceof _atom.TextEditor;
  });
};

/**
 * Gets the resizeable container (Pane or PaneAxis) which should be resized in order to hide the
 * provided pane.
 */

function getContainerToHide(pane) {
  var containerToHide = null;

  // The top-most container isn't resizable so exclude that immediately.
  var resizableContainers = Array.from((0, _getResizableContainers2['default'])(pane)).slice(0, -1);

  // Find the highest resizable container that doesn't contain a text editor. If the very first
  // container has a text editor, use it anyway (we gotta hide something!)
  for (var i = 0, len = resizableContainers.length; i < len; i++) {
    var container = resizableContainers[i];
    var isLeaf = i === 0;

    if (!isLeaf && containsTextEditor(container)) {
      break;
    }

    containerToHide = container;
  }

  return containerToHide;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldENvbnRhaW5lclRvSGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBc0J3QixrQkFBa0I7Ozs7b0JBVGpCLE1BQU07O3NDQUNJLDBCQUEwQjs7OztBQUU3RCxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFHLElBQUk7U0FBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksNEJBQXNCO0dBQUEsQ0FBQztDQUFBLENBQUM7Ozs7Ozs7QUFNN0UsU0FBUyxrQkFBa0IsQ0FBQyxJQUF1QixFQUFzQjtBQUN0RixNQUFJLGVBQWUsR0FBRyxJQUFJLENBQUM7OztBQUczQixNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMseUNBQXVCLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0FBSWxGLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5RCxRQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxRQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2QixRQUFJLENBQUMsTUFBTSxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzVDLFlBQU07S0FDUDs7QUFFRCxtQkFBZSxHQUFHLFNBQVMsQ0FBQztHQUM3Qjs7QUFFRCxTQUFPLGVBQWUsQ0FBQztDQUN4QiIsImZpbGUiOiJnZXRDb250YWluZXJUb0hpZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UGFuZUl0ZW1Db250YWluZXJ9IGZyb20gJy4uL3R5cGVzL1BhbmVJdGVtQ29udGFpbmVyJztcblxuaW1wb3J0IHtUZXh0RWRpdG9yfSBmcm9tICdhdG9tJztcbmltcG9ydCBnZXRSZXNpemFibGVDb250YWluZXJzIGZyb20gJy4vZ2V0UmVzaXphYmxlQ29udGFpbmVycyc7XG5cbmNvbnN0IGNvbnRhaW5zVGV4dEVkaXRvciA9IHBhbmUgPT4gcGFuZS5nZXRJdGVtcygpLnNvbWUoaXRlbSA9PiBpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcik7XG5cbi8qKlxuICogR2V0cyB0aGUgcmVzaXplYWJsZSBjb250YWluZXIgKFBhbmUgb3IgUGFuZUF4aXMpIHdoaWNoIHNob3VsZCBiZSByZXNpemVkIGluIG9yZGVyIHRvIGhpZGUgdGhlXG4gKiBwcm92aWRlZCBwYW5lLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRDb250YWluZXJUb0hpZGUocGFuZTogUGFuZUl0ZW1Db250YWluZXIpOiA/UGFuZUl0ZW1Db250YWluZXIge1xuICBsZXQgY29udGFpbmVyVG9IaWRlID0gbnVsbDtcblxuICAvLyBUaGUgdG9wLW1vc3QgY29udGFpbmVyIGlzbid0IHJlc2l6YWJsZSBzbyBleGNsdWRlIHRoYXQgaW1tZWRpYXRlbHkuXG4gIGNvbnN0IHJlc2l6YWJsZUNvbnRhaW5lcnMgPSBBcnJheS5mcm9tKGdldFJlc2l6YWJsZUNvbnRhaW5lcnMocGFuZSkpLnNsaWNlKDAsIC0xKTtcblxuICAvLyBGaW5kIHRoZSBoaWdoZXN0IHJlc2l6YWJsZSBjb250YWluZXIgdGhhdCBkb2Vzbid0IGNvbnRhaW4gYSB0ZXh0IGVkaXRvci4gSWYgdGhlIHZlcnkgZmlyc3RcbiAgLy8gY29udGFpbmVyIGhhcyBhIHRleHQgZWRpdG9yLCB1c2UgaXQgYW55d2F5ICh3ZSBnb3R0YSBoaWRlIHNvbWV0aGluZyEpXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSByZXNpemFibGVDb250YWluZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gcmVzaXphYmxlQ29udGFpbmVyc1tpXTtcbiAgICBjb25zdCBpc0xlYWYgPSBpID09PSAwO1xuXG4gICAgaWYgKCFpc0xlYWYgJiYgY29udGFpbnNUZXh0RWRpdG9yKGNvbnRhaW5lcikpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnRhaW5lclRvSGlkZSA9IGNvbnRhaW5lcjtcbiAgfVxuXG4gIHJldHVybiBjb250YWluZXJUb0hpZGU7XG59XG4iXX0=