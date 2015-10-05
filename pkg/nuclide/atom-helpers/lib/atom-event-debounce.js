'use babel';
/* @flow */

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

var {debounce} = require('nuclide-commons');

const DEFAULT_DEBOUNCE_INTERVAL_MS = 100;

/**
 * Similar to Atom's Workspace::onDidChangeActivePaneItem
 * (https://atom.io/docs/api/v1.0.2/Workspace#instance-onDidChangeActivePaneItem),
 * with the addition of a debounce interval.
 * @param debounceInterval The number of milliseconds to debounce.
 */
function onWorkspaceDidStopChangingActivePaneItem(
    callback: (item: mixed) => any,
    debounceInterval: number = DEFAULT_DEBOUNCE_INTERVAL_MS
  ): atom$Disposable {
  var debouncedFunction = debounce(callback, debounceInterval, /* immediate */ false);
  return atom.workspace.onDidChangeActivePaneItem(debouncedFunction);
}

module.exports = {
  onWorkspaceDidStopChangingActivePaneItem,
};
