'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// We can't pull in nuclide-find-references as a dependency, unfortunately.
// import type {FindReferencesReturn} from 'nuclide-find-references';

const {findReferences} = require('./hack');
const {HACK_GRAMMARS_SET} = require('../../hack-common');
import {trackOperationTiming} from '../../analytics';

async function doFindReferences(
  textEditor: TextEditor,
  position: atom$Point,
): Promise<?Object /*FindReferencesReturn*/> {
  const {withLoadingNotification} = require('../../atom-helpers');

  const result = await withLoadingNotification(
    findReferences(textEditor, position.row, position.column),
    'Loading references from Hack server...',
  );
  if (!result) {
    return {type: 'error', message: 'Only classes/functions/methods are supported.'};
  }

  let {baseUri, symbolName, references} = result;

  // Process this into the format nuclide-find-references expects.
  references = references.map(ref => {
    return {
      uri: ref.filename,
      name: null, // TODO(hansonw): Get the caller when it's available
      start: {
        line: ref.line,
        column: ref.char_start,
      },
      end: {
        line: ref.line,
        column: ref.char_end,
      },
    };
  });

  // Strip off the global namespace indicator.
  if (symbolName.startsWith('\\')) {
    symbolName = symbolName.slice(1);
  }

  return {
    type: 'data',
    baseUri,
    referencedSymbolName: symbolName,
    references,
  };
}

module.exports = {
  async isEditorSupported(textEditor: TextEditor): Promise<boolean> {
    const fileUri = textEditor.getPath();
    if (!fileUri || !HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  },

  findReferences(editor: TextEditor, position: atom$Point): Promise<?Object> {
    return trackOperationTiming('hack:findReferences', () => doFindReferences(editor, position));
  },
};
