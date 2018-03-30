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
  DebuggerProperties,
  MessageProcessor,
  VsAdapterType,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {IVspInstance} from '../../nuclide-debugger-new/lib/types';
import * as DebugProtocol from 'vscode-debugprotocol';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';

type MessagePreprocessors = {
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

export default class VspProcessInfo {
  _targetUri: NuclideUri;
  _adapterType: VsAdapterType;
  _adapterExecutable: VSAdapterExecutableInfo;
  _debugMode: DebuggerConfigAction;
  _config: Object;
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

  getDebuggerCapabilities(): DebuggerCapabilities {
    const defaultCapabilities = {
      conditionalBreakpoints: false,
      continueToLocation: false,
      customSourcePaths: false,
      disassembly: false,
      readOnlyTarget: false,
      registers: false,
      setVariable: false,
      threads: false,
      completionsRequest: false,
    };
    return {
      ...defaultCapabilities,
      conditionalBreakpoints: true,
      setVariable: true,
      completionsRequest: true,
      ...this._customCapabilities,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    const defaultProps = {
      customControlButtons: [],
      targetDescription: () => null,
      threadsComponentTitle: 'Threads',
    };
    return {
      ...defaultProps,
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

  async debug(): Promise<void> {
    throw new Error('Old chrome-based debugger is no longer supported!');
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

  getAdapterType(): VsAdapterType {
    return this._adapterType;
  }

  getDebugMode(): DebuggerConfigAction {
    return this._debugMode;
  }

  getConfig(): Object {
    return this._config;
  }
}
