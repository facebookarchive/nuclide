/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Transport} from './Proxy';
import {Proxy} from './Proxy';

export async function createTunnel(
  localPort: number,
  remotePort: number,
  transport: Transport,
): Promise<Proxy> {
  return Proxy.createProxy(localPort, remotePort, transport);
}
