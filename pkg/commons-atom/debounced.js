'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Often, we may want to respond to Atom events, but only after a buffer period
 * of no change.
 * For example, Atom provides Workspace::onDidChangeActivePaneItem, but we may
 * want to know not when the active pane item has changed, buth when it has
 * stopped changing.
 * This file provides methods to do this.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeActivePaneItemDebounced = observeActivePaneItemDebounced;
exports.observeActiveEditorsDebounced = observeActiveEditorsDebounced;
exports.editorChangesDebounced = editorChangesDebounced;
exports.editorScrollTopDebounced = editorScrollTopDebounced;
exports.observeTextEditorsPositions = observeTextEditorsPositions;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('./text-editor');
}

const DEFAULT_PANE_DEBOUNCE_INTERVAL_MS = 100;
const DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS = 300;
const DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS = 300;

function observeActivePaneItemDebounced() {
  let debounceInterval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PANE_DEBOUNCE_INTERVAL_MS;

  return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => {
    return atom.workspace.observeActivePaneItem(callback);
  }).debounceTime(debounceInterval);
}

function observeActiveEditorsDebounced() {
  let debounceInterval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PANE_DEBOUNCE_INTERVAL_MS;

  return observeActivePaneItemDebounced(debounceInterval).map(paneItem => {
    if (atom.workspace.isTextEditor(paneItem)) {
      // Flow cannot understand the type refinement provided by the isTextEditor function, so we
      // have to cast.
      return paneItem;
    }
    return null;
  });
}

function editorChangesDebounced(editor) {
  let debounceInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS;

  return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => editor.onDidChange(callback))
  // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
  // configurable.
  .debounceTime(debounceInterval);
}

function editorScrollTopDebounced(editor) {
  let debounceInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS;

  return (0, (_event || _load_event()).observableFromSubscribeFunction)(callback => atom.views.getView(editor).onDidChangeScrollTop(callback)).debounceTime(debounceInterval);
}

// Yields null when the current pane is not an editor,
// otherwise yields events on each move of the primary cursor within any Editor.
function observeTextEditorsPositions() {
  let editorDebounceInterval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS;
  let positionDebounceInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS;

  return observeActiveEditorsDebounced(editorDebounceInterval).switchMap(editor => {
    return editor == null ? _rxjsBundlesRxMinJs.Observable.of(null) : (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor).debounceTime(positionDebounceInterval).map(position => {
      if (!(editor != null)) {
        throw new Error('Invariant violation: "editor != null"');
      }

      return { editor: editor, position: position };
    });
  });
}