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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFvQnNCLFFBQVE7Ozs7a0NBRUssNEJBQTRCOzs7Ozs7Ozs7Ozs7QUFXeEQsU0FBUyxhQUFhLENBQUMsSUFBZ0IsRUFBRSxJQUFjLEVBQVc7QUFDdkUsTUFBTSxNQUFNLEdBQUcsOENBQXFCLElBQUksQ0FBQyxDQUFDO0FBQzFDLDJCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFOzs7O0FBSXJELFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRSxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLEVBQUU7QUFDekMsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsTUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RCxRQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hDLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7R0FDRjtBQUNELFFBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmV4cG9ydCB0eXBlIFRleHRFZGl0ID0ge1xuICBvbGRSYW5nZTogYXRvbSRSYW5nZTtcbiAgbmV3VGV4dDogc3RyaW5nO1xuICAvLyBJZiBpbmNsdWRlZCwgdGhpcyB3aWxsIGJlIHVzZWQgdG8gdmVyaWZ5IHRoYXQgdGhlIGVkaXQgc3RpbGwgYXBwbGllcyBjbGVhbmx5LlxuICBvbGRUZXh0Pzogc3RyaW5nO1xufTtcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge2V4aXN0aW5nRWRpdG9yRm9yVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gYXBwbHkgdGhlIHBhdGNoIHRvIHRoZSBnaXZlbiBmaWxlLlxuICpcbiAqIFRoZSBmaWxlIG11c3QgYmUgY3VycmVudGx5IG9wZW4gaW4gQXRvbSwgYW5kIHRoZSBjaGFuZ2VzIHdpbGwgYmUgYXBwbGllZCB0byB0aGUgYnVmZmVyIGJ1dCBub3RcbiAqIHNhdmVkLlxuICpcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gd2FzIHN1Y2Nlc3NmdWwsIG90aGVyd2lzZSBmYWxzZSAoZS5nLiBpZiB0aGUgb2xkVGV4dCBkaWQgbm90XG4gKiBtYXRjaCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVRleHRFZGl0KHBhdGg6IE51Y2xpZGVVcmksIGVkaXQ6IFRleHRFZGl0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGVkaXRvciA9IGV4aXN0aW5nRWRpdG9yRm9yVXJpKHBhdGgpO1xuICBpbnZhcmlhbnQoZWRpdG9yICE9IG51bGwpO1xuICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gIGlmIChlZGl0Lm9sZFJhbmdlLnN0YXJ0LnJvdyA9PT0gZWRpdC5vbGRSYW5nZS5lbmQucm93KSB7XG4gICAgLy8gQSBsaXR0bGUgZXh0cmEgdmFsaWRhdGlvbiB3aGVuIHRoZSBvbGQgcmFuZ2Ugc3BhbnMgb25seSBvbmUgbGluZS4gSW4gcGFydGljdWxhciwgdGhpcyBoZWxwc1xuICAgIC8vIHdoZW4gdGhlIG9sZCByYW5nZSBpcyBlbXB0eSBzbyB0aGVyZSBpcyBubyBvbGQgdGV4dCBmb3IgdXMgdG8gY29tcGFyZSBhZ2FpbnN0LiBXZSBjYW4gYXRcbiAgICAvLyBsZWFzdCBhYm9ydCBpZiB0aGUgbGluZSBpc24ndCBsb25nIGVub3VnaC5cbiAgICBjb25zdCBsaW5lTGVuZ3RoID0gYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3coZWRpdC5vbGRSYW5nZS5zdGFydC5yb3cpO1xuICAgIGlmIChlZGl0Lm9sZFJhbmdlLmVuZC5jb2x1bW4gPiBsaW5lTGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmIChlZGl0Lm9sZFRleHQgIT0gbnVsbCkge1xuICAgIGNvbnN0IGN1cnJlbnRUZXh0ID0gYnVmZmVyLmdldFRleHRJblJhbmdlKGVkaXQub2xkUmFuZ2UpO1xuICAgIGlmIChjdXJyZW50VGV4dCAhPT0gZWRpdC5vbGRUZXh0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShlZGl0Lm9sZFJhbmdlLCBlZGl0Lm5ld1RleHQpO1xuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==