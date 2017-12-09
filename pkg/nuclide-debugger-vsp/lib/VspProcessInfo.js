/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DebuggerConfigAction} from 'nuclide-debugger-common';
import type {
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common/types';
import type {VSCodeDebuggerAdapterService} from '../../nuclide-debugger-vsp-rpc/lib/VSCodeDebuggerAdapterService';
import type {
  DebuggerInstanceBase,
  DebuggerCapabilities,
  DebuggerProperties,
} from '../../nuclide-debugger-base';

import {
  DebuggerProcessInfo,
  DebuggerInstance,
  registerConsoleLogging,
} from '../../nuclide-debugger-base';
import {getVSCodeDebuggerAdapterServiceByNuclideUri} from '../../nuclide-remote-connection';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import invariant from 'assert';
import {track} from '../../nuclide-analytics';

export const VSP_DEBUGGER_SERVICE_NAME = 'vscode-adapter';

export default class VspProcessInfo extends DebuggerProcessInfo {
  _adapterType: VsAdapterType;
  _adapterExecutable: VSAdapterExecutableInfo;
  _debugMode: DebuggerConfigAction;
  _showThreads: boolean;
  _config: Object;

  constructor(
    targetUri: NuclideUri,
    debugMode: DebuggerConfigAction,
    adapterType: VsAdapterType,
    adapterExecutable: VSAdapterExecutableInfo,
    showThreads: boolean,
    config: Object,
  ) {
    super(VSP_DEBUGGER_SERVICE_NAME, targetUri);
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._showThreads = showThreads;
    this._config = config;
  }

  clone(): VspProcessInfo {
    return new VspProcessInfo(
      this._targetUri,
      this._debugMode,
      this._adapterType,
      {...this._adapterExecutable},
      this._showThreads,
      {...this._config},
    );
  }

  getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      ...super.getDebuggerCapabilities(),
      conditionalBreakpoints: true,
      threads: this._showThreads,
      setVariable: true,
      completionsRequest: true,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    return {
      ...super.getDebuggerProps(),
    };
  }

  async debug(): Promise<DebuggerInstanceBase> {
    const rpcService = this._getRpcService();
    const outputDisposable = registerConsoleLogging(
      this._adapterType,
      rpcService.getOutputWindowObservable().refCount(),
    );
    track('fb-vscode-debugger-launch', {
      type: this._adapterType,
      mode: this._debugMode,
    });
    invariant(outputDisposable, 'Debugger output service not available');
    try {
      await rpcService.debug(
        this._adapterExecutable,
        this._debugMode,
        this._config,
      );
      return new DebuggerInstance(
        this,
        rpcService,
        new UniversalDisposable(outputDisposable),
      );
    } catch (error) {
      outputDisposable.dispose();
      throw error;
    }
  }

  getAdapterType(): VsAdapterType {
    return this._adapterType;
  }

  getDebugMode(): DebuggerConfigAction {
    return this._debugMode;
  }

  getConfig(): Object {
    return this._config;
  }

  _getRpcService(): VSCodeDebuggerAdapterService {
    const service = getVSCodeDebuggerAdapterServiceByNuclideUri(
      this.getTargetUri(),
    );
    return new service.VSCodeDebuggerAdapterService(this._adapterType);
  }
}
