/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Platform} from '../../nuclide-buck/lib/types';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {BuckEvent} from '../../nuclide-buck/lib/BuckEventStream';
import type {Device} from '../../nuclide-fbsimctl-rpc/lib/types';

import {getTasks, runTask} from './Tasks';

import {Observable} from 'rxjs';
import * as fbsimctl from '../../nuclide-fbsimctl';

export function getSimulatorPlatform(
  buckRoot: NuclideUri,
  ruleType: string,
  debuggerCallback: ?(
    Observable<LegacyProcessMessage>,
  ) => Observable<BuckEvent>,
): Observable<Platform> {
  return fbsimctl.getDevices().map(devices => {
    let simulators;
    if (devices instanceof Error) {
      // TODO: Come up with a way to surface the error in UI
      simulators = [];
    } else {
      simulators = devices.filter(device => device.type === 'simulator');
    }
    let deviceGroups;
    if (simulators.length === 0) {
      deviceGroups = BUILD_ONLY_SIMULATOR_GROUPS;
    } else {
      deviceGroups = Array.from(groupByOs(simulators).entries()).map(
        ([os, simsForOs]) => ({
          name: os,
          devices: simsForOs.map(simulator => ({
            name: simulator.name,
            udid: simulator.udid,
            arch: simulator.arch,
            type: 'simulator',
          })),
        }),
      );
    }

    return {
      isMobile: true,
      name: 'Simulator',
      tasksForDevice: device =>
        getTasks(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) =>
        runTask(
          builder,
          taskType,
          ruleType,
          target,
          settings,
          device,
          buckRoot,
          debuggerCallback,
        ),
      deviceGroups,
    };
  });
}

export function getDevicePlatform(
  buckRoot: NuclideUri,
  ruleType: string,
  debuggerCallback: ?(
    Observable<LegacyProcessMessage>,
  ) => Observable<BuckEvent>,
): Observable<Platform> {
  return fbsimctl.getDevices().map(devices => {
    let deviceGroups = [];

    if (devices instanceof Array) {
      const physicalDevices = devices.filter(
        device => device.type === 'physical_device',
      );

      if (physicalDevices.length > 0) {
        deviceGroups = Array.from(groupByOs(physicalDevices).entries()).map(
          ([os, devicesForOs]) => ({
            name: os,
            devices: devicesForOs.map(device => ({
              name: device.name,
              udid: device.udid,
              arch: device.arch,
              type: 'device',
            })),
          }),
        );
      }
    }

    deviceGroups.push(BUILD_ONLY_DEVICES_GROUP);

    return {
      isMobile: true,
      name: 'Device',
      tasksForDevice: device =>
        getTasks(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) =>
        runTask(
          builder,
          taskType,
          ruleType,
          target,
          settings,
          device,
          buckRoot,
          debuggerCallback,
        ),
      deviceGroups,
    };
  });
}

function groupByOs(devices: Array<Device>): Map<string, Array<Device>> {
  const devicesByOs = devices.reduce((memo, device) => {
    let devicesForOs = memo.get(device.os);
    if (devicesForOs == null) {
      devicesForOs = [];
      memo.set(device.os, devicesForOs);
    }
    devicesForOs.push(device);
    return memo;
  }, new Map());

  for (const devicesForOs of devicesByOs.values()) {
    devicesForOs.sort((a, b) => {
      return b.name.localeCompare(a.name);
    });
  }

  return devicesByOs;
}

const BUILD_ONLY_SIMULATOR_GROUPS = [
  {
    name: 'Generic',
    devices: [
      {
        name: '64-bit',
        udid: '',
        arch: 'x86_64',
        type: 'simulator',
        buildOnly: true,
      },
      {
        name: '32-bit',
        udid: '',
        arch: 'i386',
        type: 'simulator',
        buildOnly: true,
      },
    ],
  },
];

const BUILD_ONLY_DEVICES_GROUP = {
  name: 'Generic',
  devices: [
    {
      name: '64-bit',
      udid: '',
      arch: 'arm64',
      type: 'device',
      buildOnly: true,
    },
    {
      name: '32-bit',
      udid: '',
      arch: 'armv7',
      type: 'device',
      buildOnly: true,
    },
  ],
};
