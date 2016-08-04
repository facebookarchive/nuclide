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
  AttachTargetInfo,
  NativeDebuggerService as NativeDebuggerServiceType,
} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';
import typeof * as NativeDebuggerServiceInterface
  from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';

import {
  DebuggerProcessInfo,
  registerOutputWindowLogging,
} from '../../nuclide-debugger-base';
import invariant from 'assert';
import {LldbDebuggerInstance} from './LldbDebuggerInstance';
import {getConfig} from './utils';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

export class AttachProcessInfo extends DebuggerProcessInfo {
  _targetInfo: AttachTargetInfo;

  constructor(targetUri: NuclideUri, targetInfo: AttachTargetInfo) {
    super('lldb', targetUri);
    this._targetInfo = targetInfo;
  }

  supportThreads(): boolean {
    return true;
  }

  async debug(): Promise<DebuggerInstance> {
    const rpcService = this._getRpcService();
    if (this.basepath) {
      this._targetInfo.basepath = this.basepath;
    }

    let debugSession = null;
    let outputDisposable = registerOutputWindowLogging(rpcService.getOutputWindowObservable());
    try {
      const connection = await rpcService.attach(this._targetInfo);
      rpcService.dispose();
      // Start websocket server with Chrome after attach completed.
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
    const service: ?NativeDebuggerServiceInterface =
      getServiceByNuclideUri('NativeDebuggerService', this.getTargetUri());
    invariant(service);
    return new service.NativeDebuggerService(debuggerConfig);
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
