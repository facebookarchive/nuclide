'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function defaultWordRegExpForEditor(textEditor: atom$TextEditor): ?RegExp {
  var lastCursor = textEditor.getLastCursor();
  if (!lastCursor) {
    return null;
  }
  return lastCursor.wordRegExp();
}

module.exports = {
  defaultWordRegExpForEditor,
};
