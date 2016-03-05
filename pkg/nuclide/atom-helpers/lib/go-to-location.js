'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Opens the given file at the line/column.
// By default will center the opened text editor.
async function goToLocation(
    file: string,
    line: number,
    column: number,
    center: boolean = true): Promise<atom$TextEditor> {
  const editor = await atom.workspace.open(file, {
    initialLine: line,
    initialColumn: column,
    searchAllPanes: true,
  });

  if (center) {
    editor.scrollToBufferPosition([line, column], {center: true});
  }
  return editor;
}

module.exports = goToLocation;
