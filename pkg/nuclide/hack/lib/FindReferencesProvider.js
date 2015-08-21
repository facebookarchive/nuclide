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

var {findReferences} = require('./hack');
var {HACK_GRAMMAR} = require('nuclide-hack-common');

module.exports = {
  async isEditorSupported(textEditor: TextEditor): Promise<boolean> {
    var fileUri = textEditor.getPath();
    if (!fileUri || HACK_GRAMMAR !== textEditor.getGrammar().scopeName) {
      return false;
    }
    return true;
  },

  async findReferences(
    textEditor: TextEditor,
    position: atom$Point,
  ): Promise<?Object /*FindReferencesReturn*/> {
    var {withLoadingNotification} = require('nuclide-atom-helpers');

    var result = await withLoadingNotification(
      findReferences(textEditor, position.row, position.column),
      'Loading references from Hack server...',
    );
    if (!result) {
      return {type: 'error', message: 'Only functions/methods are currently supported.'};
    }

    var {baseUri, symbolName, references} = result;

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
  },
};
