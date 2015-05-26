'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * The ClickToSymbol package is designed to have multiple delegates registered.
 *
 * When the alt + mousemove occurs, each delegate is queried, in order, via its
 * `getClickableRangesAndCallback` method. The first delegate to return a
 * Promise that resolves to a non-null value will have its clickable ranges
 * marked in the text buffer appropriately to indicate that they are clickable.
 * When alt + mousedown occurs, using the same process first delegate
 * is found and the callback returned by `getClickableRangesAndCallback` is
 * called to handle the click.
 *
 * Instances of this class should be stateless, as they may be used
 * simultaneously by multiple editors.
 */
class ClickToSymbolDelegate {

  /**
   * When nuclide-click-to-symbol is triggered via cmd/alt-mouseover,
   * registered delegates are consulted in descending priority order.
   * Therefore, if getPriority() returns `Infinity`, then this delegate will be
   * consulted first.
   *
   * By default, this method returns 0.
   */
  getPriority(): number {
    return 0;
  }

  /**
   * Delegate is requested to inspect the mouse location given as editor and
   * position (row and column) in editor's text buffer. (Whether the shift key
   * is held down is also supplied to the delegate.)
   *
   * Returns a Promise that resolves to an object with following properties:
   *  -`clickableRanges`: array of clickable ranges at the given location
   *  -`callback`: function that can handle mouse click to the given location
   * If the location is not clickable the method should return null or a
   * Promise that resolves to null.
   *
   * Subclasses are strongly recommended to override this method.
   */
  getClickableRangesAndCallback(
      editor: TextEditor,
      row: number,
      column: number,
      shiftKey: boolean): ?Promise<{clickableRanges: Array<Range>; callback: () => void}> {
    return null;
  }

  /**
   * Helper method used to find a word that contains the given position in the
   * buffer given the regex that defines a word.
   * If regex is not specified or is null Atom's default regex to define words
   * will be used.
   * Returns object with match and range properties or null if there is no valid word
   * under the cursor.
   */
  getWordMatchAndRange(editor: TextEditor, row: number, column: number, wordRegExp: ?RegExp): ?{match: Array<string>; range: Range} {
    if (wordRegExp == null) {
      wordRegExp = editor.getLastCursor().wordRegExp();
    }

    var buffer = editor.getBuffer();
    var rowRange = buffer.rangeForRow(row);

    var matchAndRange = null;
    buffer.scanInRange(wordRegExp, rowRange, (data) => {
      if (data.range.containsPoint([row, column])) {
        matchAndRange = {
          match: data.match,
          range: data.range,
        };
      }
      // Stop the scan if the scanner has passed our position.
      if (data.range.end.column > column) {
        data.stop();
      }
    });

    return matchAndRange;
  }

  /**
   * Subclasses should override this to help with debugging.
   */
  toString(): string {
    return 'abstract ClickToSymbolDelegate';
  }
}

module.exports = ClickToSymbolDelegate;
