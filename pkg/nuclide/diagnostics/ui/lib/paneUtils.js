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
    var [, relativePath] = atom.project.relativizePath(diagnostic.filePath);
    return relativePath;
  } else {
    return '';
  }
}

function compareMessagesByFile(a: DiagnosticMessage, b: DiagnosticMessage): number {
  var aMsg = fileColumnCellDataGetter('filePath', a);
  var bMsg = fileColumnCellDataGetter('filePath', b);
  return aMsg.localeCompare(bMsg);
}

module.exports = {
  compareMessagesByFile,
  fileColumnCellDataGetter,
};
