'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type GadgetsService from './GadgetsService';

export type {
  Gadget,
  GadgetLocation,
  GadgetsService,
} from './types';

import invariant from 'assert';

let activation: ?Object = null;

export function activate(state: ?Object): void {
  invariant(activation == null);
  const Activation = require('./Activation');
  activation = new Activation(state);
}

export function deactivate(): void {
  invariant(activation);
  activation.deactivate();
  activation = null;
}

export function provideGadgetsService(): GadgetsService {
  invariant(activation);
  return activation.provideGadgetsService();
}
