'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');
var {EventEmitter} = require('events');

var START_OBSERVING_TEXT_EDITOR_EVENT = 'start-observing-text-editor';
var STOP_OBSERVING_TEXT_EDITOR_EVENT = 'stop-observing-text-editor';

/**
 * Use this to perform an action on all text editors of the given grammar set.
 *
 * This exists as its own class to make it possible to reuse instances when
 * multiple callers observe on text editors with the same grammar scopes.
 */
class LanguageTextEditorsListener {
  constructor(grammarScopes: Set<string>) {
    this._grammarScopes = grammarScopes;

    this._emitter = new EventEmitter();
    this._observedTextEditors = new Set();
    this._destroySubscriptionsMap = new Map();

    var {observeGrammarForTextEditors} = require('./main');
    this._grammarSubscription = observeGrammarForTextEditors((textEditor, grammar) => {
      var textEditorHasTheRightGrammar = this._grammarScopes.has(grammar.scopeName);
      var isTextEditorObserved = this._observedTextEditors.has(textEditor);
      if (textEditorHasTheRightGrammar && !isTextEditorObserved) {
        this._emitter.emit(START_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
        this._observedTextEditors.add(textEditor);
      } else if (!textEditorHasTheRightGrammar && isTextEditorObserved) {
        this._emitter.emit(STOP_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
        this._observedTextEditors.delete(textEditor);
      }

      var destroySubscription = textEditor.onDidDestroy(() => {
        // When a text editor that we were observing is destroyed, we need to
        // do clean-up even if its grammar hasn't changed.
        if (this._observedTextEditors.has(textEditor)) {
          this._emitter.emit(STOP_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
          this._observedTextEditors.delete(textEditor);
        }

        destroySubscription.dispose();
        this._destroySubscriptionsMap.delete(textEditor);
      });
      this._destroySubscriptionsMap.set(textEditor, destroySubscription);
    });
  }

  observeLanguageTextEditors(
      fn: (textEditor: TextEditor) => void,
      cleanupFn: (textEditor: TextEditor) => void): Disposable {
    // The event was already handled before `fn` was added to the emitter, so
    // we need to call it on all the existing editors.
    atom.workspace.getTextEditors()
        .filter(textEditor => this._grammarScopes.has(textEditor.getGrammar().scopeName))
        // We wrap `fn` instead of passing it directly to `.forEach` so it only
        // gets called with one arg (i.e. it matches the Flow annotation).
        .forEach(textEditor => fn(textEditor));

    this._emitter.addListener(START_OBSERVING_TEXT_EDITOR_EVENT, fn);
    this._emitter.addListener(STOP_OBSERVING_TEXT_EDITOR_EVENT, cleanupFn);
    return new Disposable(() => {
      this._emitter.removeListener(START_OBSERVING_TEXT_EDITOR_EVENT, fn);
      this._emitter.removeListener(STOP_OBSERVING_TEXT_EDITOR_EVENT, cleanupFn);
    });
  }

  dispose(): void {
    this._emitter.removeAllListeners();
    this._observedTextEditors.clear();
    this._destroySubscriptionsMap.forEach(subscription => subscription.dispose());
    this._destroySubscriptionsMap.clear();
    this._grammarSubscription.dispose();
  }
}

module.exports =
/**
 * Perform actions on text editors of a given language.
 *
 * @param grammarScopes The grammar scope names to watch for.
 * @param fn This is called once on every text editor that matches the grammars.
 * @param cleanupFn This is called when a text editor no longer matches the
 * grammars or is destroyed.
 */
function observeLanguageTextEditors(
    grammarScopes: Array<string>,
    fn: (textEditor: TextEditor) => void,
    cleanupFn?: (textEditor: TextEditor) => void): Disposable {
  var subscriptions = new CompositeDisposable();
  var listener = new LanguageTextEditorsListener(new Set(grammarScopes));
  subscriptions.add(listener);
  subscriptions.add(listener.observeLanguageTextEditors(fn, cleanupFn || (() => {})));
  return subscriptions;
};
