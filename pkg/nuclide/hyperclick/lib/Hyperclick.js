'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickSuggestion, HyperclickProvider} from '../../hyperclick-interfaces';

import HyperclickForTextEditor from './HyperclickForTextEditor';
import SuggestionList from './SuggestionList';
import SuggestionListElement from './SuggestionListElement';
import getWordTextAndRange from './get-word-text-and-range';
import {defaultWordRegExpForEditor} from './hyperclick-utils';
import {array} from '../../commons';
import {trackOperationTiming} from '../../analytics';

/**
 * Calls the given functions and returns the first non-null return value.
 */
async function findTruthyReturnValue(fns: Array<void | () => Promise<any>>): Promise<any> {
  /* eslint-disable babel/no-await-in-loop */
  for (const fn of fns) {
    const result = typeof fn === 'function' ? await fn() : null;
    if (result) {
      return result;
    }
  }
  /* eslint-enable babel/no-await-in-loop */
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
    const hyperclickForTextEditor = new HyperclickForTextEditor(textEditor, this);
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

  _applyToAll<T>(item: Array<T> | T, f: (x: T) => void): void {
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

  _removeSingleProvider(provider: HyperclickProvider): void {
    array.remove(this._consumedProviders, provider);
  }

  /**
   * Returns the first suggestion from the consumed providers.
   */
  getSuggestion(textEditor: TextEditor, position: atom$Point): Promise {
    // Get the default word RegExp for this editor.
    const defaultWordRegExp = defaultWordRegExpForEditor(textEditor);

    return findTruthyReturnValue(this._consumedProviders.map((provider: HyperclickProvider) => {
      if (provider.getSuggestion) {
        const getSuggestion = provider.getSuggestion.bind(provider);
        return () => trackOperationTiming(
            provider.providerName + '.getSuggestion',
            () => getSuggestion(textEditor, position));
      } else if (provider.getSuggestionForWord) {
        const getSuggestionForWord = provider.getSuggestionForWord.bind(provider);
        return () => {
          const wordRegExp = provider.wordRegExp || defaultWordRegExp;
          const {text, range} = getWordTextAndRange(textEditor, position, wordRegExp);
          return trackOperationTiming(
            provider.providerName + '.getSuggestionForWord',
            () => getSuggestionForWord(textEditor, text, range));
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
