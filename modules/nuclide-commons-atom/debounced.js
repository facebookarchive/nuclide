'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.































observeActivePaneItemDebounced = observeActivePaneItemDebounced;exports.










observeActiveEditorsDebounced = observeActiveEditorsDebounced;exports.







editorChangesDebounced = editorChangesDebounced;exports.













editorScrollTopDebounced = editorScrollTopDebounced;exports.















observeTextEditorsPositions = observeTextEditorsPositions;var _observable;function _load_observable() {return _observable = require('../nuclide-commons/observable');}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _event;function _load_event() {return _event = require('../nuclide-commons/event');}var _textEditor;function _load_textEditor() {return _textEditor = require('./text-editor');} /**
                                                                                                                                                                                                                                                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                        * 
                                                                                                                                                                                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                                                                                                                                                                                        */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                            * Often, we may want to respond to Atom events, but only after a buffer period
                                                                                                                                                                                                                                                                                                                                                                                                                            * of no change.
                                                                                                                                                                                                                                                                                                                                                                                                                            * For example, Atom provides Workspace::onDidChangeActivePaneItem, but we may
                                                                                                                                                                                                                                                                                                                                                                                                                            * want to know not when the active pane item has changed, buth when it has
                                                                                                                                                                                                                                                                                                                                                                                                                            * stopped changing.
                                                                                                                                                                                                                                                                                                                                                                                                                            * This file provides methods to do this.
                                                                                                                                                                                                                                                                                                                                                                                                                            */const DEFAULT_PANE_DEBOUNCE_INTERVAL_MS = 100;const DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS = 300;const DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS = 300;function observeActivePaneItemDebounced(debounceInterval = DEFAULT_PANE_DEBOUNCE_INTERVAL_MS) {return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => {if (atom.workspace.getCenter != null) {return atom.workspace.getCenter().observeActivePaneItem(callback);}return atom.workspace.observeActivePaneItem(callback);}).let((0, (_observable || _load_observable()).fastDebounce)(debounceInterval));}function observeActiveEditorsDebounced(debounceInterval = DEFAULT_PANE_DEBOUNCE_INTERVAL_MS) {return observeActivePaneItemDebounced(debounceInterval).map(paneItem => {return (0, (_textEditor || _load_textEditor()).isValidTextEditor)(paneItem) ? paneItem : null;});}function editorChangesDebounced(editor, debounceInterval = DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS) {return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => editor.getBuffer().onDidChangeText(() => callback())) // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
  // configurable.
  .let((0, (_observable || _load_observable()).fastDebounce)(debounceInterval));}function editorScrollTopDebounced(editor, debounceInterval = DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS) {return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => atom.views.getView(editor).onDidChangeScrollTop(callback)).let((0, (_observable || _load_observable()).fastDebounce)(debounceInterval));} // Yields null when the current pane is not an editor,
// otherwise yields events on each move of the primary cursor within any Editor.
function observeTextEditorsPositions(editorDebounceInterval = DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS, positionDebounceInterval = DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS) {return observeActiveEditorsDebounced(editorDebounceInterval).switchMap(editor => {return editor == null ? _rxjsBundlesRxMinJs.Observable.of(null) : (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor).let((0, (_observable || _load_observable()).fastDebounce)(positionDebounceInterval)).map(position => {if (!(editor != null)) {throw new Error('Invariant violation: "editor != null"');}return { editor, position };});});}