'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var GRAMMARS = new Set([
  'source.ocaml',
]);
var EXTENSIONS = new Set([
  'ml',
  'mli',
]);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  async getSuggestionForWord(textEditor: TextEditor, text: string, range: atom$Range) {
    var {getServiceByNuclideUri} = require('nuclide-client');

    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();

    var kind = 'ml';
    var extension = require('path').extname(file);
    if (EXTENSIONS.has(extension)) {
      kind = extension;
    }

    var instance = await getServiceByNuclideUri('MerlinService', file);
    var start = range.start;

    return {
      range,
      callback: async function() {
        await instance.pushNewBuffer(file, textEditor.getText());
        var location = await instance.locate(
          file,
          start.row,
          start.column,
          kind);
        if (!location) {
          return;
        }

        var {goToLocation} = require('nuclide-atom-helpers');
        goToLocation(location.file, location.pos.line - 1, location.pos.col);
      }
    };
  }
};
