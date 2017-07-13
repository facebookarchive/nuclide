'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDocksWorkspaceViewsService = getDocksWorkspaceViewsService;
exports.consumeWorkspaceViewsCompat = consumeWorkspaceViewsCompat;

var _atom = require('atom');

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/**
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

function getDocksWorkspaceViewsService() {
  return {
    registerLocation: () => new _atom.Disposable(() => {}),
    addOpener: opener => atom.workspace.addOpener(opener),
    destroyWhere(predicate) {
      atom.workspace.getPanes().forEach(pane => {
        pane.getItems().forEach(item => {
          if (predicate(item)) {
            pane.destroyItem(item, true);
          }
        });
      });
    },
    open(uri, options) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(uri, options);
    },
    toggle(uri, options) {
      const visible = options && options.visible;
      if (visible === true) {
        // eslint-disable-next-line nuclide-internal/atom-apis
        atom.workspace.open(uri, { searchAllPanes: true });
      } else if (visible === false) {
        // TODO(jxg) remove this once Atom 1.17 lands.
        if (typeof atom.workspace.hide === 'function') {
          // Atom version >=1.17
          atom.workspace.hide(uri);
        } else {
          // Atom version <1.17
          const hasItem = atom.workspace.getPaneItems().some(item => typeof item.getURI === 'function' && item.getURI() === uri);
          if (hasItem) {
            // TODO(matthewwithanm): Add this to the Flow defs once docks land
            // $FlowIgnore
            atom.workspace.toggle(uri);
          }
        }
      } else {
        // TODO(matthewwithanm): Add this to the Flow defs once docks land
        // $FlowIgnore
        atom.workspace.toggle(uri);
      }
    }
  };
}

function consumeWorkspaceViewsCompat(callback) {
  if ((_semver || _load_semver()).default.gte(atom.getVersion(), '1.17.0')) {
    callback(getDocksWorkspaceViewsService());
    return new _atom.Disposable();
  }
  return atom.packages.serviceHub.consume('nuclide.workspace-views', '0.0.0', callback);
}