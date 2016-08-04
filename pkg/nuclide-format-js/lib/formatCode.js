'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SourceOptions} from '../../nuclide-format-js-common/lib/options/SourceOptions';

import featureConfig from '../../commons-atom/featureConfig';
import {track} from '../../nuclide-analytics';
import {updateCursor} from '../../nuclide-update-cursor';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();

async function formatCode(options: SourceOptions, editor_: ?TextEditor): Promise<void> {
  let editor = editor_;
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
  if (featureConfig.get('nuclide-format-js.reprint')) {
    const {reprint} = require('../../nuclide-reprint-js');
    // $FlowFixMe(kad) -- this seems to conflate an class instance with an ordinary object.
    const reprintResult = reprint(source, {
      maxLineLength: 80,
      useSpaces: true,
      tabWidth: 2,
    });
    source = reprintResult.source;
  }

  // Auto-require transform.
  // TODO: Add a limit so the transform is not run on files over a certain size.
  const {transform} = require('../../nuclide-format-js-common');
  source = transform(source, options);

  // Update the source and position after all transforms are done. Do nothing
  // if the source did not change at all.
  if (source === oldSource) {
    return;
  }

  const range = buffer.getRange();
  const position = editor.getCursorBufferPosition();
  editor.setTextInBufferRange(range, source);
  const {row, column} = updateCursor(oldSource, position, source);
  editor.setCursorBufferPosition([row, column]);

  // Save the file if that option is specified.
  if (featureConfig.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
}

module.exports = formatCode;
