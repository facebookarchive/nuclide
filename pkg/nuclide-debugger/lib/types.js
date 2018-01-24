/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type {RemoteObjectId} from 'nuclide-debugger-common/protocol-types';
import type {ThreadColumn} from 'nuclide-debugger-common';
// eslint-disable-next-line rulesdir/import-type-style
import type {EvaluationResult as EvaluationResult_} from 'nuclide-commons-ui/TextRenderer';
// eslint-disable-next-line rulesdir/import-type-style
import type {ExpansionResult as ExpansionResult_} from 'nuclide-commons-ui/LazyNestedValueComponent';

export type DebuggerSettings = {
  supportThreadsWindow: boolean,
  singleThreadStepping: boolean,
  customThreadColumns: Array<ThreadColumn>,
  threadsComponentTitle: string,
};

export type EvaluationResult = EvaluationResult_;
export type ExpansionResult = ExpansionResult_;

export type ScopeSectionPayload = {
  name: string,
  scopeObjectId: RemoteObjectId,
};

export type ScopeSection = ScopeSectionPayload & {
  expanded: boolean,
  loaded: boolean,
  scopeVariables: ExpansionResult,
};

export type Expression = string;
export type EvaluatedExpression = {
  expression: Expression,
  value: Observable<?EvaluationResult>,
};
export type EvaluatedExpressionList = Array<EvaluatedExpression>;
export type EvalCommand =
  | 'evaluateOnSelectedCallFrame'
  | 'getProperties'
  | 'runtimeEvaluate'
  | 'setVariable';
export type ExpressionResult = ChromeProtocolResponse & {
  expression: string,
};

export type GetPropertiesResult = ChromeProtocolResponse & {
  objectId: string,
};

export type ChromeProtocolResponse = {
  result: ?EvaluationResult | ?GetPropertiesResult,
  error: ?Object,
};

/* Breakpoints */
export type FileLineBreakpoint = {
  id: number,
  path: string,
  line: number,
  condition: string,
  enabled: boolean,
  resolved: boolean,
  hitCount?: number,
};
export type FileLineBreakpoints = Array<FileLineBreakpoint>;

export type IPCEvent = {
  channel: string,
  args: any[],
};

// TODO: handle non file line breakpoints.
export type IPCBreakpoint = {
  sourceURL: string,
  lineNumber: number,
  condition: string,
  enabled: boolean,
  resolved: boolean,
};

export type BreakpointUserChangeArgType = {
  action: string,
  breakpoint: FileLineBreakpoint,
};

export type SerializedWatchExpression = string;

export type SerializedBreakpoint = {
  line: number,
  sourceURL: string,
  disabled: ?boolean,
  condition: ?string,
};

/* Callstack */
export type CallstackItem = {
  name: string,
  location: {
    path: string,
    line: number,
    column?: number,
    hasSource?: boolean,
  },
  disassembly?: FrameDissassembly,
  registers?: RegisterInfo,
};

export type Callstack = Array<CallstackItem>;

/* ThreadStore Types */
export type ThreadItem = {
  id: string,
  name: string,
  address: string,
  location: {
    scriptId: string,
    lineNumber: number,
    columnNumber: number,
  },
  stopReason: string,
  description: string,
};

export type NuclideThreadData = {
  threads: Array<ThreadItem>,
  owningProcessId: number,
  stopThreadId: number,
  selectedThreadId: number,
};

export type ThreadSwitchMessageData = {
  sourceURL: string,
  lineNumber: number,
  message: string,
};

/* Debugger mode */
export type DebuggerModeType =
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped';

export type ObjectGroup = 'watch-group' | 'console';

/* disassembly info */
export type FrameDissassembly = {
  frameTitle: string,
  metadata: Array<{name: string, value: string}>,
  currentInstructionIndex: number,
  instructions: Array<{
    address: string,
    instruction: string,
    offset?: string,
    comment?: string,
  }>,
};

/* Register info */
export type RegisterInfo = Array<{
  groupName: string,
  registers: Array<{name: string, value: string}>,
}>;
