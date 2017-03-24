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
import type {Task} from '../../commons-node/tasks';
import type {Action} from './redux/Actions';
import type {PlatformService} from './PlatformService';
import type {Observable} from 'rxjs';
import type {TaskEvent} from '../../commons-node/tasks';
import type {BuckBuildSystem} from '../../nuclide-buck/lib/BuckBuildSystem';
import type {
  ResolvedBuildTarget,
  ResolvedRuleType,
} from '../../nuclide-buck-rpc/lib/BuckService';

export type TaskType = 'build' | 'run' | 'test' | 'debug';

export type BuckSubcommand = 'build' | 'run' | 'install' | 'test';

export type TaskSettings = {
  arguments?: Array<string>,
  runArguments?: Array<string>,
};

export type AppState = {
  platformGroups: Array<PlatformGroup>,
  platformService: PlatformService,
  projectRoot: ?string,
  buckRoot: ?string,
  isLoadingBuckProject: boolean,
  isLoadingRule: boolean,
  isLoadingPlatforms: boolean,
  buildTarget: string,
  buildRuleType: ?ResolvedRuleType,
  selectedDeploymentTarget: ?DeploymentTarget,
  taskSettings: TaskSettings,

  lastSessionPlatformName: ?string,
  lastSessionDeviceName: ?string,
};

export type Store = {
  dispatch(action: Action): void,
  getState(): AppState,
};

export type SerializedState = {
  buildTarget: ?string,
  taskSettings?: ?TaskSettings,
  selectedPlatformName: ?string,
  selectedDeviceName: ?string,
};

export type BuildArtifactTask = Task & {
  getPathToBuildArtifact(): NuclideUri,
};

export type BuckBuilder = {
  build(opts: BuckBuilderBuildOptions): BuildArtifactTask,
};

export type BuckBuilderBuildOptions = {
  root: NuclideUri,
  target: ResolvedBuildTarget,
  args?: Array<string>,
};

export type PlatformGroup = {
  name: string,
  platforms: Array<Platform>,
};

export type Platform = {
  name: string,
  tasks: Set<TaskType>,
  runTask: (
    builder: BuckBuildSystem,
    type: TaskType,
    buildTarget: ResolvedBuildTarget,
    device: ?Device,
  ) => Observable<TaskEvent>,
  deviceGroups: Array<DeviceGroup>,
};

export type DeviceGroup = {
  name: ?string,
  devices: Array<Device>,
};

export type Device = {
  name: string,
};

export type DeploymentTarget = {
  platform: Platform,
  device: ?Device,
};
