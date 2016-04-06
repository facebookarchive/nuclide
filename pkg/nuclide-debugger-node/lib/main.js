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

export function activate(state: mixed): void {
}

export function provideNuclideDebuggerNode(): nuclide_debugger$Service {
  const Service = require('./Service');
  return Service;
}
