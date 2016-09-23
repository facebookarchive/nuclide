'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NuclideDebuggerProvider,
} from '../../nuclide-debugger-interfaces/service';

import logger from './utils';
import {getConfig} from './utils';
import DebuggerProvider from './DebuggerProvider';

export function activate(state: mixed): void {
  logger.setLogLevel(getConfig().clientLogLevel);
}

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return DebuggerProvider;
}
