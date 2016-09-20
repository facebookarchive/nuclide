'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

import invariant from 'assert';
import {
  DebuggerInstance,
  DebuggerProcessInfo,
} from '../../nuclide-debugger-base';
import {NodeDebuggerInstance} from './NodeDebuggerInstance';

export class NodeAttachProcessInfo extends DebuggerProcessInfo {
  pid: number;
  _command: string;

  constructor(pid: number, command: string, targetUri: NuclideUri) {
    super('node', targetUri);

    this.pid = pid;
    this._command = command;
  }

  debug(): Promise<DebuggerInstance> {
    // Enable debugging in the process.
    process.kill(this.pid, 'SIGUSR1');

    // This is the port that the V8 debugger usually listens on.
    // TODO(natthu): Provide a way to override this in the UI.
    const debugPort = 5858;
    const nodeDebuggerInstance = new NodeDebuggerInstance(this, debugPort);
    return Promise.resolve(nodeDebuggerInstance);
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof NodeAttachProcessInfo);
    return this._command === other._command
        ? (this.pid - other.pid)
        : (this._command < other._command) ? -1 : 1;
  }

  displayString(): string {
    return this._command + '(' + this.pid + ')';
  }
}
