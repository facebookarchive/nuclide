'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Disposable} = require('atom');
const {EventEmitter} = require('events');

const GRAMMAR_CHANGE_EVENT = 'grammar-change';

/**
 * A singleton that listens to grammar changes in all text editors.
 */
class GrammarForTextEditorsListener {
  _emitter: EventEmitter;
  _grammarSubscriptionsMap: Map<TextEditor, IDisposable>;
  _destroySubscriptionsMap: Map<TextEditor, IDisposable>;
  _textEditorsSubscription: IDisposable;

  constructor() {
    this._emitter = new EventEmitter();
    this._grammarSubscriptionsMap = new Map();
    this._destroySubscriptionsMap = new Map();
    this._textEditorsSubscription = atom.workspace.observeTextEditors(textEditor => {
      const grammarSubscription = textEditor.observeGrammar(grammar => {
        this._emitter.emit(GRAMMAR_CHANGE_EVENT, textEditor);
      });
      this._grammarSubscriptionsMap.set(textEditor, grammarSubscription);

      const destroySubscription = textEditor.onDidDestroy(() => {
        const subscription = this._grammarSubscriptionsMap.get(textEditor);
        if (subscription) {
          subscription.dispose();
          this._grammarSubscriptionsMap.delete(textEditor);
        }

        destroySubscription.dispose();
        this._destroySubscriptionsMap.delete(textEditor);
      });
      this._destroySubscriptionsMap.set(textEditor, destroySubscription);
    });
  }

  observeGrammarForTextEditors(
    fn: (textEditor: TextEditor, grammar: atom$Grammar) => void,
  ): Disposable {
    function fnWithGrammar(textEditor) {
      fn(textEditor, textEditor.getGrammar());
    }

    // The event was already handled before `fn` was added to the emitter, so
    // we need to call it on all the existing editors.
    atom.workspace.getTextEditors().forEach(fnWithGrammar);
    this._emitter.addListener(GRAMMAR_CHANGE_EVENT, fnWithGrammar);
    return new Disposable(() => {
      this._emitter.removeListener(GRAMMAR_CHANGE_EVENT, fnWithGrammar);
    });
  }

  dispose(): void {
    this._emitter.removeAllListeners();
    this._grammarSubscriptionsMap.forEach(subscription => subscription.dispose());
    this._grammarSubscriptionsMap.clear();
    this._destroySubscriptionsMap.forEach(subscription => subscription.dispose());
    this._destroySubscriptionsMap.clear();
    this._textEditorsSubscription.dispose();
  }
}

let grammarForTextEditorsListener: ?GrammarForTextEditorsListener;

/**
 * Use this to perform an action on every text editor with its latest grammar.
 *
 * @param fn This is called once for every text editor, and then again every
 * time it changes to a grammar.
 */
function observeGrammarForTextEditors(
  fn: (textEditor: TextEditor, grammar: atom$Grammar) => void,
): IDisposable {
  if (!grammarForTextEditorsListener) {
    grammarForTextEditorsListener = new GrammarForTextEditorsListener();
  }
  return grammarForTextEditorsListener.observeGrammarForTextEditors(fn);
}

if (atom.inSpecMode()) {
  observeGrammarForTextEditors.__reset__ = function() {
    if (grammarForTextEditorsListener) {
      grammarForTextEditorsListener.dispose();
      grammarForTextEditorsListener = null;
    }
  };
}

module.exports = observeGrammarForTextEditors;
