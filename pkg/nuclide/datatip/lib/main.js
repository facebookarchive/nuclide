'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DatatipManager} from './DatatipManager';

let manager: ?DatatipManager = null;

export function activate(state: ?any): void {
  if (manager == null) {
    manager = new DatatipManager();
  }
}

export function deactivate() {
  if (manager != null) {
    manager.dispose();
    manager = null;
  }
}
