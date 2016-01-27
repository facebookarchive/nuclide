var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function fileColumnCellDataGetter(cellDataKey, diagnostic) {
  if (diagnostic.filePath) {
    var _atom$project$relativizePath = atom.project.relativizePath(diagnostic.filePath);

    var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

    var relativePath = _atom$project$relativizePath2[1];

    return relativePath;
  } else {
    return '';
  }
}

function compareMessagesByFile(a, b) {
  var aMsg = fileColumnCellDataGetter('filePath', a);
  var bMsg = fileColumnCellDataGetter('filePath', b);

  var compareVal = aMsg.localeCompare(bMsg);
  // If the messages are from the same file (`filePath` is equal and `localeCompare`
  // returns 0), compare the line numbers within the file to determine their sort order.
  if (compareVal === 0 && a.range !== undefined && b.range !== undefined) {
    compareVal = a.range.start.row - b.range.start.row;
  }

  return compareVal;
}

module.exports = {
  compareMessagesByFile: compareMessagesByFile,
  fileColumnCellDataGetter: fileColumnCellDataGetter
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhbmVVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBYUEsU0FBUyx3QkFBd0IsQ0FBQyxXQUF1QixFQUFFLFVBQTZCLEVBQVU7QUFDaEcsTUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFO3VDQUNFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7Ozs7UUFBaEUsWUFBWTs7QUFDckIsV0FBTyxZQUFZLENBQUM7R0FDckIsTUFBTTtBQUNMLFdBQU8sRUFBRSxDQUFDO0dBQ1g7Q0FDRjs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLENBQW9CLEVBQUUsQ0FBb0IsRUFBVTtBQUNqRixNQUFNLElBQUksR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckQsTUFBTSxJQUFJLEdBQUcsd0JBQXdCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVyRCxNQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHMUMsTUFBSSxVQUFVLEtBQUssQ0FBQyxJQUFLLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxBQUFDLEVBQUU7QUFDeEUsY0FBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FDcEQ7O0FBRUQsU0FBTyxVQUFVLENBQUM7Q0FDbkI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsMEJBQXdCLEVBQXhCLHdCQUF3QjtDQUN6QixDQUFDIiwiZmlsZSI6InBhbmVVdGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaWFnbm9zdGljTWVzc2FnZX0gZnJvbSAnLi4vLi4vYmFzZSc7XG5cbmZ1bmN0aW9uIGZpbGVDb2x1bW5DZWxsRGF0YUdldHRlcihjZWxsRGF0YUtleTogJ2ZpbGVQYXRoJywgZGlhZ25vc3RpYzogRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlUGF0aCkge1xuICAgIGNvbnN0IFssIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZGlhZ25vc3RpYy5maWxlUGF0aCk7XG4gICAgcmV0dXJuIHJlbGF0aXZlUGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcGFyZU1lc3NhZ2VzQnlGaWxlKGE6IERpYWdub3N0aWNNZXNzYWdlLCBiOiBEaWFnbm9zdGljTWVzc2FnZSk6IG51bWJlciB7XG4gIGNvbnN0IGFNc2cgPSBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ2ZpbGVQYXRoJywgYSk7XG4gIGNvbnN0IGJNc2cgPSBmaWxlQ29sdW1uQ2VsbERhdGFHZXR0ZXIoJ2ZpbGVQYXRoJywgYik7XG5cbiAgbGV0IGNvbXBhcmVWYWwgPSBhTXNnLmxvY2FsZUNvbXBhcmUoYk1zZyk7XG4gIC8vIElmIHRoZSBtZXNzYWdlcyBhcmUgZnJvbSB0aGUgc2FtZSBmaWxlIChgZmlsZVBhdGhgIGlzIGVxdWFsIGFuZCBgbG9jYWxlQ29tcGFyZWBcbiAgLy8gcmV0dXJucyAwKSwgY29tcGFyZSB0aGUgbGluZSBudW1iZXJzIHdpdGhpbiB0aGUgZmlsZSB0byBkZXRlcm1pbmUgdGhlaXIgc29ydCBvcmRlci5cbiAgaWYgKGNvbXBhcmVWYWwgPT09IDAgJiYgKGEucmFuZ2UgIT09IHVuZGVmaW5lZCAmJiBiLnJhbmdlICE9PSB1bmRlZmluZWQpKSB7XG4gICAgY29tcGFyZVZhbCA9IGEucmFuZ2Uuc3RhcnQucm93IC0gYi5yYW5nZS5zdGFydC5yb3c7XG4gIH1cblxuICByZXR1cm4gY29tcGFyZVZhbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbXBhcmVNZXNzYWdlc0J5RmlsZSxcbiAgZmlsZUNvbHVtbkNlbGxEYXRhR2V0dGVyLFxufTtcbiJdfQ==