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
  DebuggerInstanceBase,
  DebuggerProcessInfo,
} from '../../nuclide-debugger-base';
import type {
  NodeAttachTargetInfo,
  NodeDebuggerService,
} from '../../nuclide-debugger-node-rpc/lib/NodeDebuggerService';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getConfig} from './utils';

export class NodeAttachProcessInfo extends DebuggerProcessInfo {
  _targetInfo: NodeAttachTargetInfo;

  constructor(targetUri: NuclideUri, targetInfo: NodeAttachTargetInfo) {
    super('node', targetUri);
    this._targetInfo = targetInfo;
  }

  async debug(): Promise<DebuggerInstanceBase> {
    const rpcService = this._getRpcService();
    await rpcService.attach(this._targetInfo);
    return new DebuggerInstance(this, rpcService);
  }

  _getRpcService(): NodeDebuggerService {
    const debuggerConfig = {
      logLevel: getConfig().serverLogLevel,
    };
    const service =
      getServiceByNuclideUri('NodeDebuggerService', this.getTargetUri());
    invariant(service);
    return new service.NodeDebuggerService(debuggerConfig);
  }
}
