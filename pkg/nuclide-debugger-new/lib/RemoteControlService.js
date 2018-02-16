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
import type {IDebugService, IProcessConfig, IVspInstance} from './types';
import type VspProcessInfo from '../../nuclide-debugger-vsp/lib/VspProcessInfo';
import * as DebugProtocol from 'vscode-debugprotocol';

import {DebuggerMode} from './constants';
import invariant from 'assert';

export default class RemoteControlService {
  _service: IDebugService;

  constructor(service: IDebugService) {
    this._service = service;
  }

  async startDebugging(processInfo: VspProcessInfo): Promise<void> {
    const instance = this._startVspDebugging({
      targetUri: processInfo.getTargetUri(),
      debugMode: processInfo.getDebugMode(),
      adapterType: processInfo.getAdapterType(),
      adapterExecutable: processInfo._adapterExecutable,
      capabilities: processInfo.getDebuggerCapabilities(),
      properties: processInfo.getDebuggerProps(),
      config: processInfo.getConfig(),
      clientPreprocessor: processInfo.getVspClientPreprocessor(),
      adapterPreprocessor: processInfo.getVspAdapterPreprocessor(),
    });

    processInfo.setVspDebuggerInstance(instance);
  }

  getCurrentDebuggerName(): ?string {
    const {focusedProcess} = this._service.viewModel;
    if (focusedProcess == null) {
      return null;
    } else {
      return focusedProcess.configuration.adapterType;
    }
  }

  _startVspDebugging(config: IProcessConfig): IVspInstance {
    this._service.startDebugging(config);

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

    return Object.freeze({
      customRequest,
      observeCustomEvents,
    });
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
