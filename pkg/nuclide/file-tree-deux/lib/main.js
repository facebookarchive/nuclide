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
var FileTreeController = require('./FileTreeController');

import type {FileTreeControllerState} from './FileTreeController';

class Activation {
  _fileTreeController: ?FileTreeController;
  _packageState: ?FileTreeControllerState;
  _subscriptions: CompositeDisposable;

  constructor(state: ?FileTreeControllerState) {
    this._packageState = state;
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(
      atom.config.observe('nuclide-file-tree-deux.enabled', () => this._update())
    );
    this._update();
  }

  dispose() {
    this._deactivate();
    this._subscriptions.dispose();
  }

  serialize(): ?FileTreeControllerState {
    if (this._fileTreeController) {
      return this._fileTreeController.serialize();
    }
  }

  // This will activate or deactivate based on the config setting.
  _update() {
    var configEnabled = atom.config.get('nuclide-file-tree-deux.enabled');
    if (configEnabled) {
      this._activate();
    } else {
      this._deactivate();
    }
  }

  _activate() {
    // Guard against activate being called twice
    if (!this._fileTreeController) {
      this._fileTreeController = new FileTreeController(this._packageState);
    }
  }

  _deactivate() {
    // Guard against deactivate being called twice
    if (this._fileTreeController) {
      this._fileTreeController.destroy();
      this._fileTreeController = null;
    }
  }
}

var activation: ?Activation = null;

module.exports = {
  config: {
    enabled: {
      type: 'boolean',
      default: false,
      description: 'Use new File Tree (experimental)',
    },
  },

  activate(state: ?FileTreeControllerState): void {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  serialize(): ?FileTreeControllerState {
    if (activation) {
      return activation.serialize();
    }
  },
};
