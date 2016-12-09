/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {IwdpDebuggerService} from '../../nuclide-debugger-iwdp-rpc/lib/IwdpDebuggerService';
import type {DebuggerInstanceBase} from '../../nuclide-debugger-base';
import type {TargetEnvironment} from '../../nuclide-debugger-iwdp-rpc/lib/types';


import invariant from 'assert';
import {DebuggerProcessInfo, DebuggerInstance} from '../../nuclide-debugger-base';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

export class AttachProcessInfo extends DebuggerProcessInfo {
  _targetEnvironment: TargetEnvironment;

  constructor(targetUri: NuclideUri, targetEnvironment: TargetEnvironment) {
    super('iwdp', targetUri);
    this._targetEnvironment = targetEnvironment;
  }

  async debug(): Promise<DebuggerInstanceBase> {
    const rpcService = this._getRpcService();
    await rpcService.attach(this._targetEnvironment);
    return new DebuggerInstance(this, rpcService);
  }

  supportThreads(): boolean {
    return true;
  }

  _getRpcService(): IwdpDebuggerService {
    const service = getServiceByNuclideUri('IwdpDebuggerService', this.getTargetUri());
    invariant(service != null);
    return new service.IwdpDebuggerService();
  }
}
