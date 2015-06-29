'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SuggestionList = require('./SuggestionList');
var SuggestionListElement = require('./SuggestionListElement');
var getWordTextAndRange = require('./get-word-text-and-range');

type HyperclickProvider = {
  // Use this to provide a suggestion for single-word matches.
  // Optionally set `wordRegExp` to adjust word-matching.
  getSuggestionForWord?: (textEditor: TextEditor, text: string, range: Range) =>
      ?Promise<HyperclickSuggestion>;
  wordRegExp?: RegExp;

  // Use this to provide a suggestion if it can have non-contiguous ranges.
  // A primary use-case for this is Objective-C methods.
  getSuggestion?: (textEditor: TextEditor, position: atom$Point) => ?Promise<HyperclickSuggestion>;

  // The higher this is, the more precedence the provider gets. Defaults to 0.
  priority?: number;
};

type HyperclickSuggestion = {
  // The range(s) to underline to provide as a visual cue for clicking.
  range: ?Range | ?Array<Range>;

  // The function to call when the underlined text is clicked.
  callback: () => void | Array<{title: string; callback: () => {}}>;
};

/**
 * Calls the given functions and returns the first non-null return value.
 */
async function findTruthyReturnValue(fns: Array<undefined | () => Promise<any>>): Promise<any> {
  for (var i = 0; i < fns.length; i++) {
    var fn = fns[i];
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
  constructor() {
    this._consumedProviders = [];

    this._suggestionList = new SuggestionList();
    this._suggestionListViewSubscription = atom.views.addViewProvider(
        SuggestionList,
        model => new SuggestionListElement().initialize(model));

    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = atom.workspace.observeTextEditors(textEditor => {
      var HyperclickForTextEditor = require('./HyperclickForTextEditor');
      var hyperclickForTextEditor = new HyperclickForTextEditor(textEditor, this);
      this._hyperclickForTextEditors.add(hyperclickForTextEditor);

      textEditor.onDidDestroy(() => {
        hyperclickForTextEditor.dispose();
        this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
      });
    });
  }

  dispose() {
    this._consumedProviders = null;
    if (this._textEditorSubscription) {
      this._textEditorSubscription.dispose();
      this._textEditorSubscription = null;
    }
    this._hyperclickForTextEditors.forEach(hyperclick => hyperclick.dispose());
    this._hyperclickForTextEditors.clear();
  }

  consumeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): void {
    if (Array.isArray(provider)) {
      provider.forEach(singleProvider => this._consumeSingleProvider(singleProvider));
    } else {
      this._consumeSingleProvider(provider);
    }
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

  /**
   * Returns the first suggestion from the consumed providers.
   */
  getSuggestion(textEditor: TextEditor, position: Point): Promise {
    return findTruthyReturnValue(this._consumedProviders.map(provider => {
      if (provider.getSuggestion) {
        return () => provider.getSuggestion(textEditor, position);
      } else if (provider.getSuggestionForWord) {
        return () => {
          var {text, range} = getWordTextAndRange(textEditor, position, provider.wordRegExp);
          return provider.getSuggestionForWord(textEditor, text, range);
        };
      }

      throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`')
    }));
  }

  showSuggestionList(textEditor: TextEditor, suggestion: HyperclickSuggestion): void {
    this._suggestionList.show(textEditor, suggestion);
  }
}

module.exports = Hyperclick;
