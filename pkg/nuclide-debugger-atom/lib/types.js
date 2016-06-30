'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Rx from 'rxjs';

/* Evaluation & values */
export type EvaluationResult = {
  _type: string;
  // Either:
  value?: string;
  // Or:
  _description? : string;
  _objectId?: string;
};

export type ExpansionResult = Array<{
  name: string;
  value: EvaluationResult;
}>;

export type Expression = string;
export type WatchExpression = {
  expression: Expression;
  value: Rx.Observable<?EvaluationResult>;
};
export type WatchExpressionList = Array<WatchExpression>;

export type Local = {
  name: string;
  value: EvaluationResult;
};
export type Locals = Array<Local>;

/* Breakpoints */
export type FileLineBreakpoint = {
  path: string;
  line: number;
  enabled: boolean;
  resolved: boolean;
};
export type FileLineBreakpoints = Array<FileLineBreakpoint>;

export type SerializedBreakpoint = {
  line: number;
  sourceURL: string;
};

/* Callstack */
type CallstackItem = {
  name: string;
  location: {
    path: string;
    line: number;
    column?: number;
  };
};
export type Callstack = Array<CallstackItem>;

/* Debugger mode */
export type DebuggerModeType = 'starting' | 'running' | 'paused' | 'stopping' | 'stopped';
