'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');
var {Emitter, Disposable, CompositeDisposable} = require('atom');

type EventCallback = (editor: TextEditor) => mixed;

type Event = 'did-reload' | 'did-change' | 'did-save';

/**
 * Stores callbacks keyed on grammar and event, to allow for easy retrieval when
 * we need to dispatch to all callbacks registered for a given (grammar, event)
 * pair.
 */
class TextCallbackContainer<CallbackArg> {
  // grammar -> event -> callback
  // invariant: no empty maps or sets (they should be removed instead)
  _callbacks: Map<string, Map<Event, Set<(arg: CallbackArg) => mixed>>>;

  constructor() {
    this._callbacks = new Map();
  }

  getCallbacks(grammar: string, event: Event): Set<(arg: CallbackArg) => mixed> {
    var eventMap = this._callbacks.get(grammar);
    if (!eventMap) {
      return new Set();
    }
    var callbackSet = eventMap.get(event);
    if (!callbackSet) {
      return new Set();
    }
    return new Set(callbackSet);
  }

  isEmpty(): boolean {
    return this._callbacks.size === 0;
  }

  addCallback(
      grammarScopes: Array<string>,
      events: Array<Event>,
      callback: (arg: CallbackArg) => mixed
      ): void {
    for (var grammarScope of grammarScopes) {
      var eventMap = this._callbacks.get(grammarScope);
      if (!eventMap) {
        eventMap = new Map();
        this._callbacks.set(grammarScope, eventMap);
      }
      for (var event of events) {
        var callbackSet = eventMap.get(event);
        if (!callbackSet) {
          callbackSet = new Set();
          eventMap.set(event, callbackSet);
        }
        callbackSet.add(callback);
      }
    }
  }

  // remove the callbacks, maintaining the invariant that there should be no
  // empty maps or sets in this._callbacks
  removeCallback(
      grammarScopes: Array<string>,
      events: Array<Event>,
      callback: (arg: CallbackArg) => mixed
      ): void {
    for (var grammarScope of grammarScopes) {
      var eventMap = this._callbacks.get(grammarScope);
      invariant(eventMap);
      for (var event of events) {
        var callbackSet = eventMap.get(event);
        invariant(callbackSet);
        callbackSet.delete(callback);
        if (callbackSet.size === 0) {
          eventMap.delete(event);
        }
      }
      if (eventMap.size === 0) {
        this._callbacks.delete(grammarScope);
      }
    }
  }
}

// TODO(7806872) make this available to all DiagnosticProviders, but think
// carefully about the API and where this should live before doing so.
/**
 * Meant to make it simple and easy for a DiagnosticProvider to subscribe to
 * relevant events. Currently provides two methods, onFileChange and onFileSave.
 * A DiagnosticProvider will typically subscribe to only one, depending on
 * whether it wants to be notified whenever a file changes or only when it is
 * saved.
 *
 * Both methods take two arguments:
 * - An Array of grammars for which the DiagnosticProvider can provide
 * diagnostics.
 * - The callback to be called on a text event.
 *
 * A TextEventDispatcher will be subscribed to text events if and only if it has
 * subscribers of its own. If all subscribers unsubscribe, it will unsubscribe
 * from Atom's text events.
 *
 */
class TextEventDispatcher {
  _callbackContainer: TextCallbackContainer<TextEditor>;

  _editorListenerDisposable: ?CompositeDisposable;

  constructor() {
    this._callbackContainer = new TextCallbackContainer();
    this._editorListenerDisposable = null;
  }

  _onEvents(grammarScopes: Array<string>, events: Array<Event>, callback: EventCallback) {
    if (this._callbackContainer.isEmpty()) {
      this._registerEditorListeners();
    }
    this._callbackContainer.addCallback(grammarScopes, events, callback);
    var disposables = new Disposable(() => {
      this._callbackContainer.removeCallback(grammarScopes, events, callback);
      if (this._callbackContainer.isEmpty()) {
        this._deregisterEditorListeners();
      }
    });
    return disposables;
  }

  onFileChange(grammarScopes: Array<string>, callback: EventCallback): atom$Disposable {
    // A reload changes the text in the buffer, so it should trigger a refresh.
    return this._onEvents(grammarScopes, ['did-change', 'did-reload'], callback);
  }

  onFileSave(grammarScopes: Array<string>, callback: EventCallback): atom$Disposable {
    // A reload basically indicates that an external program saved the file, so
    // it should trigger a refresh.
    return this._onEvents(grammarScopes, ['did-save', 'did-reload'], callback);
  }

  _registerEditorListeners(): void {
    if (!this._editorListenerDisposable) {
      this._editorListenerDisposable = new CompositeDisposable();
    }

    this._getEditorListenerDisposable().add(atom.workspace.observeTextEditors(editor => {
      var buffer = editor.getBuffer();
      var makeDispatch = (event: Event) => {
        return () => {
          if (editor === atom.workspace.getActiveTextEditor()) {
            var callbacks = this._callbackContainer.getCallbacks(editor.getGrammar().scopeName, event);
            for (var callback of callbacks) {
              callback(editor);
            }
          }
        };
      };
      // TODO consider providing some sort of debouncing here, to avoid
      // thrashing the providers or making them each implement their own.
      this._getEditorListenerDisposable().add(buffer.onDidStopChanging(makeDispatch('did-change')));
      this._getEditorListenerDisposable().add(buffer.onDidSave(makeDispatch('did-save')));
      this._getEditorListenerDisposable().add(buffer.onDidReload(makeDispatch('did-reload')));
    }));
  }

  _deregisterEditorListeners() {
    if (this._editorListenerDisposables) {
      this._getEditorListenerDisposable().dispose();
      this._editorListenerDisposable = null;
    }
  }

  _getEditorListenerDisposable(): CompositeDisposable {
    var disposable = this._editorListenerDisposable;
    invariant(disposable, 'TextEventDispatcher disposable is not initialized');
    return disposable;
  }
}

module.exports = {
  TextEventDispatcher,
  __TEST__: {
    TextCallbackContainer
  }
};
