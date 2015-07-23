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
// import type {FindReferencesData} from 'nuclide-find-references';

var {findReferences} = require('./hack');
var {HACK_GRAMMAR} = require('nuclide-hack-common');

module.exports = {
  async findReferences(
    textEditor: TextEditor,
    position: atom$Point
  ): Promise<?Object /*FindReferencesData*/> {
    var fileUri = textEditor.getPath();
    if (!fileUri || HACK_GRAMMAR !== textEditor.getGrammar().scopeName) {
      return null;
    }

    var result = await findReferences(textEditor, position.row, position.column);
    if (!result) {
      throw new Error('Could not find references.');
    }

    var {baseUri, symbolName, references} = result;
    if (!references.length) {
      throw new Error('No references found.');
    }

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
      baseUri,
      referencedSymbolName: symbolName,
      references,
    };
  }
};
