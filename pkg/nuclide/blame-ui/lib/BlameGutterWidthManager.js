'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type DecorationParams = {
  width: number;
  text: string;
};

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

var {BLAME_DECORATION_CLASS} = require('./constants');
var BLAME_DECORATION_PADDING = 10;

class BlameGutterWidthManager {
  _gutter: atom$Gutter;
  _domMutationObserver: ?MutationObserver;

  constructor(gutter: atom$Gutter, defaultWidthInPixels: number) {
    this._gutter = gutter;
    this._setGutterWidth(defaultWidthInPixels);
  }

  dispose() {
    if (this._domMutationObserver) {
      this._domMutationObserver.disconnect();
      this._domMutationObserver = null;
    }
  }

  _setGutterWidth(widthInPixels: number): void {
    var gutterView = atom.views.getView(this._gutter);
    gutterView.style.width = String(Math.round(widthInPixels)) + 'px';
  }

  _scaleGutterWidthToFitLineLength(lineLength: number, benchmark: DecorationParams): void {
    if (benchmark.text.length === 0) {
      // Hg should not return 0-length blame. However, if this happens, the BlameGutterWidthManager
      // should fail gracefully and do no width adjustment, rather than throwing.
      getLogger().error('BlameGutterWidthManager couldn\'t resize blame gutter: Hg returned a 0-length blame.');
      return;
    }
    var scaledWidth = Math.round(lineLength / benchmark.text.length * benchmark.width);
    this._setGutterWidth(scaledWidth + BLAME_DECORATION_PADDING);
  }

  /**
   * Update the gutter to accommodate a string of length `longestLineLength`.
   */
  updateGutterWidthToLineLength(longestLineLength: number): void {
    var benchmark = this._getWidthAndTextOfOnscreenBlameDecoration();
    if (benchmark) {
      this._scaleGutterWidthToFitLineLength(longestLineLength, benchmark);
    } else {
      this._fetchNextAvailableDecorationParams((nextBenchmark) => {
        this._scaleGutterWidthToFitLineLength(longestLineLength, nextBenchmark);
      });
    }
  }

  /**
   * Tries to find the first onscreen blame decoration and return information
   * about it.
   * @return Object of the form:
   *   - width: width in pixels
   *   - text: the text of the item
   *   or null if no onscreen blame decoration can be found.
   */
  _getWidthAndTextOfOnscreenBlameDecoration(): ?DecorationParams {
    var gutterView = atom.views.getView(this._gutter);
    // The firstChild of the gutterView is the gutter container, then the first
    // child of that should be a decoration.
    var decorationsContainer = gutterView.querySelector('.custom-decorations');
    if (!decorationsContainer) {
      return null;
    }
    var gutterDecoration = decorationsContainer.querySelector(`.${BLAME_DECORATION_CLASS}`);
    if (gutterDecoration) {
      return {
        width: gutterDecoration.clientWidth,
        // Compared to the original content, innerText has a newline inserted.
        text: gutterDecoration.innerText.trim(),
      };
    }
    return null;
  }

  _fetchNextAvailableDecorationParams(callback: (newParams: DecorationParams) => mixed): void {
    if (this._domMutationObserver) {
      // Cancel the existing observer in favor of a new one.
      this._domMutationObserver.disconnect();
      this._domMutationObserver = null;
    }

    this._domMutationObserver = new MutationObserver((mutationRecords) => {
      for (var mutationRecord of mutationRecords) {
        if (mutationRecord.type !== 'childList') {
          // We're interested in changes to decorations, which are children of
          // the gutter view.
          continue;
        }
        var decorationParams = this._getWidthAndTextOfOnscreenBlameDecoration();
        if (decorationParams) {
          this._domMutationObserver.disconnect();
          this._domMutationObserver = null;
          callback(decorationParams);
        }
        // If we have fetched decorationParms and called the callback, we're done.
        // Even if we didn't find decorations in the DOM now, checking again very
        // soon (i.e. for the rest of the mutationRecords) won't yield any either.
        return;
      }
    });

    var gutterView = atom.views.getView(this._gutter);
    // attributes, childList, and characterData must be true (specified by the MutationObserver API).
    var config = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    };
    this._domMutationObserver.observe(gutterView, config);
  }
}

module.exports = BlameGutterWidthManager;
