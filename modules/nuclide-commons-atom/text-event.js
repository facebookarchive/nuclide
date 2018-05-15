'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.__TEST__ = exports.TextEventDispatcher = undefined;exports.








































































































































































































































































































































observeTextEditorEvents = observeTextEditorEvents;var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _debounce;function _load_debounce() {return _debounce = _interopRequireDefault(require('../nuclide-commons/debounce'));}var _event;function _load_event() {return _event = require('../nuclide-commons/event');}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // A reload changes the text in the buffer, so it should trigger a refresh.
const FILE_CHANGE_EVENTS = ['did-change', 'did-reload', 'did-open']; // A reload basically indicates that an external program saved the file, so
// it should trigger a refresh.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */const FILE_SAVE_EVENTS = ['did-save', 'did-reload', 'did-open']; /**
                                                                     * Stores callbacks keyed on grammar and event, to allow for easy retrieval when
                                                                     * we need to dispatch to all callbacks registered for a given (grammar, event)
                                                                     * pair.
                                                                     */class TextCallbackContainer {// grammar -> event -> callback
  // invariant: no empty maps or sets (they should be removed instead)
  constructor() {this._callbacks = new Map();this._allGrammarCallbacks = new Map();} // event -> callback
  // invariant: no keys mapping to empty sets (they should be removed instead)
  getCallbacks(grammar, event) {const eventMap = this._callbacks.get(grammar);const callbacksForGrammar = this._getCallbacksFromEventMap(eventMap, event);const callbacksForAll = this._getCallbacksFromEventMap(this._allGrammarCallbacks, event);const resultSet = new Set();const add = callback => {resultSet.add(callback);};callbacksForGrammar.forEach(add);callbacksForAll.forEach(add);return resultSet;}isEmpty() {return this._callbacks.size === 0 && this._allGrammarCallbacks.size === 0;}_getCallbacksFromEventMap(eventMap, event) {if (!eventMap) {return new Set();}const callbackSet = eventMap.get(event);if (!callbackSet) {return new Set();}return callbackSet;}addCallback(grammarScopes, events, callback) {if (grammarScopes === 'all') {this._addToEventMap(this._allGrammarCallbacks, events, callback);} else {for (const grammarScope of grammarScopes) {let eventMap = this._callbacks.get(grammarScope);if (!eventMap) {eventMap = new Map();this._callbacks.set(grammarScope, eventMap);}this._addToEventMap(eventMap, events, callback);}}} // remove the callbacks, maintaining the invariant that there should be no
  // empty maps or sets in this._callbacks
  removeCallback(grammarScopes, events, callback) {if (grammarScopes === 'all') {this._removeFromEventMap(this._allGrammarCallbacks, events, callback);} else {for (const grammarScope of grammarScopes) {const eventMap = this._callbacks.get(grammarScope);if (!eventMap) {throw new Error('Invariant violation: "eventMap"');}this._removeFromEventMap(eventMap, events, callback);if (eventMap.size === 0) {this._callbacks.delete(grammarScope);}}}}_addToEventMap(eventMap, events, callback) {for (const event of events) {let callbackSet = eventMap.get(event);if (!callbackSet) {callbackSet = new Set();eventMap.set(event, callbackSet);}callbackSet.add(callback);}}_removeFromEventMap(eventMap, events, callback) {for (const event of events) {const callbackSet = eventMap.get(event);if (!callbackSet) {throw new Error('Invariant violation: "callbackSet"');}callbackSet.delete(callback);if (callbackSet.size === 0) {eventMap.delete(event);}}}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Meant to make it simple and easy for a DiagnosticProvider to subscribe to
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * relevant events. Currently provides two methods, onFileChange and onFileSave.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * A DiagnosticProvider will typically subscribe to only one, depending on
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * whether it wants to be notified whenever a file changes or only when it is
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * saved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Both methods take two arguments:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * - An Iterable of grammars for which the DiagnosticProvider can provide
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * diagnostics.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * - The callback to be called on a text event.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * A TextEventDispatcher will be subscribed to text events if and only if it has
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * subscribers of its own. If all subscribers unsubscribe, it will unsubscribe
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * from Atom's text events.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */class TextEventDispatcher {constructor() {this._callbackContainer = new TextCallbackContainer();this._editorListenerDisposable = null;this._pendingEvents = new WeakMap();}_onEvents(grammarScopes, events, callback) {if (this._callbackContainer.isEmpty()) {this._registerEditorListeners();} // Sometimes these events get triggered several times in succession
    // (particularly on startup).
    const debouncedCallback = (0, (_debounce || _load_debounce()).default)(callback, 50, true);this._callbackContainer.addCallback(grammarScopes, events, debouncedCallback);const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {this._callbackContainer.removeCallback(grammarScopes, events, debouncedCallback);if (this._callbackContainer.isEmpty()) {this._deregisterEditorListeners();}});return disposables;}onFileChange(grammarScopes, callback) {return this._onEvents(grammarScopes, FILE_CHANGE_EVENTS, callback);}onAnyFileChange(callback) {return this._onEvents('all', FILE_CHANGE_EVENTS, callback);}onFileSave(grammarScopes, callback) {return this._onEvents(grammarScopes, FILE_SAVE_EVENTS, callback);}onAnyFileSave(callback) {return this._onEvents('all', FILE_SAVE_EVENTS, callback);}_registerEditorListeners() {if (!this._editorListenerDisposable) {this._editorListenerDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();} // Whenever the active pane item changes, we check to see if there are any
    // pending events for the newly-focused TextEditor.
    this._getEditorListenerDisposable().add(atom.workspace.onDidChangeActivePaneItem(() => {const currentEditor = atom.workspace.getActiveTextEditor();if (currentEditor) {const pendingEvents = this._pendingEvents.get(currentEditor.getBuffer());if (pendingEvents) {for (const event of pendingEvents) {this._dispatchEvents(currentEditor, event);}this._pendingEvents.delete(currentEditor.getBuffer());}}}));this._getEditorListenerDisposable().add(atom.workspace.observeTextEditors(editor => {const buffer = editor.getBuffer();const makeDispatch = event => {return () => {this._dispatchEvents(editor, event);};};this._getEditorListenerDisposable().add(buffer.onDidStopChanging(makeDispatch('did-change')));this._getEditorListenerDisposable().add(buffer.onDidSave(makeDispatch('did-save')));this._getEditorListenerDisposable().add(buffer.onDidReload(makeDispatch('did-reload'))); // During reload, many text editors are opened simultaneously.
      // Due to the debounce on the event callback, this means that many editors never receive
      // a 'did-open' event. To work around this, defer editor open events so that simultaneous
      // open events are properly registered as pending.
      setImmediate(() => this._dispatchEvents(editor, 'did-open'));}));}_deregisterEditorListeners() {if (this._editorListenerDisposable) {this._getEditorListenerDisposable().dispose();this._editorListenerDisposable = null;}}_dispatchEvents(editor, event) {const currentEditor = atom.workspace.getActiveTextEditor();if (currentEditor && editor === currentEditor) {const callbacks = this._callbackContainer.getCallbacks(editor.getGrammar().scopeName, event);for (const callback of callbacks) {callback(editor);} // We want to avoid storing pending events if this event was generated by
      // the same buffer as the current editor, to avoid duplicating events when
      // multiple panes have the same file open.
    } else if (!currentEditor || editor.getBuffer() !== currentEditor.getBuffer()) {// Trigger this event next time we switch to an editor with this buffer.
      const buffer = editor.getBuffer();let events = this._pendingEvents.get(buffer);if (!events) {events = new Set();this._pendingEvents.set(buffer, events);}events.add(event);}}_getEditorListenerDisposable() {const disposable = this._editorListenerDisposable;if (!disposable) {throw new Error('TextEventDispatcher disposable is not initialized');}return disposable;}}exports.TextEventDispatcher = TextEventDispatcher;function observeTextEditorEvents(grammarScopes, events) {return _rxjsBundlesRxMinJs.Observable.defer(() => {const dispatcher = new TextEventDispatcher();if (events === 'changes') {if (grammarScopes === 'all') {return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => dispatcher.onAnyFileChange(cb));} else {return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => dispatcher.onFileChange(grammarScopes, cb));}} else {if (grammarScopes === 'all') {return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => dispatcher.onAnyFileSave(cb));} else {return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => dispatcher.onFileSave(grammarScopes, cb));}}});}const __TEST__ = exports.__TEST__ = { TextCallbackContainer };