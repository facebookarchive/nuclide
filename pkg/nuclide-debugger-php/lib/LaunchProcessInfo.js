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
import type {
  PhpDebuggerService as PhpDebuggerServiceType,
} from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';

import invariant from 'assert';
import {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import {PhpDebuggerInstance} from './PhpDebuggerInstance';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import nuclideUri from '../../commons-node/nuclideUri';

import utils from './utils';
const {logInfo} = utils;
import {getSessionConfig} from './utils';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTarget: string;

  constructor(targetUri: NuclideUri, launchTarget: string) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
  }

  async debug(): Promise<PhpDebuggerInstance> {
    const rpcService = this._getRpcService();
    const sessionConfig = getSessionConfig(nuclideUri.getPath(this.getTargetUri()), true);

    // Set config related to script launching.
    sessionConfig.endDebugWhenNoRequests = true;
    sessionConfig.launchScriptPath = this._launchTarget;

    logInfo(`Connection session config: ${JSON.stringify(sessionConfig)}`);

    const result = await rpcService.debug(sessionConfig);
    logInfo(`Launch process result: ${result}`);
    return new PhpDebuggerInstance(this, rpcService);
  }

  _getRpcService(): PhpDebuggerServiceType {
    const service =
      getServiceByNuclideUri('PhpDebuggerService', this.getTargetUri());
    invariant(service);
    return new service.PhpDebuggerService();
  }

  supportThreads(): boolean {
    return true;
  }

  supportSingleThreadStepping(): boolean {
    return true;
  }

  singleThreadSteppingEnabled(): boolean {
    return true;
  }

}
