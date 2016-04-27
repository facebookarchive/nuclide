'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ActivationType from './Activation';

import invariant from 'assert';

let activation: ?ActivationType = null;

export function activate(state: ?Object) {
  invariant(activation == null);
  const Activation = require('./Activation');
  activation = new Activation(state);
}

export function deactivate(): void {
  invariant(activation);
  activation.dispose();
  activation = null;
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  invariant(activation);
  activation.consumeToolBar(getToolBar);
}

export function serialize(): Object {
  invariant(activation);
  return activation.serialize();
}
