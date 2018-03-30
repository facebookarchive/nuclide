/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type RemoteControlService from '../nuclide-debugger-new/lib/RemoteControlService';

import consumeFirstProvider from './consumeFirstProvider';

export function getDebuggerService(): Promise<RemoteControlService> {
  return consumeFirstProvider('nuclide-debugger.remote');
}
