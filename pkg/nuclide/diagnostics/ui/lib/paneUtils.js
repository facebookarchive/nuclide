'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
function fileColumnCellDataGetter(cellDataKey: 'filePath', diagnostic: DiagnosticMessage): string {
  if (diagnostic.filePath) {
    const [, relativePath] = atom.project.relativizePath(diagnostic.filePath);
    return relativePath;
  } else {
    return '';
  }
}

function compareMessagesByFile(a: DiagnosticMessage, b: DiagnosticMessage): number {
  const aMsg = fileColumnCellDataGetter('filePath', a);
  const bMsg = fileColumnCellDataGetter('filePath', b);

  let compareVal = aMsg.localeCompare(bMsg);
  // If the messages are from the same file (`filePath` is equal and `localeCompare`
  // returns 0), compare the line numbers within the file to determine their sort order.
  if (compareVal === 0 && (a.range !== undefined && b.range !== undefined)) {
    compareVal = a.range.start.row - b.range.start.row;
  }

  return compareVal;
}

module.exports = {
  compareMessagesByFile,
  fileColumnCellDataGetter,
};
