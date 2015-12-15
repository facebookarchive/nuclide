'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService} from '../../gadgets-interfaces';

let activation: ?Object = null;

export function activate(state: ?Object) {
  if (activation != null) {
    return;
  }
  const Activation = require('./Activation');
  activation = new Activation(state);
}

export function deactivate() {
  if (activation == null) {
    return;
  }
  activation.dispose();
  activation = null;
}

export function provideGadgetsService(): GadgetsService {
  const createGadgetsService = require('./createGadgetsService');
  return createGadgetsService(() => activation && activation.commands);
}
