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

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

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
  var editor = (0, _nuclideAtomHelpers.existingEditorForUri)(path);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFvQnNCLFFBQVE7Ozs7a0NBRUssNEJBQTRCOzs7Ozs7Ozs7Ozs7QUFXeEQsU0FBUyxhQUFhLENBQUMsSUFBZ0IsRUFBRSxJQUFjLEVBQVc7QUFDdkUsTUFBTSxNQUFNLEdBQUcsOENBQXFCLElBQUksQ0FBQyxDQUFDO0FBQzFDLDJCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFOzs7O0FBSXJELFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRSxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLEVBQUU7QUFDekMsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsTUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RCxRQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hDLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7R0FDRjtBQUNELFFBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmV4cG9ydCB0eXBlIFRleHRFZGl0ID0ge1xuICBvbGRSYW5nZTogYXRvbSRSYW5nZTtcbiAgbmV3VGV4dDogc3RyaW5nO1xuICAvLyBJZiBpbmNsdWRlZCwgdGhpcyB3aWxsIGJlIHVzZWQgdG8gdmVyaWZ5IHRoYXQgdGhlIGVkaXQgc3RpbGwgYXBwbGllcyBjbGVhbmx5LlxuICBvbGRUZXh0Pzogc3RyaW5nO1xufVxuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7ZXhpc3RpbmdFZGl0b3JGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBhcHBseSB0aGUgcGF0Y2ggdG8gdGhlIGdpdmVuIGZpbGUuXG4gKlxuICogVGhlIGZpbGUgbXVzdCBiZSBjdXJyZW50bHkgb3BlbiBpbiBBdG9tLCBhbmQgdGhlIGNoYW5nZXMgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBidWZmZXIgYnV0IG5vdFxuICogc2F2ZWQuXG4gKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBsaWNhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgb3RoZXJ3aXNlIGZhbHNlIChlLmcuIGlmIHRoZSBvbGRUZXh0IGRpZCBub3RcbiAqIG1hdGNoKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGV4dEVkaXQocGF0aDogTnVjbGlkZVVyaSwgZWRpdDogVGV4dEVkaXQpOiBib29sZWFuIHtcbiAgY29uc3QgZWRpdG9yID0gZXhpc3RpbmdFZGl0b3JGb3JVcmkocGF0aCk7XG4gIGludmFyaWFudChlZGl0b3IgIT0gbnVsbCk7XG4gIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgaWYgKGVkaXQub2xkUmFuZ2Uuc3RhcnQucm93ID09PSBlZGl0Lm9sZFJhbmdlLmVuZC5yb3cpIHtcbiAgICAvLyBBIGxpdHRsZSBleHRyYSB2YWxpZGF0aW9uIHdoZW4gdGhlIG9sZCByYW5nZSBzcGFucyBvbmx5IG9uZSBsaW5lLiBJbiBwYXJ0aWN1bGFyLCB0aGlzIGhlbHBzXG4gICAgLy8gd2hlbiB0aGUgb2xkIHJhbmdlIGlzIGVtcHR5IHNvIHRoZXJlIGlzIG5vIG9sZCB0ZXh0IGZvciB1cyB0byBjb21wYXJlIGFnYWluc3QuIFdlIGNhbiBhdFxuICAgIC8vIGxlYXN0IGFib3J0IGlmIHRoZSBsaW5lIGlzbid0IGxvbmcgZW5vdWdoLlxuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBidWZmZXIubGluZUxlbmd0aEZvclJvdyhlZGl0Lm9sZFJhbmdlLnN0YXJ0LnJvdyk7XG4gICAgaWYgKGVkaXQub2xkUmFuZ2UuZW5kLmNvbHVtbiA+IGxpbmVMZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgaWYgKGVkaXQub2xkVGV4dCAhPSBudWxsKSB7XG4gICAgY29uc3QgY3VycmVudFRleHQgPSBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoZWRpdC5vbGRSYW5nZSk7XG4gICAgaWYgKGN1cnJlbnRUZXh0ICE9PSBlZGl0Lm9sZFRleHQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgYnVmZmVyLnNldFRleHRJblJhbmdlKGVkaXQub2xkUmFuZ2UsIGVkaXQubmV3VGV4dCk7XG4gIHJldHVybiB0cnVlO1xufVxuIl19