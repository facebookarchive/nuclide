/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DebuggerConfig} from 'big-dig-vscode-server/Protocol';
import type {DebugConfiguration} from 'vscode';

export type DebugConfigurationWithBigDig = DebugConfiguration & {
  hostname: string,
  bigdig: DebuggerConfig,
};

export type LaunchAttributes = {
  program: string,
  args: Array<string>,
  cwd: string,
};
