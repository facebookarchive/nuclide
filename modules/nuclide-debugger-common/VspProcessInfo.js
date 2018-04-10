/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  ControlButtonSpecification,
  DebuggerCapabilities,
  DebuggerConfigAction,
  DebuggerProperties,
  IProcessConfig,
  IVspInstance,
  MessageProcessor,
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import * as DebugProtocol from 'vscode-debugprotocol';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';

type MessagePreprocessors = {
  vspAdapterPreprocessor: MessageProcessor,
  vspClientPreprocessor: MessageProcessor,
};

type CustomDebuggerCapabilities = {
  threads?: boolean,
};

type CustomDebuggerProperties = {
  customControlButtons?: Array<ControlButtonSpecification>,
  threadsComponentTitle?: string,
};

export default class VspProcessInfo {
  _targetUri: NuclideUri;
  _debugMode: DebuggerConfigAction;
  _adapterType: VsAdapterType;
  _adapterExecutable: ?VSAdapterExecutableInfo;
  _config: Object;
  _customCapabilities: CustomDebuggerCapabilities;
  _customProperties: CustomDebuggerProperties;
  _preprocessors: ?MessagePreprocessors;
  _vspInstance: ?IVspInstance;
  _disposables: UniversalDisposable;

  constructor(
    targetUri: NuclideUri,
    debugMode: DebuggerConfigAction,
    adapterType: VsAdapterType,
    adapterExecutable: ?VSAdapterExecutableInfo,
    config: Object,
    customCapabilities?: ?CustomDebuggerCapabilities,
    customProperties?: ?CustomDebuggerProperties,
    preprocessors?: ?MessagePreprocessors,
  ) {
    this._targetUri = targetUri;
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._config = config;
    this._customCapabilities = customCapabilities || {};
    this._customProperties = customProperties || {};
    this._preprocessors = preprocessors;
    this._disposables = new UniversalDisposable();
  }

  getTargetUri(): NuclideUri {
    return this._targetUri;
  }

  setVspDebuggerInstance(vspInstance: IVspInstance): void {
    this._vspInstance = vspInstance;
  }

  _getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      threads: false,
      ...this._customCapabilities,
    };
  }

  _getDebuggerProps(): DebuggerProperties {
    return {
      customControlButtons: [],
      threadsComponentTitle: 'Threads',
      ...this._customProperties,
    };
  }

  async customRequest(
    request: string,
    args: any,
  ): Promise<DebugProtocol.CustomResponse> {
    if (this._vspInstance != null) {
      return this._vspInstance.customRequest(request, args);
    } else {
      throw new Error('Cannot send custom requests to inactive debug sessions');
    }
  }

  observeCustomEvents(): Observable<DebugProtocol.DebugEvent> {
    if (this._vspInstance != null) {
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
    this._disposables.dispose();
    this._vspInstance = null;
  }

  getProcessConfig(): IProcessConfig {
    return {
      targetUri: this._targetUri,
      debugMode: this._debugMode,
      adapterType: this._adapterType,
      adapterExecutable: this._adapterExecutable,
      capabilities: this._getDebuggerCapabilities(),
      properties: this._getDebuggerProps(),
      config: this._config,
      clientPreprocessor:
        this._preprocessors == null
          ? null
          : this._preprocessors.vspClientPreprocessor,
      adapterPreprocessor:
        this._preprocessors == null
          ? null
          : this._preprocessors.vspAdapterPreprocessor,
    };
  }

  getConfig(): Object {
    return this._config;
  }
}
