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
  var editor = (0, _atomHelpers.editorForPath)(path);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFvQnNCLFFBQVE7Ozs7MkJBRUYsb0JBQW9COzs7Ozs7Ozs7Ozs7QUFXekMsU0FBUyxhQUFhLENBQUMsSUFBZ0IsRUFBRSxJQUFjLEVBQVc7QUFDdkUsTUFBTSxNQUFNLEdBQUcsZ0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDbkMsMkJBQVUsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNsQyxNQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Ozs7QUFJckQsUUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BFLFFBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsRUFBRTtBQUN6QyxhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0Y7QUFDRCxNQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ3hCLFFBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pELFFBQUksV0FBVyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEMsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsUUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxTQUFPLElBQUksQ0FBQztDQUNiIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmV4cG9ydCB0eXBlIFRleHRFZGl0ID0ge1xuICBvbGRSYW5nZTogYXRvbSRSYW5nZSxcbiAgbmV3VGV4dDogc3RyaW5nLFxuICAvLyBJZiBpbmNsdWRlZCwgdGhpcyB3aWxsIGJlIHVzZWQgdG8gdmVyaWZ5IHRoYXQgdGhlIGVkaXQgc3RpbGwgYXBwbGllcyBjbGVhbmx5LlxuICBvbGRUZXh0Pzogc3RyaW5nLFxufVxuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7ZWRpdG9yRm9yUGF0aH0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcblxuLyoqXG4gKiBBdHRlbXB0cyB0byBhcHBseSB0aGUgcGF0Y2ggdG8gdGhlIGdpdmVuIGZpbGUuXG4gKlxuICogVGhlIGZpbGUgbXVzdCBiZSBjdXJyZW50bHkgb3BlbiBpbiBBdG9tLCBhbmQgdGhlIGNoYW5nZXMgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBidWZmZXIgYnV0IG5vdFxuICogc2F2ZWQuXG4gKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBsaWNhdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgb3RoZXJ3aXNlIGZhbHNlIChlLmcuIGlmIHRoZSBvbGRUZXh0IGRpZCBub3RcbiAqIG1hdGNoKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGV4dEVkaXQocGF0aDogTnVjbGlkZVVyaSwgZWRpdDogVGV4dEVkaXQpOiBib29sZWFuIHtcbiAgY29uc3QgZWRpdG9yID0gZWRpdG9yRm9yUGF0aChwYXRoKTtcbiAgaW52YXJpYW50KGVkaXRvciAhPSBudWxsKTtcbiAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICBpZiAoZWRpdC5vbGRSYW5nZS5zdGFydC5yb3cgPT09IGVkaXQub2xkUmFuZ2UuZW5kLnJvdykge1xuICAgIC8vIEEgbGl0dGxlIGV4dHJhIHZhbGlkYXRpb24gd2hlbiB0aGUgb2xkIHJhbmdlIHNwYW5zIG9ubHkgb25lIGxpbmUuIEluIHBhcnRpY3VsYXIsIHRoaXMgaGVscHNcbiAgICAvLyB3aGVuIHRoZSBvbGQgcmFuZ2UgaXMgZW1wdHkgc28gdGhlcmUgaXMgbm8gb2xkIHRleHQgZm9yIHVzIHRvIGNvbXBhcmUgYWdhaW5zdC4gV2UgY2FuIGF0XG4gICAgLy8gbGVhc3QgYWJvcnQgaWYgdGhlIGxpbmUgaXNuJ3QgbG9uZyBlbm91Z2guXG4gICAgY29uc3QgbGluZUxlbmd0aCA9IGJ1ZmZlci5saW5lTGVuZ3RoRm9yUm93KGVkaXQub2xkUmFuZ2Uuc3RhcnQucm93KTtcbiAgICBpZiAoZWRpdC5vbGRSYW5nZS5lbmQuY29sdW1uID4gbGluZUxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBpZiAoZWRpdC5vbGRUZXh0ICE9IG51bGwpIHtcbiAgICBjb25zdCBjdXJyZW50VGV4dCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShlZGl0Lm9sZFJhbmdlKTtcbiAgICBpZiAoY3VycmVudFRleHQgIT09IGVkaXQub2xkVGV4dCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoZWRpdC5vbGRSYW5nZSwgZWRpdC5uZXdUZXh0KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=