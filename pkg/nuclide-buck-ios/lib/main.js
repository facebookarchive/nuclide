/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {BuckBuildSystem} from '../../nuclide-buck/lib/BuckBuildSystem';
import type {
  Device,
  PlatformGroup,
  TaskType,
} from '../../nuclide-buck/lib/types';
import type {TaskEvent} from '../../commons-node/tasks';
import type {PlatformService} from '../../nuclide-buck/lib/PlatformService';
import type {ResolvedBuildTarget} from '../../nuclide-buck-rpc/lib/BuckService';

import nuclideUri from '../../commons-node/nuclideUri';
import {Disposable} from 'atom';
import {Observable} from 'rxjs';
import * as IosSimulator from '../../nuclide-ios-common';
import invariant from 'assert';

let disposable: ?Disposable = null;

const RUNNABLE_RULE_TYPES = new Set(['apple_bundle']);

const SUPPORTED_RULE_TYPES = new Set([...RUNNABLE_RULE_TYPES, 'apple_test']);

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
  buckRoot: NuclideUri,
  ruleType: string,
  buildTarget: string,
): Observable<?PlatformGroup> {
  if (!SUPPORTED_RULE_TYPES.has(ruleType)) {
    return Observable.of(null);
  }

  return IosSimulator.getFbsimctlSimulators().map(simulators => {
    if (!simulators.length) {
      return null;
    }

    return {
      name: 'iOS Simulators',
      platforms: [
        {
          name: 'iOS Simulators',
          tasks: getTasks(buckRoot, ruleType),
          runTask: (builder, taskType, target, device) =>
            _runTask(buckRoot, builder, taskType, ruleType, target, device),
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
        },
      ],
    };
  });
}

function getTasks(buckRoot: NuclideUri, ruleType: string): Set<TaskType> {
  const tasks = new Set(
    nuclideUri.isRemote(buckRoot) ? ['build'] : ['build', 'test', 'debug'],
  );
  if (RUNNABLE_RULE_TYPES.has(ruleType)) {
    tasks.add('run');
  }
  return tasks;
}

function _runTask(
  buckRoot: NuclideUri,
  builder: BuckBuildSystem,
  taskType: TaskType,
  ruleType: string,
  buildTarget: ResolvedBuildTarget,
  device: ?Device,
): Observable<TaskEvent> {
  invariant(device);
  invariant(device.arch);
  invariant(device.udid);
  const udid = device.udid;
  const arch = device.arch;
  invariant(typeof arch === 'string');
  invariant(typeof udid === 'string');

  const flavor = `iphonesimulator-${arch}`;
  const newTarget = {
    ...buildTarget,
    flavors: buildTarget.flavors.concat([flavor]),
  };

  if (nuclideUri.isRemote(buckRoot)) {
    let runRemoteTask;
    try {
      const remoteWorkflow = require('./fb-RemoteWorkflow');
      runRemoteTask = () => {
        return remoteWorkflow.runRemoteTask(
          buckRoot,
          builder,
          taskType,
          ruleType,
          buildTarget,
          udid,
          flavor,
        );
      };
    } catch (_) {
      runRemoteTask = () => {
        throw new Error(
          'Remote workflow currently unsupported for this target.',
        );
      };
    }

    return runRemoteTask();
  } else {
    return builder.runSubcommand(
      _getLocalSubcommand(taskType, ruleType),
      newTarget,
      {},
      taskType === 'debug',
      udid,
    );
  }
}

function _getLocalSubcommand(taskType: TaskType, ruleType: string) {
  if (taskType !== 'run' && taskType !== 'debug') {
    return taskType;
  }
  switch (ruleType) {
    case 'apple_bundle':
      return 'install';
    case 'apple_test':
      return 'test';
    default:
      throw new Error('Unsupported rule type');
  }
}
