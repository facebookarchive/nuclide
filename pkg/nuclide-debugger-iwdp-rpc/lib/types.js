/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type IosDeviceInfo = {
  devtoolsFrontendUrl: string,
  faviconUrl: string,
  thumbnailUrl: string,
  title: string,
  url: string,
  webSocketDebuggerUrl: string,
  appId: string,
};

export type RuntimeStatus = 'RUNNING' | 'PAUSED';
export type BreakpointId = string;
export type BreakpointParams = {
  lineNumber: number,
  url: string,
  columnNumber: number,
  condition: string,
};
export type PauseOnExceptionState = 'none' | 'uncaught' | 'all';
