'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {findDefinition} = require('./hack');
var {goToLocation} = require('nuclide-atom-helpers');

var {HACK_GRAMMAR} = require('nuclide-hack-common/lib/constants');

module.exports = {
  priority: 20,
  async getSuggestionForWord(textEditor: TextEditor, text: string, range: Range) {
    if (HACK_GRAMMAR !== textEditor.getGrammar().scopeName) {
      return null;
    }

    var {start: position} = range;

    // Create the actual-call promise synchronously for next calls to consume.
    var location = await findDefinition(textEditor, position.row, position.column);
    if (location) {
      // Optionally use the range returned from the definition match, if any.
      var range = location.range || range;
      return {
        range,
        callback: () => goToLocation(location.file, location.line, location.column),
      };
    } else {
      return null;
    }
  },
};
