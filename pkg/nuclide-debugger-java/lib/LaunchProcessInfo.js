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
import type {
  JavaDebuggerService,
  JavaLaunchTargetInfo,
} from '../../nuclide-debugger-java-rpc/lib/JavaDebuggerServiceInterface';
import type {DebuggerInstanceBase} from '../../nuclide-debugger-base';

import invariant from 'assert';
import {DebuggerProcessInfo, DebuggerInstance} from '../../nuclide-debugger-base';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTargetInfo: JavaLaunchTargetInfo;

  constructor(targetUri: NuclideUri, launchTargetInfo: JavaLaunchTargetInfo) {
    super('java', targetUri);
    this._launchTargetInfo = launchTargetInfo;
  }

  async debug(): Promise<DebuggerInstanceBase> {
    const rpcService = this._getRpcService();
    await rpcService.launch(this._launchTargetInfo).refCount().toPromise();
    return new DebuggerInstance(this, rpcService);
  }

  _getRpcService(): JavaDebuggerService {
    const service = getServiceByNuclideUri('JavaDebuggerService', this.getTargetUri());
    invariant(service != null);
    return new service.JavaDebuggerService();
  }
}
