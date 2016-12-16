/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type DeviceInfo = {
  webSocketDebuggerUrl: string,
  title: string,
};

export type IosDeviceInfo = DeviceInfo & {
  devtoolsFrontendUrl: string,
  faviconUrl: string,
  thumbnailUrl: string,
  url: string,
  appId: string,
};

export type PackagerDeviceInfo = DeviceInfo & {
  id: string,
  description: string,
  devtoolsFrontendUrl: string,
  deviceId: string,
  deviceName: string,
};

export type RuntimeStatus = 'RUNNING' | 'PAUSED';
export type BreakpointId = string;
export type BreakpointParams = {
  lineNumber: number,
  url: string,
  columnNumber: number,
  condition: string,
};
export type Breakpoint = {
  nuclideId: string,
  jscId: ?string,
  resolved: boolean,
  params: BreakpointParams,
};
export type PauseOnExceptionState = 'none' | 'uncaught' | 'all';

export type TargetEnvironment = 'iOS' | 'Android';
