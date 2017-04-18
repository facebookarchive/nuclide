'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class SuggestionList {

  show(textEditor, suggestion) {
    if (!textEditor || !suggestion) {
      return;
    }

    this._textEditor = textEditor;
    this._suggestion = suggestion;

    this.hide();

    const { range } = suggestion;

    if (!range) {
      throw new Error('Invariant violation: "range"');
    }

    const { start: position } = Array.isArray(range) ? range[0] : range;
    this._suggestionMarker = textEditor.markBufferPosition(position);
    if (this._suggestionMarker) {
      this._overlayDecoration = textEditor.decorateMarker(this._suggestionMarker, {
        type: 'overlay',
        item: this
      });
    }
  }

  hide() {
    // $FlowFixMe method override not working with `this`.
    atom.views.getView(this).dispose();
    if (this._suggestionMarker) {
      this._suggestionMarker.destroy();
    } else if (this._overlayDecoration) {
      this._overlayDecoration.destroy();
    }
    this._suggestionMarker = undefined;
    this._overlayDecoration = undefined;
  }

  getTextEditor() {
    return this._textEditor;
  }

  getSuggestion() {
    return this._suggestion;
  }
}
exports.default = SuggestionList;