"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _HyperclickForTextEditor() {
  const data = _interopRequireDefault(require("./HyperclickForTextEditor"));

  _HyperclickForTextEditor = function () {
    return data;
  };

  return data;
}

function _SuggestionList() {
  const data = _interopRequireDefault(require("./SuggestionList"));

  _SuggestionList = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../../nuclide-commons-atom/range");

  _range = function () {
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

/**
 * Construct this object to enable Hyperclick in the Atom workspace.
 * Call `dispose` to disable the feature.
 */
class Hyperclick {
  constructor() {
    this._providers = new (_ProviderRegistry().default)();
    this._suggestionList = new (_SuggestionList().default)();
    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = atom.workspace.observeTextEditors(this.observeTextEditor.bind(this));
  }

  observeTextEditor(textEditor) {
    const hyperclickForTextEditor = new (_HyperclickForTextEditor().default)(textEditor, this);

    this._hyperclickForTextEditors.add(hyperclickForTextEditor);

    const disposable = new (_UniversalDisposable().default)(() => {
      hyperclickForTextEditor.dispose();

      this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
    });
    return new (_UniversalDisposable().default)(textEditor.onDidDestroy(() => disposable.dispose()), disposable);
  }

  dispose() {
    this._suggestionList.hide();

    this._textEditorSubscription.dispose();

    this._hyperclickForTextEditors.forEach(hyperclick => hyperclick.dispose());

    this._hyperclickForTextEditors.clear();
  }

  addProvider(provider) {
    if (Array.isArray(provider)) {
      return new (_UniversalDisposable().default)(...provider.map(p => this._providers.addProvider(p)));
    }

    return this._providers.addProvider(provider);
  }
  /**
   * Returns the first suggestion from the consumed providers.
   */


  async getSuggestion(textEditor, position) {
    for (const provider of this._providers.getAllProvidersForEditor(textEditor)) {
      let result;

      if (provider.getSuggestion) {
        // eslint-disable-next-line no-await-in-loop
        result = await provider.getSuggestion(textEditor, position);
      } else if (provider.getSuggestionForWord) {
        const match = (0, _range().wordAtPosition)(textEditor, position, provider.wordRegExp);

        if (match == null) {
          continue;
        }

        const {
          wordMatch,
          range
        } = match;

        if (!provider.getSuggestionForWord) {
          throw new Error("Invariant violation: \"provider.getSuggestionForWord\"");
        } // eslint-disable-next-line no-await-in-loop


        result = await provider.getSuggestionForWord(textEditor, wordMatch[0], range);
      } else {
        throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`');
      }

      if (result != null) {
        return result;
      }
    }
  }

  showSuggestionList(textEditor, suggestion) {
    this._suggestionList.show(textEditor, suggestion);
  }

}

exports.default = Hyperclick;