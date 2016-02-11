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

exports.applyTextEdit = applyTextEdit;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atomHelpers = require('../../atom-helpers');

/**
 * Attempts to apply the patch to the given file.
 *
 * The file must be currently open in Atom, and the changes will be applied to the buffer but not
 * saved.
 *
 * Returns true if the application was successful, otherwise false (e.g. if the oldText did not
 * match).
 */

function applyTextEdit(path, edit) {
  var editor = (0, _atomHelpers.existingEditorForUri)(path);
  (0, _assert2['default'])(editor != null);
  var buffer = editor.getBuffer();
  if (edit.oldRange.start.row === edit.oldRange.end.row) {
    // A little extra validation when the old range spans only one line. In particular, this helps
    // when the old range is empty so there is no old text for us to compare against. We can at
    // least abort if the line isn't long enough.
    var lineLength = buffer.lineLengthForRow(edit.oldRange.start.row);
    if (edit.oldRange.end.column > lineLength) {
      return false;
    }
  }
  if (edit.oldText != null) {
    var currentText = buffer.getTextInRange(edit.oldRange);
    if (currentText !== edit.oldText) {
      return false;
    }
  }
  buffer.setTextInRange(edit.oldRange, edit.newText);
  return true;
}

// If included, this will be used to verify that the edit still applies cleanly.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFvQnNCLFFBQVE7Ozs7MkJBRUssb0JBQW9COzs7Ozs7Ozs7Ozs7QUFXaEQsU0FBUyxhQUFhLENBQUMsSUFBZ0IsRUFBRSxJQUFjLEVBQVc7QUFDdkUsTUFBTSxNQUFNLEdBQUcsdUNBQXFCLElBQUksQ0FBQyxDQUFDO0FBQzFDLDJCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFOzs7O0FBSXJELFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRSxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLEVBQUU7QUFDekMsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsTUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RCxRQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hDLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7R0FDRjtBQUNELFFBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5leHBvcnQgdHlwZSBUZXh0RWRpdCA9IHtcbiAgb2xkUmFuZ2U6IGF0b20kUmFuZ2UsXG4gIG5ld1RleHQ6IHN0cmluZyxcbiAgLy8gSWYgaW5jbHVkZWQsIHRoaXMgd2lsbCBiZSB1c2VkIHRvIHZlcmlmeSB0aGF0IHRoZSBlZGl0IHN0aWxsIGFwcGxpZXMgY2xlYW5seS5cbiAgb2xkVGV4dD86IHN0cmluZyxcbn1cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge2V4aXN0aW5nRWRpdG9yRm9yVXJpfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGFwcGx5IHRoZSBwYXRjaCB0byB0aGUgZ2l2ZW4gZmlsZS5cbiAqXG4gKiBUaGUgZmlsZSBtdXN0IGJlIGN1cnJlbnRseSBvcGVuIGluIEF0b20sIGFuZCB0aGUgY2hhbmdlcyB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGJ1ZmZlciBidXQgbm90XG4gKiBzYXZlZC5cbiAqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIHdhcyBzdWNjZXNzZnVsLCBvdGhlcndpc2UgZmFsc2UgKGUuZy4gaWYgdGhlIG9sZFRleHQgZGlkIG5vdFxuICogbWF0Y2gpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlUZXh0RWRpdChwYXRoOiBOdWNsaWRlVXJpLCBlZGl0OiBUZXh0RWRpdCk6IGJvb2xlYW4ge1xuICBjb25zdCBlZGl0b3IgPSBleGlzdGluZ0VkaXRvckZvclVyaShwYXRoKTtcbiAgaW52YXJpYW50KGVkaXRvciAhPSBudWxsKTtcbiAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICBpZiAoZWRpdC5vbGRSYW5nZS5zdGFydC5yb3cgPT09IGVkaXQub2xkUmFuZ2UuZW5kLnJvdykge1xuICAgIC8vIEEgbGl0dGxlIGV4dHJhIHZhbGlkYXRpb24gd2hlbiB0aGUgb2xkIHJhbmdlIHNwYW5zIG9ubHkgb25lIGxpbmUuIEluIHBhcnRpY3VsYXIsIHRoaXMgaGVscHNcbiAgICAvLyB3aGVuIHRoZSBvbGQgcmFuZ2UgaXMgZW1wdHkgc28gdGhlcmUgaXMgbm8gb2xkIHRleHQgZm9yIHVzIHRvIGNvbXBhcmUgYWdhaW5zdC4gV2UgY2FuIGF0XG4gICAgLy8gbGVhc3QgYWJvcnQgaWYgdGhlIGxpbmUgaXNuJ3QgbG9uZyBlbm91Z2guXG4gICAgY29uc3QgbGluZUxlbmd0aCA9IGJ1ZmZlci5saW5lTGVuZ3RoRm9yUm93KGVkaXQub2xkUmFuZ2Uuc3RhcnQucm93KTtcbiAgICBpZiAoZWRpdC5vbGRSYW5nZS5lbmQuY29sdW1uID4gbGluZUxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBpZiAoZWRpdC5vbGRUZXh0ICE9IG51bGwpIHtcbiAgICBjb25zdCBjdXJyZW50VGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShlZGl0Lm9sZFJhbmdlKTtcbiAgICBpZiAoY3VycmVudFRleHQgIT09IGVkaXQub2xkVGV4dCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoZWRpdC5vbGRSYW5nZSwgZWRpdC5uZXdUZXh0KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=