'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* FLOW STATUS */

// Types for the old `flow status` output -- v0.22 and below

export type OldFlowStatusOutput = {
  passed: boolean;
  // This is not actually the Flow version; instead it is a build ID or something.
  version?: string;
  errors: Array<OldFlowStatusError>;
};

export type OldFlowStatusError = {
  kind: string;
  operation?: OldFlowStatusErrorOperation;
  message: Array<OldFlowStatusErrorMessageComponent>;
};

export type OldBaseFlowStatusErrorMessageComponent = {
  // If there is no path component, this is the empty string. We should make it null instead, in
  // that case (t8644340)
  path: string;
  descr: string;
  line: number;
  start: number;
  end: number;
  endline: number;
};

export type OldFlowStatusErrorMessageComponent = OldBaseFlowStatusErrorMessageComponent & {
  level: 'error' | 'warning';
};

// Same as FlowStatusErrorMessageComponent, except without the 'level' field.
export type OldFlowStatusErrorOperation = OldBaseFlowStatusErrorMessageComponent;

// New types for `flow status` v0.23.0 (or possibly v0.24.0, it has yet to be finalized)

export type NewFlowStatusOutput = {
  passed: boolean;
  flowVersion: string;
  errors: Array<NewFlowStatusError>;
};

export type NewFlowStatusError = {
  level: 'error' | 'warning';
  // e.g. parse, infer, maybe others?
  kind: string;
  message: Array<NewFlowStatusErrorMessageComponent>;
  operation?: NewFlowStatusErrorMessageComponent;
  extra?: Array<{
    message: Array<NewFlowStatusErrorMessageComponent>;
  }>;
};

export type NewFlowStatusErrorMessageComponent = {
  descr: string;
  loc?: FlowLoc;
  // The old path, line, etc. fields also currently exist here, but they are deprecated in favor of
  // `loc`.
};

export type FlowLoc = {
  // file path
  source: string;
  start: FlowPoint;
  end: FlowPoint;
};

export type FlowLocNoSource = {
  start: FlowPoint;
  end: FlowPoint;
};

export type FlowPoint = {
  column: number;
  line: number;
};
