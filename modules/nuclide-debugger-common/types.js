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

import type DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {IconName} from 'nuclide-commons-ui/Icon';

export type AtomNotificationType = 'info' | 'warning' | 'error' | 'fatalError';
export type AtomNotification = {
  type: AtomNotificationType,
  message: string,
};

export type DebuggerConfigAction = 'launch' | 'attach';

export type VSAdapterExecutableInfo = {
  command: string,
  args: Array<string>,
};

export type VsAdapterType =
  | 'hhvm'
  | 'python'
  | 'node'
  | 'java'
  | 'react_native'
  | 'prepack'
  | 'ocaml';

export type UserOutputLevel =
  | 'debug'
  | 'info'
  | 'warning'
  | 'log'
  | 'error'
  | 'success';

export type UserOutput = {
  level: UserOutputLevel,
  text: string,
};

export type NuclideEvaluationExpression = {
  range: atom$Range,
  expression: string,
};

export type NuclideDebuggerProvider = {
  name: string,
  getLaunchAttachProvider(
    connection: NuclideUri,
  ): ?DebuggerLaunchAttachProvider,
};

export type NuclideEvaluationExpressionProvider = {
  name: string,
  // A comma-separated list of Atom grammars understood by the provider, e.g. 'source.js.jsx'
  selector: string,
  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression>,
};

export type ControlButtonSpecification = {
  icon: IconName,
  title?: string,
  onClick: () => mixed,
};

// Copied from nuclide-ui/Table.js because the RPC framework doesn't play well with type imports.
export type ThreadColumn = {
  title: string,
  key: 'id' | 'name' | 'address' | 'location' | 'stopReason' | 'description',
  // Percentage. The `width`s of all columns must add up to 1.
  width?: number,
  // Optional React component for rendering cell contents.
  // The component receives the cell value via `props.data`.
  component?: any,
  shouldRightAlign?: boolean,
  cellClassName?: string,
  minWidth?: number,
};

// Indicates which of various optional features that this debugger supports.
export type DebuggerCapabilities = {
  +conditionalBreakpoints: boolean,
  +continueToLocation: boolean,
  +customSourcePaths: boolean,
  +disassembly: boolean,
  +readOnlyTarget: boolean,
  +registers: boolean,
  +setVariable: boolean,
  +singleThreadStepping: boolean,
  +threads: boolean,
  +completionsRequest: boolean,
};

// Describes how to configure various properties that individual debuggers
// are allowed to override.
export type DebuggerProperties = {
  +customControlButtons: Array<ControlButtonSpecification>,
  +targetDescription: () => ?string,
  +threadColumns: ?Array<ThreadColumn>,
  +threadsComponentTitle: string,
};
