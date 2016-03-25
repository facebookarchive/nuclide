var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function fileOfDiagnosticMessage(diagnostic) {
  if (diagnostic.filePath != null) {
    return diagnostic.filePath;
  } else {
    return '';
  }
}

function getProjectRelativePathOfDiagnostic(diagnostic) {
  if (diagnostic.filePath != null) {
    var _atom$project$relativizePath = atom.project.relativizePath(diagnostic.filePath);

    var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

    var relativePath = _atom$project$relativizePath2[1];

    return relativePath;
  } else {
    return '';
  }
}

function fileColumnCellDataGetter(cellDataKey, diagnostic) {
  return getProjectRelativePathOfDiagnostic(diagnostic);
}

function compareMessagesByFile(a, b) {
  // This will sort by:
  //  - errors before warnings
  //  - local before remote
  //  - Remote machine name/port
  //  - full path
  //

  var compareVal = compareMessagesByLevel(a, b);
  if (compareVal !== 0) {
    return compareVal;
  }

  // We don't sort by project relative path as that will interleave diagnostics from
  // different projects.
  compareVal = fileOfDiagnosticMessage(a).localeCompare(fileOfDiagnosticMessage(b));
  // If the messages are from the same file (`filePath` is equal and `localeCompare`
  // returns 0), compare the line numbers within the file to determine their sort order.
  if (compareVal === 0 && a.range !== undefined && b.range !== undefined) {
    compareVal = a.range.start.row - b.range.start.row;
  }

  return compareVal;
}

var messageLevelRank = {
  'Error': 0,
  'Warning': 1
};

function compareMessagesByLevel(a, b) {
  return messageLevelRank[a.type] - messageLevelRank[b.type];
}

module.exports = {
  compareMessagesByFile: compareMessagesByFile,
  getProjectRelativePathOfDiagnostic: getProjectRelativePathOfDiagnostic,
  fileColumnCellDataGetter: fileColumnCellDataGetter
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhbmVVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBYUEsU0FBUyx1QkFBdUIsQ0FBQyxVQUE2QixFQUFVO0FBQ3RFLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDL0IsV0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO0dBQzVCLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxVQUE2QixFQUFVO0FBQ2pGLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7dUNBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzs7OztRQUFoRSxZQUFZOztBQUNyQixXQUFPLFlBQVksQ0FBQztHQUNyQixNQUFNO0FBQ0wsV0FBTyxFQUFFLENBQUM7R0FDWDtDQUNGOztBQUVELFNBQVMsd0JBQXdCLENBQUMsV0FBdUIsRUFBRSxVQUE2QixFQUFVO0FBQ2hHLFNBQU8sa0NBQWtDLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDdkQ7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFvQixFQUFFLENBQW9CLEVBQVU7Ozs7Ozs7O0FBUWpGLE1BQUksVUFBVSxHQUFHLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7QUFDcEIsV0FBTyxVQUFVLENBQUM7R0FDbkI7Ozs7QUFJRCxZQUFVLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUdsRixNQUFJLFVBQVUsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEFBQUMsRUFBRTtBQUN4RSxjQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUNwRDs7QUFFRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7QUFFRCxJQUFNLGdCQUE4QyxHQUFHO0FBQ3JELFNBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBUyxFQUFFLENBQUM7Q0FDYixDQUFDOztBQUVGLFNBQVMsc0JBQXNCLENBQUMsQ0FBb0IsRUFBRSxDQUFvQixFQUFVO0FBQ2xGLFNBQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM1RDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixvQ0FBa0MsRUFBbEMsa0NBQWtDO0FBQ2xDLDBCQUF3QixFQUF4Qix3QkFBd0I7Q0FDekIsQ0FBQyIsImZpbGUiOiJwYW5lVXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2UsIE1lc3NhZ2VUeXBlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5mdW5jdGlvbiBmaWxlT2ZEaWFnbm9zdGljTWVzc2FnZShkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGlmIChkaWFnbm9zdGljLmZpbGVQYXRoICE9IG51bGwpIHtcbiAgICByZXR1cm4gZGlhZ25vc3RpYy5maWxlUGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJvamVjdFJlbGF0aXZlUGF0aE9mRGlhZ25vc3RpYyhkaWFnbm9zdGljOiBEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGlmIChkaWFnbm9zdGljLmZpbGVQYXRoICE9IG51bGwpIHtcbiAgICBjb25zdCBbLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGRpYWdub3N0aWMuZmlsZVBhdGgpO1xuICAgIHJldHVybiByZWxhdGl2ZVBhdGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ2ZpbGVQYXRoJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gZ2V0UHJvamVjdFJlbGF0aXZlUGF0aE9mRGlhZ25vc3RpYyhkaWFnbm9zdGljKTtcbn1cblxuZnVuY3Rpb24gY29tcGFyZU1lc3NhZ2VzQnlGaWxlKGE6IERpYWdub3N0aWNNZXNzYWdlLCBiOiBEaWFnbm9zdGljTWVzc2FnZSk6IG51bWJlciB7XG4gIC8vIFRoaXMgd2lsbCBzb3J0IGJ5OlxuICAvLyAgLSBlcnJvcnMgYmVmb3JlIHdhcm5pbmdzXG4gIC8vICAtIGxvY2FsIGJlZm9yZSByZW1vdGVcbiAgLy8gIC0gUmVtb3RlIG1hY2hpbmUgbmFtZS9wb3J0XG4gIC8vICAtIGZ1bGwgcGF0aFxuICAvL1xuXG4gIGxldCBjb21wYXJlVmFsID0gY29tcGFyZU1lc3NhZ2VzQnlMZXZlbChhLCBiKTtcbiAgaWYgKGNvbXBhcmVWYWwgIT09IDApIHtcbiAgICByZXR1cm4gY29tcGFyZVZhbDtcbiAgfVxuXG4gIC8vIFdlIGRvbid0IHNvcnQgYnkgcHJvamVjdCByZWxhdGl2ZSBwYXRoIGFzIHRoYXQgd2lsbCBpbnRlcmxlYXZlIGRpYWdub3N0aWNzIGZyb21cbiAgLy8gZGlmZmVyZW50IHByb2plY3RzLlxuICBjb21wYXJlVmFsID0gZmlsZU9mRGlhZ25vc3RpY01lc3NhZ2UoYSkubG9jYWxlQ29tcGFyZShmaWxlT2ZEaWFnbm9zdGljTWVzc2FnZShiKSk7XG4gIC8vIElmIHRoZSBtZXNzYWdlcyBhcmUgZnJvbSB0aGUgc2FtZSBmaWxlIChgZmlsZVBhdGhgIGlzIGVxdWFsIGFuZCBgbG9jYWxlQ29tcGFyZWBcbiAgLy8gcmV0dXJucyAwKSwgY29tcGFyZSB0aGUgbGluZSBudW1iZXJzIHdpdGhpbiB0aGUgZmlsZSB0byBkZXRlcm1pbmUgdGhlaXIgc29ydCBvcmRlci5cbiAgaWYgKGNvbXBhcmVWYWwgPT09IDAgJiYgKGEucmFuZ2UgIT09IHVuZGVmaW5lZCAmJiBiLnJhbmdlICE9PSB1bmRlZmluZWQpKSB7XG4gICAgY29tcGFyZVZhbCA9IGEucmFuZ2Uuc3RhcnQucm93IC0gYi5yYW5nZS5zdGFydC5yb3c7XG4gIH1cblxuICByZXR1cm4gY29tcGFyZVZhbDtcbn1cblxuY29uc3QgbWVzc2FnZUxldmVsUmFuazoge1trZXk6IE1lc3NhZ2VUeXBlXTogbnVtYmVyfSA9IHtcbiAgJ0Vycm9yJzogMCxcbiAgJ1dhcm5pbmcnOiAxLFxufTtcblxuZnVuY3Rpb24gY29tcGFyZU1lc3NhZ2VzQnlMZXZlbChhOiBEaWFnbm9zdGljTWVzc2FnZSwgYjogRGlhZ25vc3RpY01lc3NhZ2UpOiBudW1iZXIge1xuICByZXR1cm4gbWVzc2FnZUxldmVsUmFua1thLnR5cGVdIC0gbWVzc2FnZUxldmVsUmFua1tiLnR5cGVdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29tcGFyZU1lc3NhZ2VzQnlGaWxlLFxuICBnZXRQcm9qZWN0UmVsYXRpdmVQYXRoT2ZEaWFnbm9zdGljLFxuICBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIsXG59O1xuIl19