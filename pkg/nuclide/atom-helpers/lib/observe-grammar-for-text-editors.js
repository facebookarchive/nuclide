'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('atom');
var {EventEmitter} = require('events');

var GRAMMAR_CHANGE_EVENT = 'grammar-change';

/**
 * A singleton that listens to grammar changes in all text editors.
 */
class GrammarForTextEditorsListener {
  constructor() {
    this._emitter = new EventEmitter();
    this._grammarSubscriptionsMap = new Map();
    this._destroySubscriptionsMap = new Map();
    this._textEditorsSubscription = atom.workspace.observeTextEditors(textEditor => {
      var grammarSubscription = textEditor.observeGrammar(grammar => {
        this._emitter.emit(GRAMMAR_CHANGE_EVENT, textEditor);
      });
      this._grammarSubscriptionsMap.set(textEditor, grammarSubscription);

      var destroySubscription = textEditor.onDidDestroy(() => {
        var subscription = this._grammarSubscriptionsMap.get(textEditor);
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

  observeGrammarForTextEditors(fn: (textEditor: TextEditor, grammar: Grammar) => void): Disposable {
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

var listeners = new WeakMap();

module.exports =
/**
 * Use this to perform an action on every text editor with its latest grammar.
 *
 * @param fn This is called once for every text editor, and then again every
 * time it changes to a grammar.
 */
function observeGrammarForTextEditors(fn: (textEditor: TextEditor) => void): Disposable {
  // The listener should be a global singleton but workspaces are destroyed
  // between each test run so we need to reinstantiate the listener to attach
  // to the current workspace.
  var listener = listeners.get(atom.workspace);
  if (!listener) {
    listener = new GrammarForTextEditorsListener();
    listeners.set(atom.workspace, listener);
  }
  return listener.observeGrammarForTextEditors(fn);
};
