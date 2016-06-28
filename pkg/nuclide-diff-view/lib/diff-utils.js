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
  if (nextOffset !== 0) {
    // Add a trailing offset block at the end of the shorter file.
    chunks.push({ added: 0, removed: 0, value: '', count: 0, offset: nextOffset });
  }
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