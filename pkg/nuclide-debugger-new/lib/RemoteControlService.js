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

import type {Observable} from 'rxjs';
import type {IDebugService, IProcessConfig, IProcess} from './types';
import type VspProcessInfo from '../../nuclide-debugger-vsp/lib/VspProcessInfo';
import * as DebugProtocol from 'vscode-debugprotocol';

interface IVspInstance {
  customRequest(
    request: string,
    args: any,
  ): Promise<DebugProtocol.CustomResponse>;
  observeCustomEvents(): Observable<DebugProtocol.DebugEvent>;
}

import {DebuggerMode} from './constants';
import invariant from 'assert';

export default class RemoteControlService {
  _service: IDebugService;

  constructor(service: IDebugService) {
    this._service = service;
  }

  async startDebugging(processInfo: VspProcessInfo): Promise<void> {
    await this.startVspDebugging({
      debuggerName: processInfo._serviceName,
      targetUri: processInfo.getTargetUri(),
      debugMode: processInfo._debugMode,
      adapterType: processInfo._adapterType,
      adapterExecutable: processInfo._adapterExecutable,
      capabilities: processInfo.getDebuggerCapabilities(),
      properties: processInfo.getDebuggerProps(),
      config: processInfo._config,
    });
  }

  getDebuggerProcess(): ?IProcess {
    return this._service.viewModel.focusedProcess;
  }

  async startVspDebugging(config: IProcessConfig): Promise<IVspInstance> {
    await this._service.startDebugging(config);
    const {viewModel} = this._service;
    const {focusedProcess} = viewModel;
    invariant(focusedProcess != null);

    const isFocussedProcess = (): boolean => {
      return (
        this._service.getDebuggerMode() !== DebuggerMode.STOPPED &&
        viewModel.focusedProcess === focusedProcess
      );
    };

    const customRequest = async (
      request: string,
      args: any,
    ): Promise<DebugProtocol.CustomResponse> => {
      if (!isFocussedProcess()) {
        throw new Error(
          'Cannot send custom requests to a no longer active debug session!',
        );
      }
      return focusedProcess.session.custom(request, args);
    };

    const observeCustomEvents = (): Observable<DebugProtocol.DebugEvent> => {
      if (!isFocussedProcess()) {
        throw new Error(
          'Cannot send custom requests to a no longer active debug session!',
        );
      }
      return focusedProcess.session.observeCustomEvents();
    };

    return {
      customRequest,
      observeCustomEvents,
    };
  }
}
