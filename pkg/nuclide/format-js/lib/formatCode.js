'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger = require('nuclide-logging').getLogger();
var {track} = require('nuclide-analytics');
var {updateCursor} = require('nuclide-update-cursor');

async function formatCode(editor: ?TextEditor): Promise<void> {
  editor = editor || atom.workspace.getActiveTextEditor();
  if (!editor) {
    logger.info('- format-js: No active text editor');
    return;
  }

  track('format-js-formatCode');

  var buffer = editor.getBuffer();
  var oldSource = buffer.getText();

  // TODO: Add a limit so the transform is not run on files over a certain
  // length, or at least this will be nice when we run on save/stop change.
  var {transform} = require('nuclide-format-js-base');
  var {getOptions} = require('./options');
  var path = editor.getPath();
  var newSource = transform(oldSource, await getOptions(path));
  if (newSource === oldSource) {
    return;
  }

  var range = buffer.getRange(); // always format the entire file
  var position = editor.getCursorBufferPosition(); // save cursor position

  editor.setTextInBufferRange(range, newSource);
  editor.setCursorBufferPosition(updateCursor(oldSource, position, newSource));

  if (atom.config.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
}

module.exports = formatCode;
