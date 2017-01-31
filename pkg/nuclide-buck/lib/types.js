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

export type TaskType = 'build' | 'test' | 'run' | 'debug';

export type BuckSubcommand = 'build' | 'install' | 'test';

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
  buildRuleType: ?string,
  selectedDeploymentTarget: ?DeploymentTarget,
  taskSettings: TaskSettings,
};

export type Store = {
  dispatch(action: Action): void,
  getState(): AppState,
};

export type SerializedState = {
  buildTarget: ?string,
  taskSettings?: ?TaskSettings,
  selectedDeploymentTarget: ?DeploymentTarget,
};

export type BuildArtifactTask = Task & {
  getPathToBuildArtifact(): NuclideUri,
};

export type BuckBuilder = {
  build(opts: BuckBuilderBuildOptions): BuildArtifactTask,
};

export type BuckBuilderBuildOptions = {
  root: NuclideUri,
  target: string,
};

export type PlatformGroup = {
  name: string,
  platforms: Array<Platform>,
};

export type Platform = {
  name: string,
  flavor: string,
  devices: Array<Device>,
};

export type Device = {
  name: string,
  udid: string,
};

export type DeploymentTarget = {
  platform: Platform,
  device: ?Device,
};
