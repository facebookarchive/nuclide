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

import pty_types from './gen-nodejs/pty_types';

/**
 * This interface should always match pty.thrift
 * TODO autogenerate this from pty.thrift
 */

export type SpawnArguments = {
  command: string,
  commandArgs: Array<string>,
  envPatches: Object,
  cwd: string,
  name: string,
  cols: number,
  rows: number,
};

export interface ThriftPtyClient {
  dispose(): Promise<void>;
  poll(timeoutSec: number): Promise<pty_types.PollEvent>;
  resize(columns: number, rows: number): Promise<void>;
  setEncoding(encoding: string): Promise<void>;
  spawn(spawnArguments: SpawnArguments, initialCommand: ?string): Promise<void>;
  writeInput(data: string): Promise<void>;
}
