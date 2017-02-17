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
import type {ResolvedBuildTarget} from '../../nuclide-buck-rpc/lib/BuckService';

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
  return IosSimulator.getFbsimctlSimulators().map(simulators => {
    if (!simulators.length) {
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
            devices: simulators.map(simulator => ({
              name: `${simulator.name} (${simulator.os})`,
              udid: simulator.udid,
              arch: simulator.arch,
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
  buildTarget: ResolvedBuildTarget,
  device: ?Device,
): Observable<TaskEvent> {
  let subcommand = taskType;
  invariant(device);
  invariant(device.arch);
  invariant(device.udid);
  const udid = device.udid;
  const arch = device.arch;
  invariant(typeof arch === 'string');
  invariant(typeof udid === 'string');

  const flavor = `iphonesimulator-${arch}`;
  const newTarget = {...buildTarget, flavors: buildTarget.flavors.concat([flavor])};

  if (subcommand === 'run' || subcommand === 'debug') {
    subcommand = 'install';
  }

  return builder.runSubcommand(subcommand, newTarget, {}, taskType === 'debug', udid);
}
