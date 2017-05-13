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
  DeviceTasksProvider,
} from './types';

const deviceListProviders: Set<DeviceListProvider> = new Set();
const deviceInfoProviders: Set<DeviceInfoProvider> = new Set();
const deviceTasksProviders: Set<DeviceTasksProvider> = new Set();
const deviceProcessesProviders: Set<DeviceProcessesProvider> = new Set();

export function getDeviceListProviders(): Set<DeviceListProvider> {
  return deviceListProviders;
}

export function getDeviceInfoProviders(): Set<DeviceInfoProvider> {
  return deviceInfoProviders;
}

export function getDeviceTasksProviders(): Set<DeviceTasksProvider> {
  return deviceTasksProviders;
}

export function getDeviceProcessesProviders(): Set<DeviceProcessesProvider> {
  return deviceProcessesProviders;
}
