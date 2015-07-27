'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {
  HyperclickProvider,
  HyperclickSuggestion,
} from './types';

var HyperclickForTextEditor = require('./HyperclickForTextEditor');
var SuggestionList = require('./SuggestionList');
var SuggestionListElement = require('./SuggestionListElement');
var getWordTextAndRange = require('./get-word-text-and-range');
var {defaultWordRegExpForEditor} = require('./hyperclick-utils');
var {remove} = require('nuclide-commons').array;

/**
 * Calls the given functions and returns the first non-null return value.
 */
async function findTruthyReturnValue(fns: Array<void | () => Promise<any>>): Promise<any> {
  for (var fn of fns) {
    var result = typeof fn === 'function' ? await fn() : null;
    if (result) {
      return result;
    }
  }
}

/**
 * Construct this object to enable Hyperclick in the Atom workspace.
 * Call `dispose` to disable the feature.
 */
class Hyperclick {
  _consumedProviders: Array<HyperclickProvider>;
  _suggestionList: SuggestionList;
  _suggestionListViewSubscription: atom$Disposable;
  _hyperclickForTextEditors: Set<HyperclickForTextEditor>;
  _textEditorSubscription: atom$Disposable;

  constructor() {
    this._consumedProviders = [];

    this._suggestionList = new SuggestionList();
    this._suggestionListViewSubscription = atom.views.addViewProvider(
        SuggestionList,
        model => new SuggestionListElement().initialize(model));

    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = atom.workspace.observeTextEditors(
      this.observeTextEditor.bind(this));
  }

  observeTextEditor(textEditor: TextEditor) {
    var hyperclickForTextEditor = new HyperclickForTextEditor(textEditor, this);
    this._hyperclickForTextEditors.add(hyperclickForTextEditor);
    textEditor.onDidDestroy(() => {
      hyperclickForTextEditor.dispose();
      this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
    });
  }

  dispose() {
    if (this._suggestionListViewSubscription) {
      this._suggestionListViewSubscription.dispose();
    }
    if (this._textEditorSubscription) {
      this._textEditorSubscription.dispose();
    }
    this._hyperclickForTextEditors.forEach(hyperclick => hyperclick.dispose());
    this._hyperclickForTextEditors.clear();
  }

  _applyToAll<T>(item: T | Array<T>, f: (x: T) => void): void {
    if (Array.isArray(item)) {
      item.forEach(x => f(x));
    } else {
      f(item);
    }
  }

  consumeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): void {
    this._applyToAll(provider, singleProvider => this._consumeSingleProvider(singleProvider));
  }

  removeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): void {
    this._applyToAll(provider, singleProvider => this._removeSingleProvider(singleProvider));
  }

  _consumeSingleProvider(provider: HyperclickProvider): void {
    var priority = provider.priority || 0;
    for (var i = 0, len = this._consumedProviders.length; i < len; i++) {
      var item = this._consumedProviders[i];
      if (provider === item) {
        return;
      }

      var itemPriority = item.priority || 0;
      if (priority > itemPriority) {
        this._consumedProviders.splice(i, 0, provider);
        return;
      }
    }

    // If we made it all the way through the loop, provider must be lower
    // priority than all of the existing providers, so add it to the end.
    this._consumedProviders.push(provider);
  }

  _removeSingleProvider(provider: HyperclickProvider): void {
    remove(this._consumedProviders, provider);
  }

  /**
   * Returns the first suggestion from the consumed providers.
   */
  getSuggestion(textEditor: TextEditor, position: atom$Point): Promise {
    // Get the default word RegExp for this editor.
    var defaultWordRegExp = defaultWordRegExpForEditor(textEditor);

    return findTruthyReturnValue(this._consumedProviders.map((provider: HyperclickProvider) => {
      if (provider.getSuggestion) {
        var getSuggestion = provider.getSuggestion.bind(provider);
        return () => getSuggestion(textEditor, position);
      } else if (provider.getSuggestionForWord) {
        var getSuggestionForWord = provider.getSuggestionForWord.bind(provider);
        return () => {
          var wordRegExp = provider.wordRegExp || defaultWordRegExp;
          var {text, range} = getWordTextAndRange(textEditor, position, wordRegExp);
          return getSuggestionForWord(textEditor, text, range);
        };
      }

      throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`');
    }));
  }

  showSuggestionList(textEditor: TextEditor, suggestion: HyperclickSuggestion): void {
    this._suggestionList.show(textEditor, suggestion);
  }
}

module.exports = Hyperclick;
