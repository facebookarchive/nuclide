/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type Breakpoint = {
  file: string,
  line: number,
};

export type Message = {
  method: string,
};

export type DebuggerEventExit = {
  event: 'exit',
};

export type DebuggerEventLog = {
  event: 'log',
  message: string,
};

export type DebuggerEventConnected = {
  event: 'connected',
};

export type DebuggerEventStart = {
  event: 'start',
};

export type DebuggerEventStop = {
  event: 'stop',
  file: string,
  line: number,
};

export type DebuggerEvent =
  DebuggerEventExit |
  DebuggerEventLog |
  DebuggerEventConnected |
  DebuggerEventStart |
  DebuggerEventStop;
