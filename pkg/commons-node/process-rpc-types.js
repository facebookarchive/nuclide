/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

// Exactly one of exitCode and signal will be non-null.
// Killing a process will result in a null exitCode but a non-null signal.
export type ProcessExitMessage = {
  kind: 'exit',
  exitCode: ?number,
  signal: ?string,
};

// Separated out for RPC usage.
export type ProcessMessage =
  | {
      kind: 'stdout',
      data: string,
    }
  | {
      kind: 'stderr',
      data: string,
    }
  | ProcessExitMessage;

// In older versions of process.js, errors were emitted as messages instead of errors. This type
// exists to support the transition, but no new usages should be added.
export type LegacyProcessMessage = ProcessMessage | {kind: 'error', error: Object};

export type ProcessInfo = {
  parentPid: number,
  pid: number,
  command: string,
};
