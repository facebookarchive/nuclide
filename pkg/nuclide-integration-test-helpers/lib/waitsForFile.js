Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.waitsForFile = waitsForFile;
exports.waitsForFilePosition = waitsForFilePosition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * Waits for the specified file to become the active text editor.
 * Can only be used in a Jasmine context.
 */

function waitsForFile(filename) {
  var timeoutMs = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];

  waitsFor(filename + ' to become active', timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    return _path2['default'].basename(editorPath) === filename;
  });
}

function waitsForFilePosition(filename, row, column) {
  var timeoutMs = arguments.length <= 3 || arguments[3] === undefined ? 10000 : arguments[3];

  waitsFor(filename + ' to become active at ' + row + ':' + column, timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    var pos = editor.getCursorBufferPosition();
    return _path2['default'].basename(editorPath) === filename && pos.row === row && pos.column === column;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhaXRzRm9yRmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQVdpQixNQUFNOzs7Ozs7Ozs7QUFNaEIsU0FBUyxZQUFZLENBQUMsUUFBZ0IsRUFBbUM7TUFBakMsU0FBaUIseURBQUcsS0FBSzs7QUFDdEUsVUFBUSxDQUFJLFFBQVEsd0JBQXFCLFNBQVMsRUFBRSxZQUFNO0FBQ3hELFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxRQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFFBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQyxRQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sa0JBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLFFBQVEsQ0FBQztHQUMvQyxDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLG9CQUFvQixDQUNsQyxRQUFnQixFQUNoQixHQUFXLEVBQ1gsTUFBYyxFQUVSO01BRE4sU0FBaUIseURBQUcsS0FBSzs7QUFFekIsVUFBUSxDQUFJLFFBQVEsNkJBQXdCLEdBQUcsU0FBSSxNQUFNLEVBQUksU0FBUyxFQUFFLFlBQU07QUFDNUUsUUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELFFBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFFBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDN0MsV0FBTyxrQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssUUFBUSxJQUN4QyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFDZixHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQztHQUM1QixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJ3YWl0c0ZvckZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBXYWl0cyBmb3IgdGhlIHNwZWNpZmllZCBmaWxlIHRvIGJlY29tZSB0aGUgYWN0aXZlIHRleHQgZWRpdG9yLlxuICogQ2FuIG9ubHkgYmUgdXNlZCBpbiBhIEphc21pbmUgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRzRm9yRmlsZShmaWxlbmFtZTogc3RyaW5nLCB0aW1lb3V0TXM6IG51bWJlciA9IDEwMDAwKTogdm9pZCB7XG4gIHdhaXRzRm9yKGAke2ZpbGVuYW1lfSB0byBiZWNvbWUgYWN0aXZlYCwgdGltZW91dE1zLCAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBlZGl0b3JQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoZWRpdG9yUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKGVkaXRvclBhdGgpID09PSBmaWxlbmFtZTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0c0ZvckZpbGVQb3NpdGlvbihcbiAgZmlsZW5hbWU6IHN0cmluZyxcbiAgcm93OiBudW1iZXIsXG4gIGNvbHVtbjogbnVtYmVyLFxuICB0aW1lb3V0TXM6IG51bWJlciA9IDEwMDAwXG4pOiB2b2lkIHtcbiAgd2FpdHNGb3IoYCR7ZmlsZW5hbWV9IHRvIGJlY29tZSBhY3RpdmUgYXQgJHtyb3d9OiR7Y29sdW1ufWAsIHRpbWVvdXRNcywgKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZWRpdG9yUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKGVkaXRvclBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShlZGl0b3JQYXRoKSA9PT0gZmlsZW5hbWVcbiAgICAgICYmIHBvcy5yb3cgPT09IHJvd1xuICAgICAgJiYgcG9zLmNvbHVtbiA9PT0gY29sdW1uO1xuICB9KTtcbn1cbiJdfQ==