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

var _commons = require('../../commons');

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
  return _commons.array.from(offsets.values()).reduce(function (count, offsetLines) {
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
//# sourceMappingURL=data:application/json;base64,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QUksTUFBSyxDQUFDO0tBQ3ZCO0dBQ0Y7O0FBRUQsU0FBTztBQUNMLGtCQUFjLEVBQWQsY0FBYztBQUNkLGtCQUFjLEVBQWQsY0FBYztHQUNmLENBQUM7Q0FDSDs7QUFFTSxTQUFTLHVCQUF1QixDQUFDLFFBQWdCLEVBQUUsT0FBa0IsRUFBVTtBQUNwRixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNwRCxTQUFPLGVBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNoQyxNQUFNLENBQUMsVUFBQyxLQUFLLEVBQUUsV0FBVztXQUFLLEtBQUssR0FBRyxXQUFXO0dBQUEsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUNwRTs7QUFFTSxTQUFTLG1CQUFtQixDQUFDLFVBQWtCLEVBQUUsT0FBa0IsRUFBVTtBQUNsRixNQUFJLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztBQUNsQyxvQkFBOEMsT0FBTyxFQUFFOzs7UUFBM0MsVUFBVTtRQUFFLGlCQUFpQjs7QUFDdkMsUUFBSSxVQUFVLEdBQUcsVUFBVSxFQUFFO0FBQzNCLHNCQUFnQixJQUFJLGlCQUFpQixDQUFDO0tBQ3ZDO0dBQ0Y7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCIiwiZmlsZSI6ImRpZmYtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGV4dERpZmYsIE9mZnNldE1hcH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG50eXBlIENodW5rUGllY2UgPSB7XG4gIGFkZGVkOiBudW1iZXI7XG4gIHJlbW92ZWQ6IG51bWJlcjtcbiAgdmFsdWU6IHN0cmluZztcbiAgY291bnQ6IG51bWJlcjtcbiAgb2Zmc2V0OiBudW1iZXI7XG59O1xuXG50eXBlIERpZmZDaHVuayA9IHtcbiAgYWRkZWRMaW5lczogQXJyYXk8bnVtYmVyPjtcbiAgcmVtb3ZlZExpbmVzOiBBcnJheTxudW1iZXI+O1xuICBjaHVua3M6IEFycmF5PENodW5rUGllY2U+O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVEaWZmKG9sZFRleHQ6IHN0cmluZywgbmV3VGV4dDogc3RyaW5nKTogVGV4dERpZmYge1xuICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBjaHVua3N9ID0gX2NvbXB1dGVEaWZmQ2h1bmtzKG9sZFRleHQsIG5ld1RleHQpO1xuICBjb25zdCB7b2xkTGluZU9mZnNldHMsIG5ld0xpbmVPZmZzZXRzfSA9IF9jb21wdXRlT2Zmc2V0cyhjaHVua3MpO1xuXG4gIHJldHVybiB7XG4gICAgYWRkZWRMaW5lcyxcbiAgICByZW1vdmVkTGluZXMsXG4gICAgb2xkTGluZU9mZnNldHMsXG4gICAgbmV3TGluZU9mZnNldHMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9jb21wdXRlRGlmZkNodW5rcyhvbGRUZXh0OiBzdHJpbmcsIG5ld1RleHQ6IHN0cmluZyk6IERpZmZDaHVuayB7XG5cbiAgY29uc3QgSnNEaWZmID0gcmVxdWlyZSgnZGlmZicpO1xuXG4gIC8vIElmIHRoZSBsYXN0IGxpbmUgaGFzIGNoYW5nZXMsIEpzRGlmZiBkb2Vzbid0IHJldHVybiB0aGF0LlxuICAvLyBHZW5lcmFsbHksIGNvbnRlbnQgd2l0aCBuZXcgbGluZSBlbmRpbmcgYXJlIGVhc2llciB0byBjYWxjdWxhdGUgb2Zmc2V0cyBmb3IuXG4gIGlmIChvbGRUZXh0W29sZFRleHQubGVuZ3RoIC0gMV0gIT09ICdcXG4nIHx8IG5ld1RleHRbbmV3VGV4dC5sZW5ndGggLSAxXSAhPT0gJ1xcbicpIHtcbiAgICBvbGRUZXh0ICs9ICdcXG4nO1xuICAgIG5ld1RleHQgKz0gJ1xcbic7XG4gIH1cblxuICBjb25zdCBsaW5lRGlmZiA9IEpzRGlmZi5kaWZmTGluZXMob2xkVGV4dCwgbmV3VGV4dCk7XG4gIGNvbnN0IGNodW5rcyA9IFtdO1xuXG4gIGxldCBhZGRlZENvdW50ID0gMDtcbiAgbGV0IHJlbW92ZWRDb3VudCA9IDA7XG4gIGxldCBuZXh0T2Zmc2V0ID0gMDtcbiAgbGV0IG9mZnNldCA9IDA7XG5cbiAgY29uc3QgYWRkZWRMaW5lcyA9IFtdO1xuICBjb25zdCByZW1vdmVkTGluZXMgPSBbXTtcbiAgbGluZURpZmYuZm9yRWFjaChwYXJ0ID0+IHtcbiAgICBjb25zdCB7YWRkZWQsIHJlbW92ZWQsIHZhbHVlfSA9IHBhcnQ7XG4gICAgY29uc3QgY291bnQgPSB2YWx1ZS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcbiAgICBpZiAoIWFkZGVkICYmICFyZW1vdmVkKSB7XG4gICAgICBhZGRlZENvdW50ICs9IGNvdW50O1xuICAgICAgcmVtb3ZlZENvdW50ICs9IGNvdW50O1xuICAgICAgb2Zmc2V0ID0gbmV4dE9mZnNldDtcbiAgICAgIG5leHRPZmZzZXQgPSAwO1xuICAgIH0gZWxzZSBpZiAoYWRkZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBhZGRlZExpbmVzLnB1c2goYWRkZWRDb3VudCArIGkpO1xuICAgICAgfVxuICAgICAgYWRkZWRDb3VudCArPSBjb3VudDtcbiAgICAgIG5leHRPZmZzZXQgKz0gY291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICByZW1vdmVkTGluZXMucHVzaChyZW1vdmVkQ291bnQgKyBpKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZWRDb3VudCArPSBjb3VudDtcbiAgICAgIG5leHRPZmZzZXQgLT0gY291bnQ7XG4gICAgfVxuICAgIGNodW5rcy5wdXNoKHthZGRlZCwgcmVtb3ZlZCwgdmFsdWUsIGNvdW50LCBvZmZzZXR9KTtcbiAgICBvZmZzZXQgPSAwO1xuICB9KTtcbiAgcmV0dXJuIHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIGNodW5rc307XG59XG5cbmZ1bmN0aW9uIF9jb21wdXRlT2Zmc2V0cyhcbiAgZGlmZkNodW5rczogQXJyYXk8Q2h1bmtQaWVjZT4sXG4pOiB7b2xkTGluZU9mZnNldHM6IE9mZnNldE1hcDsgbmV3TGluZU9mZnNldHM6IE9mZnNldE1hcDt9IHtcbiAgY29uc3QgbmV3TGluZU9mZnNldHMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IG9sZExpbmVPZmZzZXRzID0gbmV3IE1hcCgpO1xuXG4gIGxldCBvbGRMaW5lQ291bnQgPSAwO1xuICBsZXQgbmV3TGluZUNvdW50ID0gMDtcblxuICBmb3IgKGNvbnN0IGNodW5rIG9mIGRpZmZDaHVua3MpIHtcbiAgICBjb25zdCB7YWRkZWQsIHJlbW92ZWQsIG9mZnNldCwgY291bnR9ID0gY2h1bms7XG4gICAgaWYgKGFkZGVkKSB7XG4gICAgICBuZXdMaW5lQ291bnQgKz0gY291bnQ7XG4gICAgfSBlbHNlIGlmIChyZW1vdmVkKSB7XG4gICAgICBvbGRMaW5lQ291bnQgKz0gY291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvZmZzZXQgPCAwKSB7XG4gICAgICAgIC8vIE5vbiB6ZXJvIG9mZnNldCBpbXBsaWVzIHRoaXMgYmxvY2sgaXMgbmVpdGhlciBhIHJlbW92YWwgb3IgYW4gYWRkaXRpb24sXG4gICAgICAgIC8vIGFuZCBpcyB0aHVzIGVxdWFsIGluIGJvdGggdmVyc2lvbnMgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICAvLyBTaWduIG9mIG9mZnNldCBpbmRpY2F0ZXMgd2hpY2ggdmVyc2lvbiBvZiBkb2N1bWVudCByZXF1aXJlcyB0aGUgb2Zmc2V0XG4gICAgICAgIC8vIChuZWdhdGl2ZSAtPiBvbGQgdmVyc2lvbiwgcG9zaXRpdmUgLT4gbmV3IHZlcnNpb24pLlxuICAgICAgICAvLyBNYWduaXR1ZGUgb2Ygb2Zmc2V0IGluZGljYXRlcyB0aGUgbnVtYmVyIG9mIG9mZnNldCBsaW5lcyByZXF1aXJlZCBmb3IgdmVyc2lvbi5cbiAgICAgICAgbmV3TGluZU9mZnNldHMuc2V0KG5ld0xpbmVDb3VudCwgb2Zmc2V0ICogLTEpO1xuICAgICAgfSBlbHNlIGlmIChvZmZzZXQgPiAwKSB7XG4gICAgICAgIG9sZExpbmVPZmZzZXRzLnNldChvbGRMaW5lQ291bnQsIG9mZnNldCk7XG4gICAgICB9XG4gICAgICBuZXdMaW5lQ291bnQgKz0gY291bnQ7XG4gICAgICBvbGRMaW5lQ291bnQgKz0gY291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBvbGRMaW5lT2Zmc2V0cyxcbiAgICBuZXdMaW5lT2Zmc2V0cyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpbmVDb3VudFdpdGhPZmZzZXRzKGNvbnRlbnRzOiBzdHJpbmcsIG9mZnNldHM6IE9mZnNldE1hcCk6IG51bWJlciB7XG4gIGNvbnN0IGxpbmVzQ291bnQgPSBjb250ZW50cy5zcGxpdCgvXFxyXFxufFxcbi8pLmxlbmd0aDtcbiAgcmV0dXJuIGFycmF5LmZyb20ob2Zmc2V0cy52YWx1ZXMoKSlcbiAgICAucmVkdWNlKChjb3VudCwgb2Zmc2V0TGluZXMpID0+IGNvdW50ICsgb2Zmc2V0TGluZXMsIGxpbmVzQ291bnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2Zmc2V0TGluZU51bWJlcihsaW5lTnVtYmVyOiBudW1iZXIsIG9mZnNldHM6IE9mZnNldE1hcCk6IG51bWJlciB7XG4gIGxldCBvZmZzZXRMaW5lTnVtYmVyID0gbGluZU51bWJlcjtcbiAgZm9yIChjb25zdCBbb2Zmc2V0TGluZSwgb2Zmc2V0TGluZU51bWJlcnNdIG9mIG9mZnNldHMpIHtcbiAgICBpZiAobGluZU51bWJlciA+IG9mZnNldExpbmUpIHtcbiAgICAgIG9mZnNldExpbmVOdW1iZXIgKz0gb2Zmc2V0TGluZU51bWJlcnM7XG4gICAgfVxuICB9XG4gIHJldHVybiBvZmZzZXRMaW5lTnVtYmVyO1xufVxuIl19