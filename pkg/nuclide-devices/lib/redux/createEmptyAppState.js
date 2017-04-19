/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {AppState, DeviceFetcher, DeviceInfoProvider} from '../types';

export function createEmptyAppState(
  deviceFetchers: Set<DeviceFetcher>,
  deviceInfoProviders: Set<DeviceInfoProvider>,
): AppState {
  return {
    hosts: ['local'],
    host: 'local',
    devices: [],
    deviceType: null,
    device: null,
    infoTables: new Map(),
    deviceFetchers,
    deviceInfoProviders,
  };
}
