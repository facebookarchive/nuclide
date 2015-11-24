'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const logger = require('nuclide-logging').getLogger();
const {track} = require('nuclide-analytics');
const {updateCursor} = require('nuclide-update-cursor');

async function formatCode(editor: ?TextEditor): Promise<void> {
  editor = editor || atom.workspace.getActiveTextEditor();
  if (!editor) {
    logger.info('- format-js: No active text editor');
    return;
  }

  track('format-js-formatCode');

  // Save things
  const buffer = editor.getBuffer();
  const oldSource = buffer.getText();
  let source = oldSource;

  // Reprint transform.
  if (atom.config.get('nuclide-format-js.reprint')) {
    const {reprint} = require('nuclide-reprint-js');
    const reprintResult = reprint(source, {
      maxLineLength: 80,
      useSpaces: true,
      tabWidth: 2,
    });
    source = reprintResult.source;
  }

  // Auto-require transform.
  // TODO: Add a limit so the transform is not run on files over a certain size.
  const {transform} = require('nuclide-format-js-base');
  const {getOptions} = require('./options');
  const path = editor.getPath();
  source = transform(source, await getOptions(path));

  // Update the source and position after all transforms are done. Do nothing
  // if the source did not change at all.
  if (source === oldSource) {
    return;
  }

  const range = buffer.getRange();
  const position = editor.getCursorBufferPosition();
  editor.setTextInBufferRange(range, source);
  editor.setCursorBufferPosition(updateCursor(oldSource, position, source));

  // Save the file if that option is specified.
  if (atom.config.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
}

module.exports = formatCode;
