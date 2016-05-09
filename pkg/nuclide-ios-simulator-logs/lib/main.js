'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OutputService} from '../../nuclide-console/lib/types';

import invariant from 'assert';

let activation: ?Object = null;

export function activate(state: ?Object) {
  invariant(activation == null);
  const Activation = require('./Activation');
  activation = new Activation(state);
}

export function deactivate() {
  invariant(activation);
  activation.dispose();
  activation = null;
}

export function consumeOutputService(api: OutputService): IDisposable {
  invariant(activation);
  return activation.consumeOutputService(api);
}
