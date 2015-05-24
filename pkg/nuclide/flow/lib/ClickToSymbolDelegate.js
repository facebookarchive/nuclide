'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */
var AbstractDelegate = require('nuclide-click-to-symbol-delegate');
var {getServiceByNuclideUri} = require('nuclide-client');
var {goToLocation} = require('nuclide-atom-helpers');

var GRAMMARS = new Set([
  'source.js',
]);

class ClickToSymbolDelegate extends AbstractDelegate {

  getPriority(): number {
    return 20;
  }

  async getClickableRangesAndCallback(editor: TextEditor, row: number, column: number): Promise<?mixed> {
    if (!GRAMMARS.has(editor.getGrammar().scopeName)) {
      return null;
    }

    var matchAndRange = this.getWordMatchAndRange(editor, row, column);
    if (matchAndRange == null) {
      return null;
    }

    var range = matchAndRange.range;
    var file = editor.getPath();
    var location = await getServiceByNuclideUri('FlowService', file)
        .findDefinition(file, editor.getText(), row + 1, column + 1);
    if (location) {
      return {
        clickableRanges: [range],
        callback() {
          goToLocation(location.file, location.line, location.column);
        },
      };
    } else {
      return null;
    }
  }
}

module.exports = ClickToSymbolDelegate;
