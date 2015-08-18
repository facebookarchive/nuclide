'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BlameGutterWidthManager = require('./BlameGutterWidthManager');

import type {BlameForEditor, BlameProvider} from 'nuclide-blame-base/blame-types';

var {BLAME_DECORATION_CLASS} = require('./constants');
var BLAME_GUTTER_DEFAULT_WIDTH = 50;
var LOADING_SPINNER_ID = 'blame-loading-spinner';
var MS_TO_WAIT_BEFORE_SPINNER = 2000;

class BlameGutter {
  _editor: atom$TextEditor;
  _blameProvider: BlameProvider;
  _bufferLineToDecoration: Map<number, atom$Decoration>;
  _gutter: atom$Gutter;
  _gutterWidthManager: BlameGutterWidthManager;
  _loadingSpinnerIsPending: boolean;
  _loadingSpinnerDiv: ?HTMLElement;
  _loadingSpinnerTimeoutId: number;
  _isDestroyed: boolean;

  /**
   * @param gutterName A name for this gutter. Must not be used by any another
   *   gutter in this TextEditor.
   * @param editor The TextEditor this BlameGutter should create UI for.
   * @param blameProvider The BlameProvider that provides the appropriate blame
   *   information for this BlameGutter.
   */
  constructor(gutterName: string, editor: atom$TextEditor, blameProvider: BlameProvider) {
    this._isDestroyed = false;

    this._editor = editor;
    this._blameProvider = blameProvider;
    this._bufferLineToDecoration = new Map();

    this._gutter = editor.addGutter({name: gutterName});
    this._gutterWidthManager = new BlameGutterWidthManager(this._gutter, BLAME_GUTTER_DEFAULT_WIDTH);

    this._fetchAndDisplayBlame();
  }

  async _fetchAndDisplayBlame(): Promise<void> {
    // Add a loading spinner while we fetch the blame.
    this._addLoadingSpinner();

    var newBlame = await this._blameProvider.getBlameForEditor(this._editor);
    // The BlameGutter could have been destroyed while blame was being fetched.
    if (this._isDestroyed) {
      return;
    }

    // Remove the loading spinner before setting the contents of the blame gutter.
    this._cleanUpLoadingSpinner();

    this._updateBlame(newBlame);
  }

  _addLoadingSpinner(): void {
    if (this._loadingSpinnerIsPending) {
      return;
    }
    this._loadingSpinnerIsPending = true;
    this._loadingSpinnerTimeoutId = window.setTimeout(() => {
      this._loadingSpinnerIsPending = false;
      this._loadingSpinnerDiv = document.createElement('div');
      this._loadingSpinnerDiv.id = LOADING_SPINNER_ID;
      var gutterView = atom.views.getView(this._gutter);
      gutterView.appendChild(this._loadingSpinnerDiv);
    }, MS_TO_WAIT_BEFORE_SPINNER);
  }

  _cleanUpLoadingSpinner(): void {
    if (this._loadingSpinnerIsPending) {
      window.clearTimeout(this._loadingSpinnerTimeoutId);
      this._loadingSpinnerIsPending = false;
    }
    if (this._loadingSpinnerDiv) {
      this._loadingSpinnerDiv.remove();
      this._loadingSpinnerDiv = null;
    }
  }

  destroy(): void {
    this._isDestroyed = true;
    this._cleanUpLoadingSpinner();
    this._gutterWidthManager.dispose();
    if (!this._editor.isDestroyed()) {
      // Due to a bug in the Gutter API, destroying a Gutter after the editor
      // has been destroyed results in an exception.
      this._gutter.destroy();
    }
    for (var decoration of this._bufferLineToDecoration.values()) {
      decoration.getMarker().destroy();
    }
  }

  // The BlameForEditor completely replaces any previous blame information.
  _updateBlame(blameForEditor: BlameForEditor): void {
    var allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

    var longestBlame = 0;
    for (var [bufferLine, blameName] of blameForEditor) {
      if (blameName.length > longestBlame) {
        longestBlame = blameName.length;
      }
      this._setBlameLine(bufferLine, blameName);
      allPreviousBlamedLines.delete(bufferLine);
    }

    // Any lines that weren't in the new blameForEditor are outdated.
    for (var oldLine of allPreviousBlamedLines) {
      this._removeBlameLine(oldLine);
    }

    // Update the width of the gutter according to the new contents.
    this._gutterWidthManager.updateGutterWidthToLineLength(longestBlame);
  }

  _setBlameLine(bufferLine: number, blameName: string): void {
    var blameDiv = document.createElement('div');
    blameDiv.innerText = blameName;
    var decorationProperties = {
      type: 'gutter',
      gutterName: this._gutter.name,
      class: BLAME_DECORATION_CLASS,
      item: blameDiv,
    };

    var decoration = this._bufferLineToDecoration.get(bufferLine);
    if (!decoration) {
      var bufferLineHeadPoint = [bufferLine, 0];
      // The range of this Marker doesn't matter, only the line it is on, because
      // the Decoration is for a Gutter.
      var marker = this._editor.markBufferRange([bufferLineHeadPoint, bufferLineHeadPoint]);
      decoration = this._editor.decorateMarker(marker, decorationProperties);
      this._bufferLineToDecoration.set(bufferLine, decoration);
    } else {
      decoration.setProperties(decorationProperties);
    }
  }

  _removeBlameLine(bufferLine: number): void {
    var blameDecoration = this._bufferLineToDecoration.get(bufferLine);
    if (!blameDecoration) {
      return;
    }
    // The recommended way of destroying a decoration is by destroying its marker.
    blameDecoration.getMarker().destroy();
    this._bufferLineToDecoration.delete(bufferLine);
  }
}

module.exports = BlameGutter;
