'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');

function doSplit(
    splitOperation: (pane: atom$Pane, params?: atom$PaneSplitParams) => atom$Pane) {
  var pane = atom.workspace.getActivePane();
  if (pane) {
    // Note that this will (intentionally) create an empty pane if the active
    // pane contains exactly zero or one items.
    // The new empty pane will be kept if the global atom setting
    // 'Destroy Empty Panes' is false, otherwise it will be removed.
    var newPane = splitOperation(pane, {copyActiveItem: false});
    var item = pane.getActiveItem();
    if (item) {
      pane.moveItemToPane(item, newPane, 0);
    }
  }
}

function splitUp() {
  doSplit((pane, params) => pane.splitUp(params));
}

function splitDown() {
  doSplit((pane, params) => pane.splitDown(params));
}

function splitRight() {
  doSplit((pane, params) => pane.splitRight(params));
}

function splitLeft() {
  doSplit((pane, params) => pane.splitLeft(params));
}

class Activation {
  _subscriptions: CompositeDisposable;

  constructor(state: ?Object) {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-splits:move-tab-to-new-pane-up', splitUp)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-splits:move-tab-to-new-pane-down', splitDown)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-splits:move-tab-to-new-pane-left', splitLeft)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-splits:move-tab-to-new-pane-right', splitRight)
    );
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

var activation: ?Activation = null;

module.exports = {

  activate(state: ?mixed): void {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate(): void {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },
};
