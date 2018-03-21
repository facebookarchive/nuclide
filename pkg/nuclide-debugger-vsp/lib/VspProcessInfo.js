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
  ControlButtonSpecification,
  DebuggerCapabilities,
  DebuggerConfigAction,
  DebuggerInstanceInterface,
  DebuggerProperties,
  MessageProcessor,
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {VSCodeDebuggerAdapterService} from '../../nuclide-debugger-vsp-rpc/lib/VSCodeDebuggerAdapterService';
import type {} from 'nuclide-debugger-common';
import type {IVspInstance} from '../../nuclide-debugger-new/lib/types';
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
  vspAdapterPreprocessor: MessageProcessor,
  vspClientPreprocessor: MessageProcessor,
};

export type CustomDebuggerCapabilities = {
  conditionalBreakpoints?: boolean,
  continueToLocation?: boolean,
  readOnlyTarget?: boolean,
  setVariable?: boolean,
  threads?: boolean,
  completionsRequest?: boolean,
};

export type CustomDebuggerProperties = {
  customControlButtons?: Array<ControlButtonSpecification>,
  targetDescription?: () => ?string,
  threadsComponentTitle?: string,
};

export default class VspProcessInfo extends DebuggerProcessInfo {
  _adapterType: VsAdapterType;
  _adapterExecutable: VSAdapterExecutableInfo;
  _debugMode: DebuggerConfigAction;
  _config: Object;
  _rpcService: ?VSCodeDebuggerAdapterService;
  _vspInstance: ?IVspInstance;
  _preprocessors: ?MessagePreprocessors;
  _disposables: UniversalDisposable;
  _customCapabilities: CustomDebuggerCapabilities;
  _customProperties: CustomDebuggerProperties;

  constructor(
    targetUri: NuclideUri,
    debugMode: DebuggerConfigAction,
    adapterType: VsAdapterType,
    adapterExecutable: VSAdapterExecutableInfo,
    config: Object,
    customCapabilities?: ?CustomDebuggerCapabilities,
    customProperties?: ?CustomDebuggerProperties,
    preprocessors?: ?MessagePreprocessors,
  ) {
    super(VSP_DEBUGGER_SERVICE_NAME, targetUri);
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._config = config;
    this._customCapabilities = customCapabilities || {};
    this._customProperties = customProperties || {};
    this._preprocessors = preprocessors;
    this._rpcService = null;
    this._disposables = new UniversalDisposable();
  }

  clone(): VspProcessInfo {
    return new VspProcessInfo(
      this._targetUri,
      this._debugMode,
      this._adapterType,
      {...this._adapterExecutable},
      {...this._config},
      {...this._customCapabilities},
      {...this._customProperties},
      this._preprocessors,
    );
  }

  setVspDebuggerInstance(vspInstance: IVspInstance): void {
    this._vspInstance = vspInstance;
  }

  getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      ...super.getDebuggerCapabilities(),
      conditionalBreakpoints: true,
      setVariable: true,
      completionsRequest: true,
      ...this._customCapabilities,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    return {
      ...super.getDebuggerProps(),
      ...this._customProperties,
    };
  }

  getVspAdapterPreprocessor(): ?MessageProcessor {
    return this._preprocessors == null
      ? null
      : this._preprocessors.vspAdapterPreprocessor;
  }

  getVspClientPreprocessor(): ?MessageProcessor {
    return this._preprocessors == null
      ? null
      : this._preprocessors.vspClientPreprocessor;
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
    if (this._rpcService != null) {
      return this._rpcService.custom(request, args);
    } else if (this._vspInstance != null) {
      return this._vspInstance.customRequest(request, args);
    } else {
      throw new Error('Cannot send custom requests to inactive debug sessions');
    }
  }

  observeCustomEvents(): Observable<DebugProtocol.DebugEvent> {
    if (this._rpcService != null) {
      return this._rpcService.observeCustomEvents().refCount();
    } else if (this._vspInstance != null) {
      return this._vspInstance.observeCustomEvents();
    } else {
      return Observable.throw(
        new Error('Cannot send custom requests to inactive debug sessions'),
      );
    }
  }

  addCustomDisposable(disposable: IDisposable): void {
    this._disposables.add(disposable);
  }

  dispose(): void {
    if (this._rpcService != null) {
      this._rpcService.dispose();
      this._rpcService = null;
    }
    this._disposables.dispose();
    this._vspInstance = null;
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
