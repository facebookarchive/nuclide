/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  NuclideDebuggerProvider,
} from '../../nuclide-debugger-interfaces/service';

import DebuggerProvider from './DebuggerProvider';

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return DebuggerProvider;
}
