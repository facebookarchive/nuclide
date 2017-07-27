'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDocksWorkspaceViewsService = getDocksWorkspaceViewsService;
exports.consumeWorkspaceViewsCompat = consumeWorkspaceViewsCompat;

var _atom = require('atom');

/**
 * The object used as items in locations. This is based on the supported interface for items in Atom
 * panes. That way, we maintain compatibility with Atom (upstream?) and can put them in panes as-is.
 *
 * The truth is that these models can have any methods they want. Packages define ad-hoc protocols
 * and check to see if the item implements them. For example, atom-tabs will call `getIconName()` if
 * it exists. We have some of our own optional methods which, for clarity's sake, are defined here,
 * even though they're only used by some of our location packages.
 *
 * IMPORTANT: All properties and methods must be optional so that we maintain compatibility with
 * non-nuclide items.
 */
function getDocksWorkspaceViewsService() {
  return {
    addOpener: opener => atom.workspace.addOpener(opener),
    open(uri, options) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(uri, options);
    },
    toggle(uri, options) {
      const visible = options && options.visible;
      switch (visible) {
        case true:
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open(uri, { searchAllPanes: true });
          break;
        case false:
          atom.workspace.hide(uri);
          break;
        default:
          atom.workspace.toggle(uri);
      }
    }
  };
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */

/**
 * A small compatibilty stub for interop with Nuclide, which still supports Atom 1.16.
 * For Atom 1.17+ this just uses the native Atom APIs.
 * TODO(matthewwithanm): Delete this and refactor to workspace
 * API once Nuclide uses 1.17.
 */

function consumeWorkspaceViewsCompat(callback) {
  callback(getDocksWorkspaceViewsService());
  return new _atom.Disposable();
}