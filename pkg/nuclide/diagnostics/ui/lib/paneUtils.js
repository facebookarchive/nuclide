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
  //  - local before remote
  //  - Remote machine name/port
  //  - full path
  //
  // We don't sort by project relative path as that will interleave diagnostics from
  // different projects.
  var compareVal = fileOfDiagnosticMessage(a).localeCompare(fileOfDiagnosticMessage(b));
  // If the messages are from the same file (`filePath` is equal and `localeCompare`
  // returns 0), compare the line numbers within the file to determine their sort order.
  if (compareVal === 0 && a.range !== undefined && b.range !== undefined) {
    compareVal = a.range.start.row - b.range.start.row;
  }

  return compareVal;
}

module.exports = {
  compareMessagesByFile: compareMessagesByFile,
  getProjectRelativePathOfDiagnostic: getProjectRelativePathOfDiagnostic,
  fileColumnCellDataGetter: fileColumnCellDataGetter
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhbmVVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBYUEsU0FBUyx1QkFBdUIsQ0FBQyxVQUE2QixFQUFVO0FBQ3RFLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDL0IsV0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO0dBQzVCLE1BQU07QUFDTCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7O0FBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxVQUE2QixFQUFVO0FBQ2pGLE1BQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7dUNBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzs7OztRQUFoRSxZQUFZOztBQUNyQixXQUFPLFlBQVksQ0FBQztHQUNyQixNQUFNO0FBQ0wsV0FBTyxFQUFFLENBQUM7R0FDWDtDQUNGOztBQUVELFNBQVMsd0JBQXdCLENBQUMsV0FBdUIsRUFBRSxVQUE2QixFQUFVO0FBQ2hHLFNBQU8sa0NBQWtDLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDdkQ7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFvQixFQUFFLENBQW9CLEVBQVU7Ozs7Ozs7O0FBUWpGLE1BQUksVUFBVSxHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7QUFHdEYsTUFBSSxVQUFVLEtBQUssQ0FBQyxJQUFLLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxBQUFDLEVBQUU7QUFDeEUsY0FBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FDcEQ7O0FBRUQsU0FBTyxVQUFVLENBQUM7Q0FDbkI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsb0NBQWtDLEVBQWxDLGtDQUFrQztBQUNsQywwQkFBd0IsRUFBeEIsd0JBQXdCO0NBQ3pCLENBQUMiLCJmaWxlIjoicGFuZVV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpYWdub3N0aWNNZXNzYWdlfSBmcm9tICcuLi8uLi9iYXNlJztcblxuZnVuY3Rpb24gZmlsZU9mRGlhZ25vc3RpY01lc3NhZ2UoZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlUGF0aCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGRpYWdub3N0aWMuZmlsZVBhdGg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlUGF0aCAhPSBudWxsKSB7XG4gICAgY29uc3QgWywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChkaWFnbm9zdGljLmZpbGVQYXRoKTtcbiAgICByZXR1cm4gcmVsYXRpdmVQYXRoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoY2VsbERhdGFLZXk6ICdmaWxlUGF0aCcsIGRpYWdub3N0aWM6IERpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMoZGlhZ25vc3RpYyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVNZXNzYWdlc0J5RmlsZShhOiBEaWFnbm9zdGljTWVzc2FnZSwgYjogRGlhZ25vc3RpY01lc3NhZ2UpOiBudW1iZXIge1xuICAvLyBUaGlzIHdpbGwgc29ydCBieTpcbiAgLy8gIC0gbG9jYWwgYmVmb3JlIHJlbW90ZVxuICAvLyAgLSBSZW1vdGUgbWFjaGluZSBuYW1lL3BvcnRcbiAgLy8gIC0gZnVsbCBwYXRoXG4gIC8vXG4gIC8vIFdlIGRvbid0IHNvcnQgYnkgcHJvamVjdCByZWxhdGl2ZSBwYXRoIGFzIHRoYXQgd2lsbCBpbnRlcmxlYXZlIGRpYWdub3N0aWNzIGZyb21cbiAgLy8gZGlmZmVyZW50IHByb2plY3RzLlxuICBsZXQgY29tcGFyZVZhbCA9IGZpbGVPZkRpYWdub3N0aWNNZXNzYWdlKGEpLmxvY2FsZUNvbXBhcmUoZmlsZU9mRGlhZ25vc3RpY01lc3NhZ2UoYikpO1xuICAvLyBJZiB0aGUgbWVzc2FnZXMgYXJlIGZyb20gdGhlIHNhbWUgZmlsZSAoYGZpbGVQYXRoYCBpcyBlcXVhbCBhbmQgYGxvY2FsZUNvbXBhcmVgXG4gIC8vIHJldHVybnMgMCksIGNvbXBhcmUgdGhlIGxpbmUgbnVtYmVycyB3aXRoaW4gdGhlIGZpbGUgdG8gZGV0ZXJtaW5lIHRoZWlyIHNvcnQgb3JkZXIuXG4gIGlmIChjb21wYXJlVmFsID09PSAwICYmIChhLnJhbmdlICE9PSB1bmRlZmluZWQgJiYgYi5yYW5nZSAhPT0gdW5kZWZpbmVkKSkge1xuICAgIGNvbXBhcmVWYWwgPSBhLnJhbmdlLnN0YXJ0LnJvdyAtIGIucmFuZ2Uuc3RhcnQucm93O1xuICB9XG5cbiAgcmV0dXJuIGNvbXBhcmVWYWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb21wYXJlTWVzc2FnZXNCeUZpbGUsXG4gIGdldFByb2plY3RSZWxhdGl2ZVBhdGhPZkRpYWdub3N0aWMsXG4gIGZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcixcbn07XG4iXX0=