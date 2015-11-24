'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {trackOperationTiming} from 'nuclide-analytics';

function trackSplit(
    operation: string,
    splitOperation: (pane: atom$Pane, params?: atom$PaneSplitParams) => atom$Pane) {
  trackOperationTiming(
    'nuclide-move-pane:move-tab-to-new-pane-' + operation,
    () => { doSplit(splitOperation); });
}

function doSplit(
    splitOperation: (pane: atom$Pane, params?: atom$PaneSplitParams) => atom$Pane) {
  const pane = atom.workspace.getActivePane();
  if (pane) {
    // Note that this will (intentionally) create an empty pane if the active
    // pane contains exactly zero or one items.
    // The new empty pane will be kept if the global atom setting
    // 'Destroy Empty Panes' is false, otherwise it will be removed.
    const newPane = splitOperation(pane, {copyActiveItem: false});
    const item = pane.getActiveItem();
    if (item) {
      pane.moveItemToPane(item, newPane, 0);
    }
  }
}

function splitUp() {
  trackSplit('up', (pane, params) => pane.splitUp(params));
}

function splitDown() {
  trackSplit('down', (pane, params) => pane.splitDown(params));
}

function splitRight() {
  trackSplit('right', (pane, params) => pane.splitRight(params));
}

function splitLeft() {
  trackSplit('left', (pane, params) => pane.splitLeft(params));
}

class Activation {
  _subscriptions: CompositeDisposable;

  constructor(state: ?Object) {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-move-pane:move-tab-to-new-pane-up', splitUp)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-move-pane:move-tab-to-new-pane-down', splitDown)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-move-pane:move-tab-to-new-pane-left', splitLeft)
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace',
      'nuclide-move-pane:move-tab-to-new-pane-right', splitRight)
    );
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

let activation: ?Activation = null;

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
