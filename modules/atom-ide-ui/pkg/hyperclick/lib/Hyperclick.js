'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _HyperclickForTextEditor;

function _load_HyperclickForTextEditor() {
  return _HyperclickForTextEditor = _interopRequireDefault(require('./HyperclickForTextEditor'));
}

var _SuggestionList;

function _load_SuggestionList() {
  return _SuggestionList = _interopRequireDefault(require('./SuggestionList'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Construct this object to enable Hyperclick in the Atom workspace.
 * Call `dispose` to disable the feature.
 */
class Hyperclick {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();

    this._suggestionList = new (_SuggestionList || _load_SuggestionList()).default();
    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = (0, (_textEditor || _load_textEditor()).observeTextEditors)(this.observeTextEditor.bind(this));
  }

  observeTextEditor(textEditor) {
    const hyperclickForTextEditor = new (_HyperclickForTextEditor || _load_HyperclickForTextEditor()).default(textEditor, this);
    this._hyperclickForTextEditors.add(hyperclickForTextEditor);
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      hyperclickForTextEditor.dispose();
      this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
    });
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(textEditor.onDidDestroy(() => disposable.dispose()), disposable);
  }

  dispose() {
    this._suggestionList.hide();
    this._textEditorSubscription.dispose();
    this._hyperclickForTextEditors.forEach(hyperclick => hyperclick.dispose());
    this._hyperclickForTextEditors.clear();
  }

  addProvider(provider) {
    if (Array.isArray(provider)) {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(...provider.map(p => this._providers.addProvider(p)));
    }
    return this._providers.addProvider(provider);
  }

  /**
   * Returns the first suggestion from the consumed providers.
   */
  getSuggestion(textEditor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      for (const provider of _this._providers.getAllProvidersForEditor(textEditor)) {
        let result;
        if (provider.getSuggestion) {
          // eslint-disable-next-line no-await-in-loop
          result = yield provider.getSuggestion(textEditor, position);
        } else if (provider.getSuggestionForWord) {
          const match = (0, (_range || _load_range()).wordAtPosition)(textEditor, position, provider.wordRegExp);
          if (match == null) {
            continue;
          }
          const { wordMatch, range } = match;

          if (!provider.getSuggestionForWord) {
            throw new Error('Invariant violation: "provider.getSuggestionForWord"');
          }
          // eslint-disable-next-line no-await-in-loop


          result = yield provider.getSuggestionForWord(textEditor, wordMatch[0], range);
        } else {
          throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`');
        }
        if (result != null) {
          return result;
        }
      }
    })();
  }

  showSuggestionList(textEditor, suggestion) {
    this._suggestionList.show(textEditor, suggestion);
  }
}
exports.default = Hyperclick; /**
                               * Copyright (c) 2017-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the BSD-style license found in the
                               * LICENSE file in the root directory of this source tree. An additional grant
                               * of patent rights can be found in the PATENTS file in the same directory.
                               *
                               * 
                               * @format
                               */