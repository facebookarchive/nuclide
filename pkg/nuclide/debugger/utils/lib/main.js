'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {
  nuclide_debugger$DebuggerInstance,
  nuclide_debugger$DebuggerProcessInfo,
} from '../../interfaces/service';

export class DebuggerProcess {
  dispose(): void {
    throw new Error('abstract method');
  }

  getWebsocketAddress(): Promise<string> {
    throw new Error('abstract method');
  }

  onSessionEnd(callback: () => void): {
    dispose(): void;
  } {
    throw new Error('abstract method');
  }
}

export class DebuggerProcessInfo {
  _serviceName: string;

  constructor(serviceName: string) {
    this._serviceName = serviceName;
  }

  toString(): string {
    return `${this._serviceName} : ${this.displayString()}`;
  }

  displayString(): string {
    throw new Error('abstract method');
  }

  getServiceName(): string {
    return this._serviceName;
  }

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number {
    throw new Error('abstract method');
  }

  attach(): nuclide_debugger$DebuggerInstance {
    throw new Error('abstract method');
  }
}
