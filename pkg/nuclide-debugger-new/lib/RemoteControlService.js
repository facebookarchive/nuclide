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
import type {Observable} from 'rxjs';
import type {IDebugService, IProcessConfig} from './types';
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
    await this._startVspDebugging({
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

  getCurrentDebuggerName(): ?string {
    const {focusedProcess} = this._service.viewModel;
    if (focusedProcess == null) {
      return null;
    } else {
      return focusedProcess.configuration.debuggerName;
    }
  }

  async _startVspDebugging(config: IProcessConfig): Promise<IVspInstance> {
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

    return {
      customRequest,
      observeCustomEvents,
    };
  }

  canLaunchDebugTargetInTerminal(targetUri: NuclideUri): boolean {
    // Launcing in terminal isn't yet supported
    return false;
  }

  async launchDebugTargetInTerminal(
    targetUri: NuclideUri,
    command: string,
    args: Array<string>,
    cwd: NuclideUri,
    environmentVariables: Map<string, string>,
  ): Promise<void> {
    throw new Error('TODO: Add support for launching in terminal');
  }
}
