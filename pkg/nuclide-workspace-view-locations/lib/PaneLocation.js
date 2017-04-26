'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaneLocation = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _observeAddedPaneItems;

function _load_observeAddedPaneItems() {
  return _observeAddedPaneItems = require('./observeAddedPaneItems');
}

var _observePanes;

function _load_observePanes() {
  return _observePanes = require('./observePanes');
}

var _syncPaneItemVisibility;

function _load_syncPaneItemVisibility() {
  return _syncPaneItemVisibility = require('./syncPaneItemVisibility');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class PaneLocation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_syncPaneItemVisibility || _load_syncPaneItemVisibility()).syncPaneItemVisibility)((0, (_observePanes || _load_observePanes()).observePanes)(atom.workspace.paneContainer), _rxjsBundlesRxMinJs.Observable.of(true)));
  }

  activate() {
    // No need to do anything; this is always visible.
  }

  addItem(item) {
    atom.workspace.getActivePane().addItem(item);
  }

  activateItem(item) {
    let pane = atom.workspace.paneForItem(item);
    if (pane == null) {
      pane = atom.workspace.getActivePane();
    }
    pane.activate();
    pane.activateItem(item);
  }

  /**
   * The PaneLocation is a little special. Since it delegates all of the work to Atom, it doesn't
   * actually manage all of its own state. A viewable added to this location in a previous session
   * (and then serialized and deserialized) is indistinguishable from a pane item added via other
   * means, so we'll be conservative but predictable and not destroy any items.
   */
  destroy() {
    this._disposables.dispose();
  }

  destroyItem(item) {
    const pane = atom.workspace.paneForItem(item);
    if (pane != null) {
      pane.destroyItem(item);
    }
  }

  getItems() {
    return atom.workspace.getPaneItems();
  }

  _destroyItem(item) {
    // The user may have split since adding, so find the item first.
    const pane = atom.workspace.paneForItem(item);
    if (pane != null) {
      pane.destroyItem(item);
    }
  }

  hideItem(item) {
    this.destroyItem(item);
  }

  itemIsVisible(item) {
    const pane = atom.workspace.paneForItem(item);
    return pane != null && pane.getActiveItem() === item;
  }

  serialize() {
    // We rely on the default Atom serialization for Panes.
    return null;
  }

  onDidAddItem(cb) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_observeAddedPaneItems || _load_observeAddedPaneItems()).observeAddedPaneItems)(atom.workspace.paneContainer).subscribe(cb));
  }
}
exports.PaneLocation = PaneLocation;