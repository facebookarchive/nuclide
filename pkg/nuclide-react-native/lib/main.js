'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {nuclide_debugger$Service} from '../../nuclide-debugger-interfaces/service';
import type {Activation as ActivationType} from './Activation';

import invariant from 'assert';

let activation: ?ActivationType = null;

export function activate(state: ?Object): void {
  invariant(activation == null);
  const {Activation} = require('./Activation');
  activation = new Activation(state);
}

export function deactivate(): void {
  invariant(activation != null);
  activation.dispose();
  activation = null;
}

export function provideNuclideDebugger(): nuclide_debugger$Service {
  invariant(activation != null);
  return activation.provideNuclideDebugger();
}
