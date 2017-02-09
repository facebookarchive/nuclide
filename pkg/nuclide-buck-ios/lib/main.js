/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {BuckBuildSystem} from '../../nuclide-buck/lib/BuckBuildSystem';
import type {Device, PlatformGroup, TaskType} from '../../nuclide-buck/lib/types';
import type {TaskEvent} from '../../commons-node/tasks';
import type {PlatformService} from '../../nuclide-buck/lib/PlatformService';

import {Disposable} from 'atom';
import {Observable} from 'rxjs';
import * as IosSimulator from '../../nuclide-ios-common';
import invariant from 'assert';

let disposable: ?Disposable = null;

export function deactivate(): void {
  if (disposable != null) {
    disposable.dispose();
    disposable = null;
  }
}

export function consumePlatformService(service: PlatformService): void {
  disposable = service.register(provideIosDevices);
}

function provideIosDevices(
  buckRoot: string,
  ruleType: string,
  buildTarget: string,
): Observable<?PlatformGroup> {
  if (ruleType !== 'apple_bundle') {
    return Observable.of(null);
  }
  return IosSimulator.getDevices().map(devices => {
    if (!devices.length) {
      return null;
    }

    return {
      name: 'iOS Simulators',
      platforms: [{
        name: 'iOS Simulators',
        tasks: new Set(['build', 'run', 'test', 'debug']),
        runTask,
        deviceGroups: [
          {
            name: 'iOS Simulators',
            devices: devices.map(device => ({
              name: `${device.name} (${device.os})`,
              udid: device.udid,
            })),
          },
        ],
      }],
    };
  });
}

function runTask(
  builder: BuckBuildSystem,
  taskType: TaskType,
  buildTarget: string,
  device: ?Device,
): Observable<TaskEvent> {
  let subcommand = taskType;
  invariant(device);
  invariant(device.udid);
  invariant(typeof device.udid === 'string');

  if (subcommand === 'run' || subcommand === 'debug') {
    subcommand = 'install';
  }

  return builder.runSubcommand(subcommand, buildTarget, {}, taskType === 'debug', device.udid);
}
