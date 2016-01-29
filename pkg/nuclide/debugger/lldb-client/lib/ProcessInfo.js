'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {nuclide_debugger$DebuggerInstance} from '../../interfaces/service';
import type {NuclideUri} from '../../../remote-uri';
import type {AttachTargetInfo} from '../../lldb-server/lib/DebuggerRpcServiceInterface';

import {DebuggerProcessInfo} from '../../atom';
import invariant from 'assert';
import {DebuggerProcess} from './DebuggerProcess';

export class ProcessInfo extends DebuggerProcessInfo {
  _targetUri: NuclideUri;
  _targetInfo: AttachTargetInfo;

  constructor(targetUri: NuclideUri, targetInfo: AttachTargetInfo) {
    super('lldb');
    this._targetUri = targetUri;
    this._targetInfo = targetInfo;
  }

  attach(): nuclide_debugger$DebuggerInstance {
    const process = new DebuggerProcess(this._targetUri, this._targetInfo);
    process.attach();
    return process;
  }

  get pid(): number {
    return this._targetInfo.pid;
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof ProcessInfo);
    return this.displayString() === other.displayString()
      ? (this.pid - other.pid)
      : (this.displayString() < other.displayString()) ? -1 : 1;
  }

  displayString(): string {
    return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
  }
}
