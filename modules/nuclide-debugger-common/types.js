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
  | 'prepack';

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
