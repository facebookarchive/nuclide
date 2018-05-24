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
import type UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import type {
  Device,
  IProcessConfig,
  VspProcessInfo,
} from 'nuclide-debugger-common';

export type AdbProcessParameters = {
  targetUri: NuclideUri,
  packageName: string,
  device: Device,
  pid?: ?number,
  adbServiceUri?: NuclideUri,
};

export type JavaDebugInfo = {|
  processInfo: VspProcessInfo,
  subscriptions: UniversalDisposable,
|};

export type JavaDebugConfig = {|
  config: IProcessConfig,
  subscriptions: UniversalDisposable,
|};

export type NuclideJavaDebuggerProvider = {|
  createAndroidDebugLaunchConfig(
    parameters: AdbProcessParameters,
  ): Promise<JavaDebugConfig>,
  createAndroidDebugAttachConfig(
    parameters: AdbProcessParameters,
  ): Promise<IProcessConfig>,
  createJavaTestAttachInfo(
    targetUri: string,
    attachPort: number,
  ): Promise<JavaDebugInfo>,
  createJavaLaunchInfo(
    targetUri: string,
    mainClass: string,
    classPath: string,
    runArgs: Array<string>,
  ): Promise<JavaDebugInfo>,
|};
