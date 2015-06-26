'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class SuggestionList {
  show(textEditor: TextEditor, suggestion: HyperclickSuggestion): void {
    if (!textEditor || !suggestion) {
      return;
    }

    this._textEditor = textEditor;
    this._suggestion = suggestion;

    this.hide();

    var {start: position} = Array.isArray(suggestion.range) ? suggestion.range[0] : suggestion.range;
    this._suggestionMarker = textEditor.markBufferPosition(position);
    if (this._suggestionMarker) {
      this._overlayDecoration = textEditor.decorateMarker(this._suggestionMarker, {
        type: 'overlay',
        item: this,
      });
    }
  }

  hide() {
    atom.views.getView(this).dispose();
    if (this._suggestionMarker) {
      this._suggestionMarker.destroy();
    } else if (this._overlayDecoration) {
      this._overlayDecoration.destroy();
    }
    this._suggestionMarker = undefined;
    this._overlayDecoration = undefined;
  }

  getTextEditor(): ?TextEditor {
    return this._textEditor;
  }

  getSuggestion(): ?HyperclickSuggestion {
    return this._suggestion;
  }
}

module.exports = SuggestionList;
