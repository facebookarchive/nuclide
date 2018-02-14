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
import type {
  DebuggerConfigAction,
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {VSCodeDebuggerAdapterService} from '../../nuclide-debugger-vsp-rpc/lib/VSCodeDebuggerAdapterService';
import type {
  DebuggerInstanceInterface,
  DebuggerCapabilities,
  DebuggerProperties,
} from 'nuclide-debugger-common';
import * as DebugProtocol from 'vscode-debugprotocol';

import {DebuggerProcessInfo, DebuggerInstance} from 'nuclide-debugger-common';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {registerConsoleLogging} from '../../nuclide-debugger/lib/AtomServiceContainer';
import {getVSCodeDebuggerAdapterServiceByNuclideUri} from '../../nuclide-remote-connection';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import invariant from 'assert';
import {track} from '../../nuclide-analytics';
import {Observable} from 'rxjs';

const VSP_DEBUGGER_SERVICE_NAME = 'vscode-adapter';

type MessagePreprocessors = {
  chromeAdapterPreprocessor: (message: string) => string,
  chromeClientPreprocessor: (message: string) => string,
  vspAdapterPreprocessor: (message: Object) => void,
  vspClientPreprocessor: (message: Object) => void,
};

export default class VspProcessInfo extends DebuggerProcessInfo {
  _adapterType: VsAdapterType;
  _adapterExecutable: VSAdapterExecutableInfo;
  _debugMode: DebuggerConfigAction;
  _showThreads: boolean;
  _config: Object;
  _rpcService: ?VSCodeDebuggerAdapterService;
  _preprocessors: ?MessagePreprocessors;
  _customDisposable: ?IDisposable;

  constructor(
    targetUri: NuclideUri,
    debugMode: DebuggerConfigAction,
    adapterType: VsAdapterType,
    adapterExecutable: VSAdapterExecutableInfo,
    showThreads: boolean,
    config: Object,
    preprocessors?: ?MessagePreprocessors,
  ) {
    super(VSP_DEBUGGER_SERVICE_NAME, targetUri);
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._showThreads = showThreads;
    this._config = config;
    this._rpcService = null;
    this._preprocessors = preprocessors;
    this._customDisposable = null;
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

  async debug(): Promise<DebuggerInstanceInterface> {
    const rpcService = this._getRpcService();
    this._rpcService = rpcService;
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
      return new ChromeDebuggerInstance(
        this,
        rpcService,
        new UniversalDisposable(outputDisposable, () => {
          this._rpcService = null;
        }),
        this._preprocessors,
      );
    } catch (error) {
      outputDisposable.dispose();
      throw error;
    }
  }

  async customRequest(
    request: string,
    args: any,
  ): Promise<DebugProtocol.CustomResponse> {
    if (this._rpcService == null) {
      throw new Error('Cannot send custom requests to inactive debug sessions');
    }
    return this._rpcService.custom(request, args);
  }

  observeCustomEvents(): Observable<DebugProtocol.DebugEvent> {
    if (this._rpcService == null) {
      return Observable.throw(
        new Error('Cannot send custom requests to inactive debug sessions'),
      );
    }
    return this._rpcService.observeCustomEvents().refCount();
  }

  setCustomDisposable(disposable: IDisposable): void {
    this._customDisposable = disposable;
  }

  dispose(): void {
    if (this._rpcService != null) {
      this._rpcService.dispose();
      this._rpcService = null;
    }
    if (this._customDisposable != null) {
      this._customDisposable.dispose();
      this._customDisposable = null;
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

class ChromeDebuggerInstance extends DebuggerInstance {
  _processors: ?MessagePreprocessors;

  constructor(
    processInfo: VspProcessInfo,
    rpcService: Object,
    disposables: UniversalDisposable,
    processors: ?MessagePreprocessors,
  ) {
    super(processInfo, rpcService, disposables);
    this._processors = processors;
  }

  // Preprocessing hook for messages sent from the device to Nuclide. This includes messages
  // that are device events or responses to requests.
  preProcessServerMessage(message: string): string {
    if (this._processors == null) {
      return message;
    }
    return this._processors.chromeAdapterPreprocessor(message);
  }

  // This is a hook for messages sent from Nuclide to the device.
  async preProcessClientMessage(message: string): Promise<string> {
    if (this._processors == null) {
      return message;
    }
    return this._processors.chromeClientPreprocessor(message);
  }
}
