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
  | 'react_native';
