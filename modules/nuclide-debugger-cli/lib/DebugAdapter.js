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

import type {
  LaunchRequestArguments,
  AttachRequestArguments,
} from 'vscode-debugprotocol';
import type {Arguments} from './DebuggerAdapterFactory';
import type {CustomArgumentType} from './VSPOptionsParser';
import type {VsAdapterType} from 'nuclide-debugger-common';

export interface DebugAdapter {
  +key: VsAdapterType;
  +type: string;
  +excludedOptions: Set<string>;
  +extensions: Set<string>;
  +customArguments: Map<string, CustomArgumentType>;
  +muteOutputCategories: Set<string>;
  transformLaunchArguments(
    args: ?LaunchRequestArguments,
  ): LaunchRequestArguments;
  transformAttachArguments(
    args: ?AttachRequestArguments,
  ): AttachRequestArguments;
  parseArguments(args: Arguments): Map<string, any>;
}
