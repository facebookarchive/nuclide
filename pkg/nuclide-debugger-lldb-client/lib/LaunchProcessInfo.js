'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerInstance} from '../../nuclide-debugger-atom';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type {
  LaunchTargetInfo,
  DebuggerRpcService as DebuggerRpcServiceType,
} from '../../nuclide-debugger-lldb-server/lib/DebuggerRpcServiceInterface';

import invariant from 'assert';
import {DebuggerProcessInfo} from '../../nuclide-debugger-atom';
import {LldbDebuggerInstance} from './LldbDebuggerInstance';
import {registerOutputWindowLogging} from '../../nuclide-debugger-common/lib/OutputServiceManager';
import {getConfig} from './utils';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTargetInfo: LaunchTargetInfo;

  constructor(targetUri: NuclideUri, launchTargetInfo: LaunchTargetInfo) {
    super('lldb', targetUri);
    this._launchTargetInfo = launchTargetInfo;
  }

  async debug(): Promise<DebuggerInstance> {
    const rpcService = this._getRpcService();
    if (this.basepath) {
      this._launchTargetInfo.basepath = this.basepath;
    }

    let debugSession = null;
    let outputDisposable = registerOutputWindowLogging(rpcService.getOutputWindowObservable());
    try {
      const connection = await rpcService.launch(this._launchTargetInfo);
      rpcService.dispose();
      // Start websocket server with Chrome after launch completed.
      debugSession = new LldbDebuggerInstance(this, connection, outputDisposable);
      outputDisposable = null;
    } finally {
      if (outputDisposable != null) {
        outputDisposable.dispose();
      }
    }
    return debugSession;
  }

  _getRpcService(): DebuggerRpcServiceType {
    const debuggerConfig = {
      logLevel: getConfig().serverLogLevel,
      pythonBinaryPath: getConfig().pythonBinaryPath,
      buckConfigRootFile: getConfig().buckConfigRootFile,
    };
    const {getServiceByNuclideUri} = require('../../nuclide-client');
    const service = getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());
    invariant(service);
    return new service.DebuggerRpcService(debuggerConfig);
  }
}
