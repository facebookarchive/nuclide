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

import {findReferences} from './hack';
import {HACK_GRAMMARS_SET} from '../../hack-common';
import {trackOperationTiming} from '../../analytics';
import {withLoadingNotification} from '../../atom-helpers';

async function doFindReferences(
  textEditor: atom$TextEditor,
  position: atom$Point,
): Promise<?Object /*FindReferencesReturn*/> {
  const result = await withLoadingNotification(
    findReferences(textEditor, position.row, position.column),
    'Loading references from Hack server...',
  );
  if (!result) {
    return {type: 'error', message: 'Only classes/functions/methods are supported.'};
  }

  const {baseUri} = result;
  let {symbolName, references} = result;

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
  async isEditorSupported(textEditor: atom$TextEditor): Promise<boolean> {
    const fileUri = textEditor.getPath();
    if (!fileUri || !HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  },

  findReferences(editor: atom$TextEditor, position: atom$Point): Promise<?Object> {
    return trackOperationTiming('hack:findReferences', () => doFindReferences(editor, position));
  },
};
