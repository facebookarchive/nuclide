'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AbstractDelegate = require('nuclide-click-to-symbol-delegate');
var {findDefinition} = require('./hack');
var {goToLocation} = require('nuclide-atom-helpers');

var {HACK_GRAMMAR} = require('nuclide-hack-common/lib/constants');

module.exports =
class ClickToSymbolDelegate extends AbstractDelegate {

  _pendingSameMatch: ?Promise;
  _previousWordMatch: ?{match: array<string>; range: Range};

  getPriority(): number {
    return 20;
  }

  async getClickableRangesAndCallback(editor: TextEditor, row: number, column: number): ?Promise {
    if (HACK_GRAMMAR !== editor.getGrammar().scopeName) {
      return null;
    }

    // TODO(most): Provide a word regex argument to match $ in Hack variables.
    var matchAndRange = this.getWordMatchAndRange(editor, row, column);
    if (!matchAndRange) {
      return null;
    }

    if (this._pendingSameMatch && this._previousWordMatch
        // match[0] is the complete matched string. Hence, we can skip comparing the rest.
        && matchAndRange.match[0] === this._previousWordMatch.match[0]
        && matchAndRange.range.isEqual(this._previousWordMatch.range)) {
      // Return the existing-call promise which would resolve to what this thing is.
      return this._pendingSameMatch;
    }

    this._previousWordMatch = matchAndRange;

    // Create the actual-call promise synchronously for next calls to consume.
    this._pendingSameMatch = (async () => {
      var location = await findDefinition(editor, row, column);
      if (location) {
        // Optionally use the range returned from the definition match, if any.
        var range = location.range || matchAndRange.range;
        return {
          clickableRanges: [range],
          callback: () => goToLocation(location.file, location.line, location.column),
        };
      } else {
        return null;
      }
    })();

    return this._pendingSameMatch;
  }
};
