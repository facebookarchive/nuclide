'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeController = require('./FileTreeController');

import type {FileTreeControllerState} from './FileTreeController';

var fileTreeController: ?FileTreeController;

module.exports = {
  activate(state: ?FileTreeControllerState): void {
    // Guard against activate getting called twice
    if (fileTreeController) {
      return;
    }
    fileTreeController = new FileTreeController(state);
  },

  deactivate(): void {
    if (fileTreeController) {
      fileTreeController.destroy();
      fileTreeController = null;
    }
  },

  serialize(): ?FileTreeControllerState {
    if (fileTreeController) {
      return fileTreeController.serialize();
    }
  },
};
