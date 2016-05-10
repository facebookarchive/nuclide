'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {DatatipManager} from './DatatipManager';

let datatipManager: ?DatatipManager = null;

export function activate(state: ?any): void {
  if (datatipManager == null) {
    datatipManager = new DatatipManager();
  }
}

export function provideDatatipService(): DatatipManager {
  invariant(datatipManager);
  return datatipManager;
}

export function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}
