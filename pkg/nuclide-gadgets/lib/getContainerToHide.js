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

var _nuclideCommons = require('../../nuclide-commons');

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
  var resizableContainers = _nuclideCommons.array.from((0, _getResizableContainers2['default'])(pane)).slice(0, -1);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldENvbnRhaW5lclRvSGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBdUJ3QixrQkFBa0I7Ozs7b0JBVmpCLE1BQU07O3NDQUNJLDBCQUEwQjs7Ozs4QkFDekMsdUJBQXVCOztBQUUzQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFHLElBQUk7U0FBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksNEJBQXNCO0dBQUEsQ0FBQztDQUFBLENBQUM7Ozs7Ozs7QUFNN0UsU0FBUyxrQkFBa0IsQ0FBQyxJQUF1QixFQUFzQjtBQUN0RixNQUFJLGVBQWUsR0FBRyxJQUFJLENBQUM7OztBQUczQixNQUFNLG1CQUFtQixHQUFHLHNCQUFNLElBQUksQ0FBQyx5Q0FBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7QUFJbEYsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlELFFBQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFFBQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDNUMsWUFBTTtLQUNQOztBQUVELG1CQUFlLEdBQUcsU0FBUyxDQUFDO0dBQzdCOztBQUVELFNBQU8sZUFBZSxDQUFDO0NBQ3hCIiwiZmlsZSI6ImdldENvbnRhaW5lclRvSGlkZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtQYW5lSXRlbUNvbnRhaW5lcn0gZnJvbSAnLi4vdHlwZXMvUGFuZUl0ZW1Db250YWluZXInO1xuXG5pbXBvcnQge1RleHRFZGl0b3J9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGdldFJlc2l6YWJsZUNvbnRhaW5lcnMgZnJvbSAnLi9nZXRSZXNpemFibGVDb250YWluZXJzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmNvbnN0IGNvbnRhaW5zVGV4dEVkaXRvciA9IHBhbmUgPT4gcGFuZS5nZXRJdGVtcygpLnNvbWUoaXRlbSA9PiBpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcik7XG5cbi8qKlxuICogR2V0cyB0aGUgcmVzaXplYWJsZSBjb250YWluZXIgKFBhbmUgb3IgUGFuZUF4aXMpIHdoaWNoIHNob3VsZCBiZSByZXNpemVkIGluIG9yZGVyIHRvIGhpZGUgdGhlXG4gKiBwcm92aWRlZCBwYW5lLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRDb250YWluZXJUb0hpZGUocGFuZTogUGFuZUl0ZW1Db250YWluZXIpOiA/UGFuZUl0ZW1Db250YWluZXIge1xuICBsZXQgY29udGFpbmVyVG9IaWRlID0gbnVsbDtcblxuICAvLyBUaGUgdG9wLW1vc3QgY29udGFpbmVyIGlzbid0IHJlc2l6YWJsZSBzbyBleGNsdWRlIHRoYXQgaW1tZWRpYXRlbHkuXG4gIGNvbnN0IHJlc2l6YWJsZUNvbnRhaW5lcnMgPSBhcnJheS5mcm9tKGdldFJlc2l6YWJsZUNvbnRhaW5lcnMocGFuZSkpLnNsaWNlKDAsIC0xKTtcblxuICAvLyBGaW5kIHRoZSBoaWdoZXN0IHJlc2l6YWJsZSBjb250YWluZXIgdGhhdCBkb2Vzbid0IGNvbnRhaW4gYSB0ZXh0IGVkaXRvci4gSWYgdGhlIHZlcnkgZmlyc3RcbiAgLy8gY29udGFpbmVyIGhhcyBhIHRleHQgZWRpdG9yLCB1c2UgaXQgYW55d2F5ICh3ZSBnb3R0YSBoaWRlIHNvbWV0aGluZyEpXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSByZXNpemFibGVDb250YWluZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gcmVzaXphYmxlQ29udGFpbmVyc1tpXTtcbiAgICBjb25zdCBpc0xlYWYgPSBpID09PSAwO1xuXG4gICAgaWYgKCFpc0xlYWYgJiYgY29udGFpbnNUZXh0RWRpdG9yKGNvbnRhaW5lcikpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnRhaW5lclRvSGlkZSA9IGNvbnRhaW5lcjtcbiAgfVxuXG4gIHJldHVybiBjb250YWluZXJUb0hpZGU7XG59XG4iXX0=