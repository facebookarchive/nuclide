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
  LaunchTargetInfo,
  DebuggerRpcService as DebuggerRpcServiceType,
} from '../../lldb-server/lib/DebuggerRpcServiceInterface';

import invariant from 'assert';
import {DebuggerProcessInfo} from '../../atom';
import {LldbDebuggerInstance} from './LldbDebuggerInstance';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTargetInfo: LaunchTargetInfo;

  constructor(targetUri: NuclideUri, launchTargetInfo: LaunchTargetInfo) {
    super('lldb', targetUri);
    this._launchTargetInfo = launchTargetInfo;
  }

  async debug(): Promise<DebuggerInstance> {
    const rpcService = this._getRpcService();
    const connection = await rpcService.launch(this._launchTargetInfo);
    rpcService.dispose();
    // Start websocket server with Chrome after launch completed.
    return new LldbDebuggerInstance(this, connection);
  }

  _getRpcService(): DebuggerRpcServiceType {
    const {getServiceByNuclideUri} = require('../../../client');
    const service = getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());
    invariant(service);
    return new service.DebuggerRpcService();
  }
}
