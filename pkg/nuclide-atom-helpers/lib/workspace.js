Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getPathToWorkspaceState = getPathToWorkspaceState;
exports.activatePaneItem = activatePaneItem;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/**
 * @return The path to the JSON file on disk where the workspace state is stored.
 */

function getPathToWorkspaceState() {
  // Atom <1.2 this function exists on `atom.constructor`. Atom >=1.2 it exists on the global `atom`
  // object. Find the appropriate location, and return `null` if both fail unexpectedly.
  var getStateKey = atom.getStateKey || atom.constructor.getStateKey;
  if (typeof getStateKey !== 'function') {
    return null;
  }

  // As you can imagine, the way that we are getting this path is not documented and is therefore
  // unstable.
  // TODO(t8750960): Work with the Atom core team to get a stable API for this.
  return _path2['default'].join(atom.getConfigDirPath(), 'storage', getStateKey(atom.project.getPaths(), 'editor'));
}

function activatePaneItem(paneItem) {
  var pane = atom.workspace.paneForItem(paneItem);
  (0, _assert2['default'])(pane != null);
  pane.activate();
  pane.activateItem(paneItem);
}