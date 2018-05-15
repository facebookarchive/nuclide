'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.




















toUnifiedDiff = toUnifiedDiff;var _atom = require('atom');function toUnifiedDiff(
filename,
buffer,
edits,
contextRows = 1)
{
  const hunks = getHunks(buffer, edits, contextRows);
  return [`--- ${filename}`, `+++ ${filename}`].
  concat(mapHunkToString(buffer, hunks, contextRows)).
  join('\n');
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   *  strict-local
   * @format
   */function getHunks(buffer, edits, contextRows) {return edits.sort((e1, e2) => e1.oldRange.compare(e2.oldRange)).reduce((mergedEdits, nextEdit) => {const edit = mergedEdits[mergedEdits.length - 1];
    if (
    edit &&
    nextEdit.oldRange.start.row <= edit.oldRange.end.row + contextRows)
    {
      mergedEdits[mergedEdits.length - 1] = mergeEdit(buffer, edit, nextEdit);
    } else {
      mergedEdits.push(nextEdit);
    }
    return mergedEdits;
  }, []).
  map(edit => {
    const oldRange = edit.oldRange;
    const rows = oldRange.getRows();
    const newText =
    buffer.lineForRow(rows[0]).substring(0, oldRange.start.column) +
    edit.newText +
    buffer.lineForRow(rows[rows.length - 1]).substring(oldRange.end.column);
    const newLines = newText.split(/\r\n|\r|\n/);
    return { rows, newLines };
  });
}

function mergeEdit(
buffer,
e1,
e2)
{if (!
  e1.oldRange.end.isLessThanOrEqual(e2.oldRange.start)) {throw new Error('Invariant violation: "e1.oldRange.end.isLessThanOrEqual(e2.oldRange.start)"');}
  const mergedEdit = {};
  mergedEdit.newText =
  e1.newText +
  buffer.getTextInRange(new _atom.Range(e1.oldRange.end, e2.oldRange.start)) +
  e2.newText;
  mergedEdit.oldRange = e1.oldRange.union(e2.oldRange);
  return mergedEdit;
}

function mapHunkToString(
buffer,
hunks,
contextRows)
{
  // This requires storing some state across the map() to compute the row
  // numbers correctly.
  let newRowOffset = 0;
  return hunks.map(hunk => {
    const { rows, newLines } = hunk;
    const beforeRows = [];
    const afterRows = [];
    for (let i = 1; i <= contextRows; i++) {
      const beforeRow = rows[0] - i;
      const afterRow = rows[rows.length - 1] + i;
      if (beforeRow >= 0) {
        beforeRows.unshift(beforeRow);
      }
      if (afterRow <= buffer.getLastRow()) {
        afterRows.push(afterRow);
      }
    }
    const oldBeginRow = rows[0] - beforeRows.length + 1;
    const oldRowLength = rows.length + beforeRows.length + afterRows.length;
    const newBeginRow = oldBeginRow + newRowOffset;
    const newRowLength = newLines.length + beforeRows.length + afterRows.length;

    const parts = [];
    parts.push(
    `@@ -${oldBeginRow},${oldRowLength} +${newBeginRow},${newRowLength} @@`);

    beforeRows.forEach(row => {
      parts.push(' ' + buffer.lineForRow(row));
    });
    rows.forEach(row => {
      parts.push('-' + buffer.lineForRow(row));
    });
    newLines.forEach(line => {
      parts.push('+' + line);
    });
    afterRows.forEach(row => {
      parts.push(' ' + buffer.lineForRow(row));
    });
    newRowOffset += newLines.length - rows.length;
    return parts.join('\n');
  });
}