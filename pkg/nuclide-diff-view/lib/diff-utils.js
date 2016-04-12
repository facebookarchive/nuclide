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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.computeDiff = computeDiff;
exports.getLineCountWithOffsets = getLineCountWithOffsets;
exports.getOffsetLineNumber = getOffsetLineNumber;

function computeDiff(oldText, newText) {
  var _computeDiffChunks2 = _computeDiffChunks(oldText, newText);

  var addedLines = _computeDiffChunks2.addedLines;
  var removedLines = _computeDiffChunks2.removedLines;
  var chunks = _computeDiffChunks2.chunks;

  var _computeOffsets2 = _computeOffsets(chunks);

  var oldLineOffsets = _computeOffsets2.oldLineOffsets;
  var newLineOffsets = _computeOffsets2.newLineOffsets;

  return {
    addedLines: addedLines,
    removedLines: removedLines,
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets
  };
}

function _computeDiffChunks(oldText, newText) {

  var JsDiff = require('diff');

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  var lineDiff = JsDiff.diffLines(oldText, newText);
  var chunks = [];

  var addedCount = 0;
  var removedCount = 0;
  var nextOffset = 0;
  var offset = 0;

  var addedLines = [];
  var removedLines = [];
  lineDiff.forEach(function (part) {
    var added = part.added;
    var removed = part.removed;
    var value = part.value;

    var count = value.split('\n').length - 1;
    if (!added && !removed) {
      addedCount += count;
      removedCount += count;
      offset = nextOffset;
      nextOffset = 0;
    } else if (added) {
      for (var i = 0; i < count; i++) {
        addedLines.push(addedCount + i);
      }
      addedCount += count;
      nextOffset += count;
    } else {
      for (var i = 0; i < count; i++) {
        removedLines.push(removedCount + i);
      }
      removedCount += count;
      nextOffset -= count;
    }
    chunks.push({ added: added, removed: removed, value: value, count: count, offset: offset });
    offset = 0;
  });
  return { addedLines: addedLines, removedLines: removedLines, chunks: chunks };
}

function _computeOffsets(diffChunks) {
  var newLineOffsets = new Map();
  var oldLineOffsets = new Map();

  var oldLineCount = 0;
  var newLineCount = 0;

  for (var chunk of diffChunks) {
    var _added = chunk.added;
    var _removed = chunk.removed;
    var _offset = chunk.offset;
    var _count = chunk.count;

    if (_added) {
      newLineCount += _count;
    } else if (_removed) {
      oldLineCount += _count;
    } else {
      if (_offset < 0) {
        // Non zero offset implies this block is neither a removal or an addition,
        // and is thus equal in both versions of the document.
        // Sign of offset indicates which version of document requires the offset
        // (negative -> old version, positive -> new version).
        // Magnitude of offset indicates the number of offset lines required for version.
        newLineOffsets.set(newLineCount, _offset * -1);
      } else if (_offset > 0) {
        oldLineOffsets.set(oldLineCount, _offset);
      }
      newLineCount += _count;
      oldLineCount += _count;
    }
  }

  return {
    oldLineOffsets: oldLineOffsets,
    newLineOffsets: newLineOffsets
  };
}

function getLineCountWithOffsets(contents, offsets) {
  var linesCount = contents.split(/\r\n|\n/).length;
  return Array.from(offsets.values()).reduce(function (count, offsetLines) {
    return count + offsetLines;
  }, linesCount);
}

function getOffsetLineNumber(lineNumber, offsets) {
  var offsetLineNumber = lineNumber;
  for (var _ref3 of offsets) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var offsetLine = _ref2[0];
    var offsetLineNumbers = _ref2[1];

    if (lineNumber > offsetLine) {
      offsetLineNumber += offsetLineNumbers;
    }
  }
  return offsetLineNumber;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRpZmYtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJPLFNBQVMsV0FBVyxDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVk7NEJBQzNCLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7O01BQXhFLFVBQVUsdUJBQVYsVUFBVTtNQUFFLFlBQVksdUJBQVosWUFBWTtNQUFFLE1BQU0sdUJBQU4sTUFBTTs7eUJBQ0UsZUFBZSxDQUFDLE1BQU0sQ0FBQzs7TUFBekQsY0FBYyxvQkFBZCxjQUFjO01BQUUsY0FBYyxvQkFBZCxjQUFjOztBQUVyQyxTQUFPO0FBQ0wsY0FBVSxFQUFWLFVBQVU7QUFDVixnQkFBWSxFQUFaLFlBQVk7QUFDWixrQkFBYyxFQUFkLGNBQWM7QUFDZCxrQkFBYyxFQUFkLGNBQWM7R0FDZixDQUFDO0NBQ0g7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFhOztBQUV2RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7QUFJL0IsTUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ2hGLFdBQU8sSUFBSSxJQUFJLENBQUM7QUFDaEIsV0FBTyxJQUFJLElBQUksQ0FBQztHQUNqQjs7QUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNwRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWxCLE1BQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixNQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDckIsTUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLE1BQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFZixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7UUFDaEIsS0FBSyxHQUFvQixJQUFJLENBQTdCLEtBQUs7UUFBRSxPQUFPLEdBQVcsSUFBSSxDQUF0QixPQUFPO1FBQUUsS0FBSyxHQUFJLElBQUksQ0FBYixLQUFLOztBQUM1QixRQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDM0MsUUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUN0QixnQkFBVSxJQUFJLEtBQUssQ0FBQztBQUNwQixrQkFBWSxJQUFJLEtBQUssQ0FBQztBQUN0QixZQUFNLEdBQUcsVUFBVSxDQUFDO0FBQ3BCLGdCQUFVLEdBQUcsQ0FBQyxDQUFDO0tBQ2hCLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDaEIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QixrQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDakM7QUFDRCxnQkFBVSxJQUFJLEtBQUssQ0FBQztBQUNwQixnQkFBVSxJQUFJLEtBQUssQ0FBQztLQUNyQixNQUFNO0FBQ0wsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QixvQkFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDckM7QUFDRCxrQkFBWSxJQUFJLEtBQUssQ0FBQztBQUN0QixnQkFBVSxJQUFJLEtBQUssQ0FBQztLQUNyQjtBQUNELFVBQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUwsS0FBSyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQ3BELFVBQU0sR0FBRyxDQUFDLENBQUM7R0FDWixDQUFDLENBQUM7QUFDSCxTQUFPLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBRSxZQUFZLEVBQVosWUFBWSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQztDQUMzQzs7QUFFRCxTQUFTLGVBQWUsQ0FDdEIsVUFBNkIsRUFDNEI7QUFDekQsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNqQyxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUVqQyxNQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDckIsTUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDOztBQUVyQixPQUFLLElBQU0sS0FBSyxJQUFJLFVBQVUsRUFBRTtRQUN2QixNQUFLLEdBQTRCLEtBQUssQ0FBdEMsS0FBSztRQUFFLFFBQU8sR0FBbUIsS0FBSyxDQUEvQixPQUFPO1FBQUUsT0FBTSxHQUFXLEtBQUssQ0FBdEIsTUFBTTtRQUFFLE1BQUssR0FBSSxLQUFLLENBQWQsS0FBSzs7QUFDcEMsUUFBSSxNQUFLLEVBQUU7QUFDVCxrQkFBWSxJQUFJLE1BQUssQ0FBQztLQUN2QixNQUFNLElBQUksUUFBTyxFQUFFO0FBQ2xCLGtCQUFZLElBQUksTUFBSyxDQUFDO0tBQ3ZCLE1BQU07QUFDTCxVQUFJLE9BQU0sR0FBRyxDQUFDLEVBQUU7Ozs7OztBQU1kLHNCQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxPQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMvQyxNQUFNLElBQUksT0FBTSxHQUFHLENBQUMsRUFBRTtBQUNyQixzQkFBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsT0FBTSxDQUFDLENBQUM7T0FDMUM7QUFDRCxrQkFBWSxJQUFJLE1BQUssQ0FBQztBQUN0QixrQkFBWSxJQUFJLE1BQUssQ0FBQztLQUN2QjtHQUNGOztBQUVELFNBQU87QUFDTCxrQkFBYyxFQUFkLGNBQWM7QUFDZCxrQkFBYyxFQUFkLGNBQWM7R0FDZixDQUFDO0NBQ0g7O0FBRU0sU0FBUyx1QkFBdUIsQ0FBQyxRQUFnQixFQUFFLE9BQWtCLEVBQVU7QUFDcEYsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDcEQsU0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNoQyxNQUFNLENBQUMsVUFBQyxLQUFLLEVBQUUsV0FBVztXQUFLLEtBQUssR0FBRyxXQUFXO0dBQUEsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUNwRTs7QUFFTSxTQUFTLG1CQUFtQixDQUFDLFVBQWtCLEVBQUUsT0FBa0IsRUFBVTtBQUNsRixNQUFJLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztBQUNsQyxvQkFBOEMsT0FBTyxFQUFFOzs7UUFBM0MsVUFBVTtRQUFFLGlCQUFpQjs7QUFDdkMsUUFBSSxVQUFVLEdBQUcsVUFBVSxFQUFFO0FBQzNCLHNCQUFnQixJQUFJLGlCQUFpQixDQUFDO0tBQ3ZDO0dBQ0Y7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCIiwiZmlsZSI6ImRpZmYtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGV4dERpZmYsIE9mZnNldE1hcH0gZnJvbSAnLi90eXBlcyc7XG5cbnR5cGUgQ2h1bmtQaWVjZSA9IHtcbiAgYWRkZWQ6IG51bWJlcjtcbiAgcmVtb3ZlZDogbnVtYmVyO1xuICB2YWx1ZTogc3RyaW5nO1xuICBjb3VudDogbnVtYmVyO1xuICBvZmZzZXQ6IG51bWJlcjtcbn07XG5cbnR5cGUgRGlmZkNodW5rID0ge1xuICBhZGRlZExpbmVzOiBBcnJheTxudW1iZXI+O1xuICByZW1vdmVkTGluZXM6IEFycmF5PG51bWJlcj47XG4gIGNodW5rczogQXJyYXk8Q2h1bmtQaWVjZT47XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZURpZmYob2xkVGV4dDogc3RyaW5nLCBuZXdUZXh0OiBzdHJpbmcpOiBUZXh0RGlmZiB7XG4gIGNvbnN0IHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIGNodW5rc30gPSBfY29tcHV0ZURpZmZDaHVua3Mob2xkVGV4dCwgbmV3VGV4dCk7XG4gIGNvbnN0IHtvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID0gX2NvbXB1dGVPZmZzZXRzKGNodW5rcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBhZGRlZExpbmVzLFxuICAgIHJlbW92ZWRMaW5lcyxcbiAgICBvbGRMaW5lT2Zmc2V0cyxcbiAgICBuZXdMaW5lT2Zmc2V0cyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2NvbXB1dGVEaWZmQ2h1bmtzKG9sZFRleHQ6IHN0cmluZywgbmV3VGV4dDogc3RyaW5nKTogRGlmZkNodW5rIHtcblxuICBjb25zdCBKc0RpZmYgPSByZXF1aXJlKCdkaWZmJyk7XG5cbiAgLy8gSWYgdGhlIGxhc3QgbGluZSBoYXMgY2hhbmdlcywgSnNEaWZmIGRvZXNuJ3QgcmV0dXJuIHRoYXQuXG4gIC8vIEdlbmVyYWxseSwgY29udGVudCB3aXRoIG5ldyBsaW5lIGVuZGluZyBhcmUgZWFzaWVyIHRvIGNhbGN1bGF0ZSBvZmZzZXRzIGZvci5cbiAgaWYgKG9sZFRleHRbb2xkVGV4dC5sZW5ndGggLSAxXSAhPT0gJ1xcbicgfHwgbmV3VGV4dFtuZXdUZXh0Lmxlbmd0aCAtIDFdICE9PSAnXFxuJykge1xuICAgIG9sZFRleHQgKz0gJ1xcbic7XG4gICAgbmV3VGV4dCArPSAnXFxuJztcbiAgfVxuXG4gIGNvbnN0IGxpbmVEaWZmID0gSnNEaWZmLmRpZmZMaW5lcyhvbGRUZXh0LCBuZXdUZXh0KTtcbiAgY29uc3QgY2h1bmtzID0gW107XG5cbiAgbGV0IGFkZGVkQ291bnQgPSAwO1xuICBsZXQgcmVtb3ZlZENvdW50ID0gMDtcbiAgbGV0IG5leHRPZmZzZXQgPSAwO1xuICBsZXQgb2Zmc2V0ID0gMDtcblxuICBjb25zdCBhZGRlZExpbmVzID0gW107XG4gIGNvbnN0IHJlbW92ZWRMaW5lcyA9IFtdO1xuICBsaW5lRGlmZi5mb3JFYWNoKHBhcnQgPT4ge1xuICAgIGNvbnN0IHthZGRlZCwgcmVtb3ZlZCwgdmFsdWV9ID0gcGFydDtcbiAgICBjb25zdCBjb3VudCA9IHZhbHVlLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgIGlmICghYWRkZWQgJiYgIXJlbW92ZWQpIHtcbiAgICAgIGFkZGVkQ291bnQgKz0gY291bnQ7XG4gICAgICByZW1vdmVkQ291bnQgKz0gY291bnQ7XG4gICAgICBvZmZzZXQgPSBuZXh0T2Zmc2V0O1xuICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgfSBlbHNlIGlmIChhZGRlZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIGFkZGVkTGluZXMucHVzaChhZGRlZENvdW50ICsgaSk7XG4gICAgICB9XG4gICAgICBhZGRlZENvdW50ICs9IGNvdW50O1xuICAgICAgbmV4dE9mZnNldCArPSBjb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHJlbW92ZWRMaW5lcy5wdXNoKHJlbW92ZWRDb3VudCArIGkpO1xuICAgICAgfVxuICAgICAgcmVtb3ZlZENvdW50ICs9IGNvdW50O1xuICAgICAgbmV4dE9mZnNldCAtPSBjb3VudDtcbiAgICB9XG4gICAgY2h1bmtzLnB1c2goe2FkZGVkLCByZW1vdmVkLCB2YWx1ZSwgY291bnQsIG9mZnNldH0pO1xuICAgIG9mZnNldCA9IDA7XG4gIH0pO1xuICByZXR1cm4ge2FkZGVkTGluZXMsIHJlbW92ZWRMaW5lcywgY2h1bmtzfTtcbn1cblxuZnVuY3Rpb24gX2NvbXB1dGVPZmZzZXRzKFxuICBkaWZmQ2h1bmtzOiBBcnJheTxDaHVua1BpZWNlPixcbik6IHtvbGRMaW5lT2Zmc2V0czogT2Zmc2V0TWFwOyBuZXdMaW5lT2Zmc2V0czogT2Zmc2V0TWFwO30ge1xuICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAoKTtcbiAgY29uc3Qgb2xkTGluZU9mZnNldHMgPSBuZXcgTWFwKCk7XG5cbiAgbGV0IG9sZExpbmVDb3VudCA9IDA7XG4gIGxldCBuZXdMaW5lQ291bnQgPSAwO1xuXG4gIGZvciAoY29uc3QgY2h1bmsgb2YgZGlmZkNodW5rcykge1xuICAgIGNvbnN0IHthZGRlZCwgcmVtb3ZlZCwgb2Zmc2V0LCBjb3VudH0gPSBjaHVuaztcbiAgICBpZiAoYWRkZWQpIHtcbiAgICAgIG5ld0xpbmVDb3VudCArPSBjb3VudDtcbiAgICB9IGVsc2UgaWYgKHJlbW92ZWQpIHtcbiAgICAgIG9sZExpbmVDb3VudCArPSBjb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9mZnNldCA8IDApIHtcbiAgICAgICAgLy8gTm9uIHplcm8gb2Zmc2V0IGltcGxpZXMgdGhpcyBibG9jayBpcyBuZWl0aGVyIGEgcmVtb3ZhbCBvciBhbiBhZGRpdGlvbixcbiAgICAgICAgLy8gYW5kIGlzIHRodXMgZXF1YWwgaW4gYm90aCB2ZXJzaW9ucyBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICAgIC8vIFNpZ24gb2Ygb2Zmc2V0IGluZGljYXRlcyB3aGljaCB2ZXJzaW9uIG9mIGRvY3VtZW50IHJlcXVpcmVzIHRoZSBvZmZzZXRcbiAgICAgICAgLy8gKG5lZ2F0aXZlIC0+IG9sZCB2ZXJzaW9uLCBwb3NpdGl2ZSAtPiBuZXcgdmVyc2lvbikuXG4gICAgICAgIC8vIE1hZ25pdHVkZSBvZiBvZmZzZXQgaW5kaWNhdGVzIHRoZSBudW1iZXIgb2Ygb2Zmc2V0IGxpbmVzIHJlcXVpcmVkIGZvciB2ZXJzaW9uLlxuICAgICAgICBuZXdMaW5lT2Zmc2V0cy5zZXQobmV3TGluZUNvdW50LCBvZmZzZXQgKiAtMSk7XG4gICAgICB9IGVsc2UgaWYgKG9mZnNldCA+IDApIHtcbiAgICAgICAgb2xkTGluZU9mZnNldHMuc2V0KG9sZExpbmVDb3VudCwgb2Zmc2V0KTtcbiAgICAgIH1cbiAgICAgIG5ld0xpbmVDb3VudCArPSBjb3VudDtcbiAgICAgIG9sZExpbmVDb3VudCArPSBjb3VudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG9sZExpbmVPZmZzZXRzLFxuICAgIG5ld0xpbmVPZmZzZXRzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGluZUNvdW50V2l0aE9mZnNldHMoY29udGVudHM6IHN0cmluZywgb2Zmc2V0czogT2Zmc2V0TWFwKTogbnVtYmVyIHtcbiAgY29uc3QgbGluZXNDb3VudCA9IGNvbnRlbnRzLnNwbGl0KC9cXHJcXG58XFxuLykubGVuZ3RoO1xuICByZXR1cm4gQXJyYXkuZnJvbShvZmZzZXRzLnZhbHVlcygpKVxuICAgIC5yZWR1Y2UoKGNvdW50LCBvZmZzZXRMaW5lcykgPT4gY291bnQgKyBvZmZzZXRMaW5lcywgbGluZXNDb3VudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPZmZzZXRMaW5lTnVtYmVyKGxpbmVOdW1iZXI6IG51bWJlciwgb2Zmc2V0czogT2Zmc2V0TWFwKTogbnVtYmVyIHtcbiAgbGV0IG9mZnNldExpbmVOdW1iZXIgPSBsaW5lTnVtYmVyO1xuICBmb3IgKGNvbnN0IFtvZmZzZXRMaW5lLCBvZmZzZXRMaW5lTnVtYmVyc10gb2Ygb2Zmc2V0cykge1xuICAgIGlmIChsaW5lTnVtYmVyID4gb2Zmc2V0TGluZSkge1xuICAgICAgb2Zmc2V0TGluZU51bWJlciArPSBvZmZzZXRMaW5lTnVtYmVycztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9mZnNldExpbmVOdW1iZXI7XG59XG4iXX0=