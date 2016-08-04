'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerInstance} from '../../nuclide-debugger-base';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  LaunchTargetInfo,
  NativeDebuggerService as NativeDebuggerServiceType,
} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';
import typeof * as NativeDebuggerServiceInterface
  from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';

import invariant from 'assert';
import {LldbDebuggerInstance} from './LldbDebuggerInstance';
import {
  DebuggerProcessInfo,
  registerOutputWindowLogging,
} from '../../nuclide-debugger-base';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getConfig} from './utils';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTargetInfo: LaunchTargetInfo;

  constructor(targetUri: NuclideUri, launchTargetInfo: LaunchTargetInfo) {
    super('lldb', targetUri);
    this._launchTargetInfo = launchTargetInfo;
  }

  supportThreads(): boolean {
    return true;
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

  _getRpcService(): NativeDebuggerServiceType {
    const debuggerConfig = {
      logLevel: getConfig().serverLogLevel,
      pythonBinaryPath: getConfig().pythonBinaryPath,
      buckConfigRootFile: getConfig().buckConfigRootFile,
    };
    const service: ?NativeDebuggerServiceInterface
      = getServiceByNuclideUri('NativeDebuggerService', this.getTargetUri());
    invariant(service);
    return new service.NativeDebuggerService(debuggerConfig);
  }
}
