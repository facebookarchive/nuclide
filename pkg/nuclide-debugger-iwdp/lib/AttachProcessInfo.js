'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import {IwdpDebuggerInstance} from './IwdpDebuggerInstance';
import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {IwdpDebuggerService} from '../../nuclide-debugger-iwdp-rpc/lib/IwdpDebuggerService';

export class AttachProcessInfo extends DebuggerProcessInfo {
  constructor(targetUri: NuclideUri) {
    super('iwdp', targetUri);
  }

  async debug(): Promise<IwdpDebuggerInstance> {
    const rpcService = this._getRpcService();
    await rpcService.attach();
    return new IwdpDebuggerInstance(this, rpcService);
  }

  _getRpcService(): IwdpDebuggerService {
    const service = getServiceByNuclideUri('IwdpDebuggerService', this.getTargetUri());
    invariant(service != null);
    return new service.IwdpDebuggerService();
  }
}
