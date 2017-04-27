/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {DeviceListProvider, DeviceInfoProvider, DeviceActionsProvider} from './types';

const deviceListProviders: Set<DeviceListProvider> = new Set();
const deviceInfoProviders: Set<DeviceInfoProvider> = new Set();
const deviceActionsProviders: Set<DeviceActionsProvider> = new Set();

export function getDeviceListProviders(): Set<DeviceListProvider> {
  return deviceListProviders;
}

export function getDeviceInfoProviders(): Set<DeviceInfoProvider> {
  return deviceInfoProviders;
}

export function getDeviceActionsProviders(): Set<DeviceActionsProvider> {
  return deviceActionsProviders;
}
