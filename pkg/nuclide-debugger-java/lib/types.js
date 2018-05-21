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
import type {VspProcessInfo} from 'nuclide-debugger-common';
import type {Device} from 'nuclide-debugger-common/types';

export type AdbProcessParameters = {
  targetUri: NuclideUri,
  packageName: string,
  activity?: ?string,
  action?: ?string,
  device: Device,
  adbServiceUri?: NuclideUri,
  pid?: ?number,
  debugServerPort?: ?number,
  service?: ?string,
};

export type JavaDebugInfo = {|
  processInfo: VspProcessInfo,
  subscriptions: UniversalDisposable,
|};

export type NuclideJavaDebuggerProvider = {|
  createAndroidDebugInfo(
    parameters: AdbProcessParameters,
  ): Promise<JavaDebugInfo>,
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
