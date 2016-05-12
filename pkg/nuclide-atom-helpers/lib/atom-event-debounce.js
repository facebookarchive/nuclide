Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.onWorkspaceDidStopChangingActivePaneItem = onWorkspaceDidStopChangingActivePaneItem;
exports.observeActivePaneItemDebounced = observeActivePaneItemDebounced;
exports.observeActiveEditorsDebounced = observeActiveEditorsDebounced;
exports.editorChangesDebounced = editorChangesDebounced;

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

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var DEFAULT_PANE_DEBOUNCE_INTERVAL_MS = 100;
var DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS = 300;

/**
 * Similar to Atom's Workspace::onDidChangeActivePaneItem
 * (https://atom.io/docs/api/latest/Workspace#instance-onDidChangeActivePaneItem),
 * with the addition of a debounce interval.
 * @param debounceInterval The number of milliseconds to debounce.
 */

function onWorkspaceDidStopChangingActivePaneItem(callback) {
  var debounceInterval = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_PANE_DEBOUNCE_INTERVAL_MS : arguments[1];

  var debouncedFunction = (0, (_nuclideCommons2 || _nuclideCommons()).debounce)(callback, debounceInterval, /* immediate */false);
  return atom.workspace.onDidChangeActivePaneItem(debouncedFunction);
}

function observeActivePaneItemDebounced() {
  var debounceInterval = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_PANE_DEBOUNCE_INTERVAL_MS : arguments[0];

  return (_nuclideCommons2 || _nuclideCommons()).event.observableFromSubscribeFunction(function (callback) {
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

  return (_nuclideCommons2 || _nuclideCommons()).event.observableFromSubscribeFunction(function (callback) {
    return editor.onDidChange(callback);
  })
  // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
  // configurable.
  .debounceTime(debounceInterval);
}