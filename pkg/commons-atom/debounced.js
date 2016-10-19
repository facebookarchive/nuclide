Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeActivePaneItemDebounced = observeActivePaneItemDebounced;
exports.observeActiveEditorsDebounced = observeActiveEditorsDebounced;
exports.editorChangesDebounced = editorChangesDebounced;
exports.editorScrollTopDebounced = editorScrollTopDebounced;
exports.observeTextEditorsPositions = observeTextEditorsPositions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../commons-node/event');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('./text-editor');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var DEFAULT_PANE_DEBOUNCE_INTERVAL_MS = 100;
var DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS = 300;
var DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS = 300;

function observeActivePaneItemDebounced() {
  var debounceInterval = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_PANE_DEBOUNCE_INTERVAL_MS : arguments[0];

  return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(function (callback) {
    return atom.workspace.observeActivePaneItem(callback);
  }).debounceTime(debounceInterval);
}

function observeActiveEditorsDebounced() {
  var debounceInterval = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_PANE_DEBOUNCE_INTERVAL_MS : arguments[0];

  return observeActivePaneItemDebounced(debounceInterval).map(function (paneItem) {
    if (atom.workspace.isTextEditor(paneItem)) {
      // Flow cannot understand the type refinement provided by the isTextEditor function, so we
      // have to cast.
      return paneItem;
    }
    return null;
  });
}

function editorChangesDebounced(editor) {
  var debounceInterval = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS : arguments[1];

  return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(function (callback) {
    return editor.onDidChange(callback);
  })
  // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
  // configurable.
  .debounceTime(debounceInterval);
}

function editorScrollTopDebounced(editor) {
  var debounceInterval = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS : arguments[1];

  return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(function (callback) {
    return atom.views.getView(editor).onDidChangeScrollTop(callback);
  }).debounceTime(debounceInterval);
}

// Yields null when the current pane is not an editor,
// otherwise yields events on each move of the primary cursor within any Editor.

function observeTextEditorsPositions() {
  var editorDebounceInterval = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS : arguments[0];
  var positionDebounceInterval = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_POSITION_DEBOUNCE_INTERVAL_MS : arguments[1];

  return observeActiveEditorsDebounced(editorDebounceInterval).switchMap(function (editor) {
    return editor == null ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null) : (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor).debounceTime(positionDebounceInterval).map(function (position) {
      (0, (_assert || _load_assert()).default)(editor != null);
      return { editor: editor, position: position };
    });
  });
}