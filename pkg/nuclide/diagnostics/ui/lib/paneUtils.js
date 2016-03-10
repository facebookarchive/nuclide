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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhbmVVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBYUEsU0FBUyx1QkFBdUIsQ0FBQyxVQUE2QixFQUFVO0FBQ3RFLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDL0IsV0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO0dBQzVCLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxVQUE2QixFQUFVO0FBQ2pGLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7dUNBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzs7OztRQUFoRSxZQUFZOztBQUNyQixXQUFPLFlBQVksQ0FBQztHQUNyQixNQUFNO0FBQ0wsV0FBTyxFQUFFLENBQUM7R0FDWDtDQUNGOztBQUVELFNBQVMsd0JBQXdCLENBQUMsV0FBdUIsRUFBRSxVQUE2QixFQUFVO0FBQ2hHLFNBQU8sa0NBQWtDLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDdkQ7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFvQixFQUFFLENBQW9CLEVBQVU7Ozs7Ozs7O0FBUWpGLE1BQUksVUFBVSxHQUFHLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7QUFDcEIsV0FBTyxVQUFVLENBQUM7R0FDbkI7Ozs7QUFJRCxZQUFVLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUdsRixNQUFJLFVBQVUsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEFBQUMsRUFBRTtBQUN4RSxjQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUNwRDs7QUFFRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7QUFFRCxJQUFNLGdCQUE4QyxHQUFHO0FBQ3JELFNBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBUyxFQUFFLENBQUM7Q0FDYixDQUFDOztBQUVGLFNBQVMsc0JBQXNCLENBQUMsQ0FBb0IsRUFBRSxDQUFvQixFQUFVO0FBQ2xGLFNBQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM1RDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixvQ0FBa0MsRUFBbEMsa0NBQWtDO0FBQ2xDLDBCQUF3QixFQUF4Qix3QkFBd0I7Q0FDekIsQ0FBQyIsImZpbGUiOiJwYW5lVXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY01lc3NhZ2UsIE1lc3NhZ2VUeXBlfSBmcm9tICcuLi8uLi9iYXNlJztcblxuZnVuY3Rpb24gZmlsZU9mRGlhZ25vc3RpY01lc3NhZ2UoZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlUGF0aCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGRpYWdub3N0aWMuZmlsZVBhdGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlUGF0aCAhPSBudWxsKSB7XG4gICAgY29uc3QgWywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChkaWFnbm9zdGljLmZpbGVQYXRoKTtcbiAgICByZXR1cm4gcmVsYXRpdmVQYXRoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdmaWxlUGF0aCcsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVNZXNzYWdlc0J5RmlsZShhOiBEaWFnbm9zdGljTWVzc2FnZSwgYjogRGlhZ25vc3RpY01lc3NhZ2UpOiBudW1iZXIge1xuICAvLyBUaGlzIHdpbGwgc29ydCBieTpcbiAgLy8gIC0gZXJyb3JzIGJlZm9yZSB3YXJuaW5nc1xuICAvLyAgLSBsb2NhbCBiZWZvcmUgcmVtb3RlXG4gIC8vICAtIFJlbW90ZSBtYWNoaW5lIG5hbWUvcG9ydFxuICAvLyAgLSBmdWxsIHBhdGhcbiAgLy9cblxuICBsZXQgY29tcGFyZVZhbCA9IGNvbXBhcmVNZXNzYWdlc0J5TGV2ZWwoYSwgYik7XG4gIGlmIChjb21wYXJlVmFsICE9PSAwKSB7XG4gICAgcmV0dXJuIGNvbXBhcmVWYWw7XG4gIH1cblxuICAvLyBXZSBkb24ndCBzb3J0IGJ5IHByb2plY3QgcmVsYXRpdmUgcGF0aCBhcyB0aGF0IHdpbGwgaW50ZXJsZWF2ZSBkaWFnbm9zdGljcyBmcm9tXG4gIC8vIGRpZmZlcmVudCBwcm9qZWN0cy5cbiAgY29tcGFyZVZhbCA9IGZpbGVPZkRpYWdub3N0aWNNZXNzYWdlKGEpLmxvY2FsZUNvbXBhcmUoZmlsZU9mRGlhZ25vc3RpY01lc3NhZ2UoYikpO1xuICAvLyBJZiB0aGUgbWVzc2FnZXMgYXJlIGZyb20gdGhlIHNhbWUgZmlsZSAoYGZpbGVQYXRoYCBpcyBlcXVhbCBhbmQgYGxvY2FsZUNvbXBhcmVgXG4gIC8vIHJldHVybnMgMCksIGNvbXBhcmUgdGhlIGxpbmUgbnVtYmVycyB3aXRoaW4gdGhlIGZpbGUgdG8gZGV0ZXJtaW5lIHRoZWlyIHNvcnQgb3JkZXIuXG4gIGlmIChjb21wYXJlVmFsID09PSAwICYmIChhLnJhbmdlICE9PSB1bmRlZmluZWQgJiYgYi5yYW5nZSAhPT0gdW5kZWZpbmVkKSkge1xuICAgIGNvbXBhcmVWYWwgPSBhLnJhbmdlLnN0YXJ0LnJvdyAtIGIucmFuZ2Uuc3RhcnQucm93O1xuICB9XG5cbiAgcmV0dXJuIGNvbXBhcmVWYWw7XG59XG5cbmNvbnN0IG1lc3NhZ2VMZXZlbFJhbms6IHtba2V5OiBNZXNzYWdlVHlwZV06IG51bWJlcn0gPSB7XG4gICdFcnJvcic6IDAsXG4gICdXYXJuaW5nJzogMSxcbn07XG5cbmZ1bmN0aW9uIGNvbXBhcmVNZXNzYWdlc0J5TGV2ZWwoYTogRGlhZ25vc3RpY01lc3NhZ2UsIGI6IERpYWdub3N0aWNNZXNzYWdlKTogbnVtYmVyIHtcbiAgcmV0dXJuIG1lc3NhZ2VMZXZlbFJhbmtbYS50eXBlXSAtIG1lc3NhZ2VMZXZlbFJhbmtbYi50eXBlXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbXBhcmVNZXNzYWdlc0J5RmlsZSxcbiAgZ2V0UHJvamVjdFJlbGF0aXZlUGF0aE9mRGlhZ25vc3RpYyxcbiAgZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyLFxufTtcbiJdfQ==