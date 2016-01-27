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

var _commons = require('../../commons');

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
  var resizableContainers = _commons.array.from((0, _getResizableContainers2['default'])(pane)).slice(0, -1);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldENvbnRhaW5lclRvSGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7cUJBdUJ3QixrQkFBa0I7Ozs7b0JBVmpCLE1BQU07O3NDQUNJLDBCQUEwQjs7Ozt1QkFDekMsZUFBZTs7QUFFbkMsSUFBTSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsQ0FBRyxJQUFJO1NBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLDRCQUFzQjtHQUFBLENBQUM7Q0FBQSxDQUFDOzs7Ozs7O0FBTTdFLFNBQVMsa0JBQWtCLENBQUMsSUFBdUIsRUFBc0I7QUFDdEYsTUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDOzs7QUFHM0IsTUFBTSxtQkFBbUIsR0FBRyxlQUFNLElBQUksQ0FBQyx5Q0FBdUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7QUFJbEYsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlELFFBQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFFBQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDNUMsWUFBTTtLQUNQOztBQUVELG1CQUFlLEdBQUcsU0FBUyxDQUFDO0dBQzdCOztBQUVELFNBQU8sZUFBZSxDQUFDO0NBQ3hCIiwiZmlsZSI6ImdldENvbnRhaW5lclRvSGlkZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtQYW5lSXRlbUNvbnRhaW5lcn0gZnJvbSAnLi4vdHlwZXMvUGFuZUl0ZW1Db250YWluZXInO1xuXG5pbXBvcnQge1RleHRFZGl0b3J9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGdldFJlc2l6YWJsZUNvbnRhaW5lcnMgZnJvbSAnLi9nZXRSZXNpemFibGVDb250YWluZXJzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5jb25zdCBjb250YWluc1RleHRFZGl0b3IgPSBwYW5lID0+IHBhbmUuZ2V0SXRlbXMoKS5zb21lKGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3IpO1xuXG4vKipcbiAqIEdldHMgdGhlIHJlc2l6ZWFibGUgY29udGFpbmVyIChQYW5lIG9yIFBhbmVBeGlzKSB3aGljaCBzaG91bGQgYmUgcmVzaXplZCBpbiBvcmRlciB0byBoaWRlIHRoZVxuICogcHJvdmlkZWQgcGFuZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Q29udGFpbmVyVG9IaWRlKHBhbmU6IFBhbmVJdGVtQ29udGFpbmVyKTogP1BhbmVJdGVtQ29udGFpbmVyIHtcbiAgbGV0IGNvbnRhaW5lclRvSGlkZSA9IG51bGw7XG5cbiAgLy8gVGhlIHRvcC1tb3N0IGNvbnRhaW5lciBpc24ndCByZXNpemFibGUgc28gZXhjbHVkZSB0aGF0IGltbWVkaWF0ZWx5LlxuICBjb25zdCByZXNpemFibGVDb250YWluZXJzID0gYXJyYXkuZnJvbShnZXRSZXNpemFibGVDb250YWluZXJzKHBhbmUpKS5zbGljZSgwLCAtMSk7XG5cbiAgLy8gRmluZCB0aGUgaGlnaGVzdCByZXNpemFibGUgY29udGFpbmVyIHRoYXQgZG9lc24ndCBjb250YWluIGEgdGV4dCBlZGl0b3IuIElmIHRoZSB2ZXJ5IGZpcnN0XG4gIC8vIGNvbnRhaW5lciBoYXMgYSB0ZXh0IGVkaXRvciwgdXNlIGl0IGFueXdheSAod2UgZ290dGEgaGlkZSBzb21ldGhpbmchKVxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmVzaXphYmxlQ29udGFpbmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHJlc2l6YWJsZUNvbnRhaW5lcnNbaV07XG4gICAgY29uc3QgaXNMZWFmID0gaSA9PT0gMDtcblxuICAgIGlmICghaXNMZWFmICYmIGNvbnRhaW5zVGV4dEVkaXRvcihjb250YWluZXIpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb250YWluZXJUb0hpZGUgPSBjb250YWluZXI7XG4gIH1cblxuICByZXR1cm4gY29udGFpbmVyVG9IaWRlO1xufVxuIl19