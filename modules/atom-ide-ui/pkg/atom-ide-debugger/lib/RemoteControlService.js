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

import type {Observable} from 'rxjs';
import type {IDebugService, IProcess, RemoteDebuggerService} from './types';
import type {IProcessConfig, IVspInstance} from 'nuclide-debugger-common';
import * as DebugProtocol from 'vscode-debugprotocol';

import {DebuggerMode} from './constants';
import invariant from 'assert';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export default class RemoteControlService implements RemoteDebuggerService {
  _service: IDebugService;
  _disposables: UniversalDisposable;

  constructor(service: IDebugService) {
    this._service = service;
    this._disposables = new UniversalDisposable();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  onDidStartDebugSession(
    callback: (config: IProcessConfig) => mixed,
  ): IDisposable {
    return this._service.onDidStartDebugSession(callback);
  }

  _onSessionEnd(
    focusedProcess: IProcess,
    disposables: UniversalDisposable,
  ): void {
    disposables.add(
      this._service.viewModel.onDidFocusProcess(() => {
        if (
          !this._service
            .getModel()
            .getProcesses()
            .includes(focusedProcess)
        ) {
          disposables.dispose();
        }
      }),
    );
  }

  async startVspDebugging(config: IProcessConfig): Promise<IVspInstance> {
    await this._service.startDebugging(config);

    const {viewModel} = this._service;
    const {focusedProcess} = viewModel;
    invariant(focusedProcess != null);

    const isFocusedProcess = (): boolean => {
      return (
        this._service.getDebuggerMode() !== DebuggerMode.STOPPED &&
        viewModel.focusedProcess === focusedProcess
      );
    };

    const customRequest = async (
      request: string,
      args: any,
    ): Promise<DebugProtocol.CustomResponse> => {
      if (!isFocusedProcess()) {
        throw new Error(
          'Cannot send custom requests to a no longer active debug session!',
        );
      }
      return focusedProcess.session.custom(request, args);
    };

    const observeCustomEvents = (): Observable<DebugProtocol.DebugEvent> => {
      if (!isFocusedProcess()) {
        throw new Error(
          'Cannot send custom requests to a no longer active debug session!',
        );
      }
      return focusedProcess.session.observeCustomEvents();
    };

    const disposables = new UniversalDisposable();
    const addCustomDisposable = (disposable: IDisposable): void => {
      disposables.add(disposable);
    };

    this._onSessionEnd(focusedProcess, disposables);

    return Object.freeze({
      customRequest,
      observeCustomEvents,
      addCustomDisposable,
    });
  }
}
