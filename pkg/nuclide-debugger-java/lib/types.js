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

import type UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import type {VspProcessInfo} from 'nuclide-debugger-common';

export type JavaDebugInfo = {|
  processInfo: VspProcessInfo,
  subscriptions: UniversalDisposable,
|};

export type NuclideJavaDebuggerProvider = {|
  createJavaLaunchInfo(
    targetUri: string,
    mainClass: string,
    classPath: string,
    runArgs: Array<string>,
  ): Promise<JavaDebugInfo>,
|};
