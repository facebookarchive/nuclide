'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

 var {Range} = require('atom');

type HyperclickProvider = {
  // Use this to provide a suggestion for single-word matches.
  // Optionally set `wordRegExp` to adjust word-matching.
  getSuggestionForWord?: (textEditor: TextEditor, text: string, range: Range) =>
      ?Promise<HyperclickSuggestion>;
  wordRegExp?: RegExp;

  // Use this to provide a suggestion if it can have non-contiguous ranges.
  // A primary use-case for this is Objective-C methods.
  getSuggestion?: (textEditor: TextEditor, position: Point) => ?Promise<HyperclickSuggestion>;

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
 * Returns the text and range for the word that contains the given position.
 */
function getWordTextAndRange(
    textEditor: TextEditor,
    position: Point,
    wordRegExp?: ?RegExp): {text: string; range: Range} {
  if (!wordRegExp) {
    wordRegExp = textEditor.getLastCursor().wordRegExp();
  }

  var textAndRange = {text: '', range: new Range(position, position)};
  var buffer = textEditor.getBuffer();
  buffer.scanInRange(wordRegExp, buffer.rangeForRow(position.row), data => {
    if (data.range.containsPoint(position)) {
      textAndRange = {
        text: data.matchText,
        range: data.range,
      };
      data.stop();
    } else if (data.range.end.column > position.column) {
      // Stop the scan if the scanner has passed our position.
      data.stop();
    }
  });

  return textAndRange;
}

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
}

module.exports = Hyperclick;
