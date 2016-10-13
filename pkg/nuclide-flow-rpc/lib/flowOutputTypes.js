/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* FLOW STATUS */

export type FlowStatusOutput = {
  passed: boolean,
  flowVersion: string,
  errors: Array<FlowStatusError>,
};

export type FlowStatusError = {
  level: 'error' | 'warning',
  // e.g. parse, infer, maybe others?
  kind: string,
  message: Array<FlowStatusErrorMessageComponent>,
  operation?: FlowStatusErrorMessageComponent,
  extra?: Array<{
    message: Array<FlowStatusErrorMessageComponent>,
  }>,
};

export type FlowStatusErrorMessageComponent = {
  descr: string,
  loc?: FlowLoc,
  // The old path, line, etc. fields also currently exist here, but they are deprecated in favor of
  // `loc`.
};

export type FlowLoc = {
  // file path
  source: string,
  start: FlowPoint,
  end: FlowPoint,
};

export type FlowLocNoSource = {
  start: FlowPoint,
  end: FlowPoint,
};

export type FlowPoint = {
  column: number,
  line: number,
};
