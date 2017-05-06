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

import {
  DeviceListProvider,
  DeviceInfoProvider,
  DeviceProcessesProvider,
  DeviceActionsProvider,
} from './types';

const deviceListProviders: Set<DeviceListProvider> = new Set();
const deviceInfoProviders: Set<DeviceInfoProvider> = new Set();
const deviceActionsProviders: Set<DeviceActionsProvider> = new Set();
const deviceProcessesProviders: Set<DeviceProcessesProvider> = new Set();

export function getDeviceListProviders(): Set<DeviceListProvider> {
  return deviceListProviders;
}

export function getDeviceInfoProviders(): Set<DeviceInfoProvider> {
  return deviceInfoProviders;
}

export function getDeviceActionsProviders(): Set<DeviceActionsProvider> {
  return deviceActionsProviders;
}

export function getDeviceProcessesProviders(): Set<DeviceProcessesProvider> {
  return deviceProcessesProviders;
}
