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

async function formatCode(editor: ?TextEditor): Promise<void> {
  editor = editor || atom.workspace.getActiveTextEditor();
  if (!editor) {
    logger.info('- format-js: No active text editor');
    return;
  }

  var buffer = editor.getBuffer();
  var oldSource = buffer.getText();

  // TODO: Add a limit so the transform is not run on files over a certain
  // length, or at least this will be nice when we run on save/stop change.
  var {transform} = require('nuclide-format-js-base');
  var {getModuleMap} = require('./options');
  var newSource = transform(oldSource, {
    moduleMap: getModuleMap(),
    sourcePath: editor.getPath(),
    blacklist: new Set(atom.config.get('nuclide-format-js.transformBlacklist')),
  });

  if (newSource === oldSource) {
    return;
  }

  var range = buffer.getRange(); // always format the entire file
  var position = editor.getCursorBufferPosition(); // save cursor position
  var startingRowText = editor.lineTextForBufferRow(position.row).trim();
  var startingLines = editor.getLineCount();

  // TODO: Only update editor text if the current text is the same as before
  // the transform (or is this all blocking?)
  editor.setTextInBufferRange(range, newSource);

  var endingLines = editor.getLineCount();
  var lineChange = Math.abs(startingLines - endingLines);

  // TODO: Improve the cursor restoration, see if it's possible to put into the
  // format-js-base package.
  // TODO: Add unit tests for cursor restoration.
  //
  // Try to find a matching row close to where we started.
  //
  // Enforce that the row we are matching against has a length of at least 5
  // so that we don't jump to an incorrect row that contains only a closing },
  // parens, etc.
  var match = 0;
  if (startingRowText.length > 5) {
    var fudge = 5; // Give us a little extra room to search for the match.
    var start = Math.max(position.row - lineChange - fudge, 1);
    var end = Math.min(position.row + lineChange + fudge, endingLines - 1);
    for (var r = start; r <= end; r++) {
      var rowText = editor.lineTextForBufferRow(r);
      if (rowText.trim() === startingRowText) {
        match = r;
        break;
      }
    }
  }

  // Restore the cursor.
  if (match) {
    editor.setCursorBufferPosition([match, position.column]);
  } else {
    editor.setCursorBufferPosition(position);
  }

  if (atom.config.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
}

module.exports = formatCode;
