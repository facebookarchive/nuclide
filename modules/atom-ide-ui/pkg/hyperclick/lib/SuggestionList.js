"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _SuggestionListElement() {
  const data = _interopRequireDefault(require("./SuggestionListElement"));

  _SuggestionListElement = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class SuggestionList {
  getElement() {
    if (this._element == null) {
      this._element = new (_SuggestionListElement().default)().initialize(this);
    }

    return this._element;
  }

  show(textEditor, suggestion) {
    if (!textEditor || !suggestion) {
      return;
    }

    this._textEditor = textEditor;
    this._suggestion = suggestion;
    this.hide();
    const {
      range
    } = suggestion;

    if (!range) {
      throw new Error("Invariant violation: \"range\"");
    }

    const {
      start: position
    } = Array.isArray(range) ? range[0] : range;
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