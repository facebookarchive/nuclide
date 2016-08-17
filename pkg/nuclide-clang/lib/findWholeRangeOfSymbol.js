var _atom2;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _atom() {
  return _atom2 = require('atom');
}

// Matches something like: textA: or textA:textB:
var OBJC_SELECTOR_NAME_REGEX = /([^\s:]+:)+$/g;

/**
 * libclang doesn't seem to be able to return multiple ranges to define the location
 * of a symbol, which is necessary for Obj-C selectors. (At least, this functionality
 * is not exposed in the libclang python bindings.)
 * So we derive the location of a symbol using the symbol's 'spelling'.
 * The 'spelling' returned is the name of the clicked symbol. Usually the spelling
 * is the same as the word that was clicked. The challenging case is the Obj-C selector,
 * e.g. 'objectForKey:usingBlock:', which may appear in code as multiple segments
 * separated by other text. Thus we need to figure out the ranges the segments occur in.
 * @param textEditor The TextEditor that contains the symbol of interest.
 * @param text The word immediately under the cursor, as returned by Hyperclick.
 * @param textRange The range of `text` within `textEditor`.
 * @param spelling The whole name of the symbol, as reported by libclang. May be
 *   null if libclang reports no spelling (e.g. for C++ files).
 * @param extent The 'extent' of the symbol, as returned by libclang's Cursor.extent.
 * @return The true range of the symbol, which may extend beyond the `text` word.
 */
function findWholeRangeOfSymbol(textEditor, text, textRange, spelling, extent) {
  if (!spelling || text === spelling) {
    return [textRange];
  } else if (text + ':' === spelling) {
    // Quick check for a common case, an Obj-C selector with one argument.
    var newRange = new (_atom2 || _atom()).Range(textRange.start, [textRange.end.row, textRange.end.column + 1]);
    return [newRange];
  } else if (spelling.match(OBJC_SELECTOR_NAME_REGEX)) {
    var _ret = (function () {
      // Obj-C selector with multiple arguments, e.g. doFoo:withBar:
      // This implementation uses a simple greedy heuristic to find the location of
      // the different parts of a selector. It fails if parts of a selector appear
      // nested in arguments to the selector, such as in the case of
      // `[aThing doFoo:[anotherThing withBar:aBar] withBar:aBar]`.
      // TODO (t8131986) Improve this implementation.
      var ranges = [];

      var extentStart = [extent.start.line, extent.start.column];
      var extentEnd = [extent.end.line, extent.end.column];

      var selectorSegments = spelling.split(':');
      var iterator = function iterator(_ref) {
        var match = _ref.match;
        var matchText = _ref.matchText;
        var range = _ref.range;
        var stop = _ref.stop;
        var replace = _ref.replace;

        if (!matchText) {
          return;
        }
        ranges.push(range);
        stop();
      };
      for (var selectorSegment of selectorSegments) {
        if (selectorSegment.length === 0) {
          // The last segment broken may be an empty string.
          continue;
        }
        // 'split' removes the colon, but we want to underline the colon too.
        var segmentWithColon = selectorSegment + ':';
        var regex = new RegExp(segmentWithColon);

        var rangeOfPreviousSegment = ranges[ranges.length - 1];
        var rangeStart = rangeOfPreviousSegment ? rangeOfPreviousSegment.end : extentStart;
        var rangeToScan = new (_atom2 || _atom()).Range(rangeStart, extentEnd);

        textEditor.scanInBufferRange(regex, rangeToScan, iterator);
      }
      return {
        v: ranges
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  } else {
    return [textRange];
  }
}

module.exports = findWholeRangeOfSymbol;