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

// Describes options for hosting a particular VSP adapter via the cli
export interface DebugAdapter {
  // the adapter's key in Nuclide's set of adapters
  +key: VsAdapterType;
  // the debugger's type in the adapter package.json
  +type: string;
  // options which the adapter supports but which could be harmful if used from
  // the command line
  +excludedOptions: Set<string>;
  // The set of file extensions which the debugger should map to this adapter
  +extensions: Set<string>;
  // Arguments which require special parsing by the adapter implementation
  +customArguments: Map<string, CustomArgumentType>;
  // output event categories which should not be echoed to the console
  +muteOutputCategories: Set<string>;
  // if not null, the thread which should be used for user-initiated pause
  // if null, the first enumerated thread from the target process will be used
  +asyncStopThread: ?number;
  // whether or not the adapter handles interpreted code blocks via evaluation
  +supportsCodeBlocks: boolean;
  transformLaunchArguments(
    args: ?LaunchRequestArguments,
  ): LaunchRequestArguments;
  transformAttachArguments(
    args: ?AttachRequestArguments,
  ): AttachRequestArguments;
  parseArguments(args: Arguments): Map<string, any>;
}
