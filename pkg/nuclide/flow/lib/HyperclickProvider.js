'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {getServiceByNuclideUri} = require('nuclide-client');
var {goToLocation} = require('nuclide-atom-helpers');

var GRAMMARS = new Set([
  'source.js',
]);

module.exports = {
  priority: 20,
  async getSuggestionForWord(textEditor: TextEditor, text: string, range: Range) {
    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();
    var {start: position} = range;
    var location = await getServiceByNuclideUri('FlowService', file)
        .findDefinition(file, textEditor.getText(), position.row + 1, position.column + 1);
    if (location) {
      return {
        range,
        callback() {
          goToLocation(location.file, location.line, location.column);
        },
      };
    } else {
      return null;
    }
  },
};
