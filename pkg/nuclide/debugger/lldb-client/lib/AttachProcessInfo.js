'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerInstance} from '../../atom';
import type {NuclideUri} from '../../../remote-uri';
import type {
  AttachTargetInfo,
  DebuggerRpcService as DebuggerRpcServiceType,
} from '../../lldb-server/lib/DebuggerRpcServiceInterface';

import {DebuggerProcessInfo} from '../../atom';
import invariant from 'assert';
import {LldbDebuggerInstance} from './LldbDebuggerInstance';

export class AttachProcessInfo extends DebuggerProcessInfo {
  _targetInfo: AttachTargetInfo;

  constructor(targetUri: NuclideUri, targetInfo: AttachTargetInfo) {
    super('lldb', targetUri);
    this._targetInfo = targetInfo;
  }

  async debug(): Promise<DebuggerInstance> {
    const rpcService = this._getRpcService();
    if (this.basepath) {
      this._targetInfo.basepath = this.basepath;
    }
    const connection = await rpcService.attach(this._targetInfo);
    rpcService.dispose();
    // Start websocket server with Chrome after attach completed.
    return new LldbDebuggerInstance(this, connection);
  }

  _getRpcService(): DebuggerRpcServiceType {
    const {getServiceByNuclideUri} = require('../../../client');
    const service =
      getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());
    invariant(service);
    return new service.DebuggerRpcService();
  }

  get pid(): number {
    return this._targetInfo.pid;
  }

  compareDetails(other: DebuggerProcessInfo): number {
    invariant(other instanceof AttachProcessInfo);
    return this.displayString() === other.displayString()
      ? (this.pid - other.pid)
      : (this.displayString() < other.displayString()) ? -1 : 1;
  }

  displayString(): string {
    return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
  }
}
