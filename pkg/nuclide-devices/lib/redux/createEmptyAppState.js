/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {AppState, DeviceFetcher} from '../types';

export function createEmptyAppState(deviceFetchers: Set<DeviceFetcher>): AppState {
  return {
    hosts: ['local'],
    host: 'local',
    devices: new Map(),
    deviceType: null,
    device: null,
    deviceFetchers,
  };
}
