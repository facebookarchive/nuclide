'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Calls the given functions and returns the first non-null return value.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let findTruthyReturnValue = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fns) {
    for (const fn of fns) {
      // eslint-disable-next-line no-await-in-loop
      const result = typeof fn === 'function' ? yield fn() : null;
      if (result) {
        return result;
      }
    }
  });

  return function findTruthyReturnValue(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Construct this object to enable Hyperclick in the Atom workspace.
 * Call `dispose` to disable the feature.
 */


var _HyperclickForTextEditor;

function _load_HyperclickForTextEditor() {
  return _HyperclickForTextEditor = _interopRequireDefault(require('./HyperclickForTextEditor'));
}

var _SuggestionList;

function _load_SuggestionList() {
  return _SuggestionList = _interopRequireDefault(require('./SuggestionList'));
}

var _hyperclickUtils;

function _load_hyperclickUtils() {
  return _hyperclickUtils = require('./hyperclick-utils');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Hyperclick {

  constructor() {
    this._consumedProviders = [];

    this._suggestionList = new (_SuggestionList || _load_SuggestionList()).default();
    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = (0, (_textEditor || _load_textEditor()).observeTextEditors)(this.observeTextEditor.bind(this));
  }

  observeTextEditor(textEditor) {
    const hyperclickForTextEditor = new (_HyperclickForTextEditor || _load_HyperclickForTextEditor()).default(textEditor, this);
    this._hyperclickForTextEditors.add(hyperclickForTextEditor);
    textEditor.onDidDestroy(() => {
      hyperclickForTextEditor.dispose();
      this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
    });
  }

  dispose() {
    this._suggestionList.hide();
    if (this._textEditorSubscription) {
      this._textEditorSubscription.dispose();
    }
    this._hyperclickForTextEditors.forEach(hyperclick => hyperclick.dispose());
    this._hyperclickForTextEditors.clear();
  }

  _applyToAll(item, f) {
    if (Array.isArray(item)) {
      item.forEach(x => f(x));
    } else {
      f(item);
    }
  }

  consumeProvider(provider) {
    this._applyToAll(provider, singleProvider => this._consumeSingleProvider(singleProvider));
  }

  removeProvider(provider) {
    this._applyToAll(provider, singleProvider => this._removeSingleProvider(singleProvider));
  }

  _consumeSingleProvider(provider) {
    const priority = provider.priority || 0;
    for (let i = 0, len = this._consumedProviders.length; i < len; i++) {
      const item = this._consumedProviders[i];
      if (provider === item) {
        return;
      }

      const itemPriority = item.priority || 0;
      if (priority > itemPriority) {
        this._consumedProviders.splice(i, 0, provider);
        return;
      }
    }

    // If we made it all the way through the loop, provider must be lower
    // priority than all of the existing providers, so add it to the end.
    this._consumedProviders.push(provider);
  }

  _removeSingleProvider(provider) {
    const index = this._consumedProviders.indexOf(provider);
    if (index >= 0) {
      this._consumedProviders.splice(index, 1);
    }
  }

  /**
   * Returns the first suggestion from the consumed providers.
   */
  getSuggestion(textEditor, position) {
    // Get the default word RegExp for this editor.
    const defaultWordRegExp = (0, (_hyperclickUtils || _load_hyperclickUtils()).defaultWordRegExpForEditor)(textEditor);

    return findTruthyReturnValue(this._consumedProviders.map(provider => {
      if (provider.getSuggestion) {
        const getSuggestion = provider.getSuggestion.bind(provider);
        return () => (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(getProviderName(provider) + '.getSuggestion', () => getSuggestion(textEditor, position));
      } else if (provider.getSuggestionForWord) {
        const getSuggestionForWord = provider.getSuggestionForWord.bind(provider);
        return () => {
          const wordRegExp = provider.wordRegExp || defaultWordRegExp;
          const { text, range } = (0, (_hyperclickUtils || _load_hyperclickUtils()).getWordTextAndRange)(textEditor, position, wordRegExp);
          return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(getProviderName(provider) + '.getSuggestionForWord', () => getSuggestionForWord(textEditor, text, range));
        };
      }

      throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`');
    }));
  }

  showSuggestionList(textEditor, suggestion) {
    this._suggestionList.show(textEditor, suggestion);
  }
}

exports.default = Hyperclick; /** Returns the provider name or a default value */

function getProviderName(provider) {
  if (provider.providerName != null) {
    return provider.providerName;
  } else {
    return 'unnamed-hyperclick-provider';
  }
}