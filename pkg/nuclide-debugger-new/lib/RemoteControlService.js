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

import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import nuclideUri from 'nuclide-commons/nuclideUri';
import * as terminalUri from '../../commons-node/nuclide-terminal-uri';

import {DebuggerMode} from './constants';
import invariant from 'assert';
import nullthrows from 'nullthrows';

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
    return true;
  }

  async launchDebugTargetInTerminal(
    targetUri: NuclideUri,
    command: string,
    args: Array<string>,
    cwd: NuclideUri,
    environmentVariables: Map<string, string>,
  ): Promise<void> {
    const key = `targetUri=${targetUri}&command=${command}`;
    const info = {
      cwd,
      title: 'Debug output: ' + nuclideUri.getPath(targetUri),
      key,
      command: {
        file: command,
        args,
      },
      remainOnCleanExit: true,
      icon: 'nuclicon-debugger',
      defaultLocation: 'bottom',
      environmentVariables,
      preservedCommands: [
        'nuclide-debugger:continue-debugging',
        'nuclide-debugger:stop-debugging',
        'nuclide-debugger:restart-debugging',
        'nuclide-debugger:step-over',
        'nuclide-debugger:step-into',
        'nuclide-debugger:step-out',
      ],
    };

    const infoUri = terminalUri.uriFromInfo(info);

    // Ensure any previous instances of this same target are closed before
    // opening a new terminal tab. We don't want them to pile up if the
    // user keeps running the same app over and over.
    destroyItemWhere(item => {
      if (item.getURI == null || item.getURI() == null) {
        return false;
      }

      const uri = nullthrows(item.getURI());
      try {
        // Only close terminal tabs with the same title and target binary.
        const otherInfo = terminalUri.infoFromUri(uri);
        return otherInfo.key === key;
      } catch (e) {}
      return false;
    });

    await goToLocation(infoUri);

    const terminalPane = nullthrows(atom.workspace.paneForURI(infoUri));
    const terminal = nullthrows(terminalPane.itemForURI(infoUri));

    // Ensure the debugger is terminated if the process running inside the
    // terminal exits, and that the terminal destroys if the debugger stops.

    const disposable = this._service.onDidChangeMode(mode => {
      if (mode === DebuggerMode.STOPPED) {
        // This termination path is invoked if the debugger dies first, ensuring
        // we terminate the target process. This can happen if the user hits stop,
        // or if the debugger crashes.
        terminal.setProcessExitCallback(() => {});
        terminal.terminateProcess();
        disposable.dispose();
      }
    });

    terminal.setProcessExitCallback(() => {
      // This callback is invoked if the target process dies first, ensuring
      // we tear down the debugger.
      disposable.dispose();
      this._service.stopProcess();
    });
  }
}
