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

import type DebuggerModel from './DebuggerModel';
import type {
  DebuggerInstanceInterface,
  DebuggerProcessInfo,
} from 'nuclide-debugger-common';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import nuclideUri from 'nuclide-commons/nuclideUri';
import invariant from 'assert';
import {DebuggerMode} from './constants';
import nullthrows from 'nullthrows';
import * as terminalUri from '../../commons-node/nuclide-terminal-uri';

export default class RemoteControlService {
  _getModel: () => ?DebuggerModel;

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */
  constructor(getModel: () => ?DebuggerModel) {
    this._getModel = getModel;
  }

  async startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    await model.getActions().startDebugging(processInfo);
  }

  isInDebuggingMode(providerName: string): boolean {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    const session = model.getDebuggerInstance();
    return session != null && session.getProviderName() === providerName;
  }

  getDebuggerInstance(): ?DebuggerInstanceInterface {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    return model.getDebuggerInstance();
  }

  _killDebugger(): void {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().stopDebugging();
  }

  canLaunchDebugTargetInTerminal(targetUri: NuclideUri): boolean {
    // The terminal is not supported on Windows.
    return nuclideUri.isRemote(targetUri) || process.platform !== 'win32';
  }

  async launchDebugTargetInTerminal(
    targetUri: NuclideUri,
    command: string,
    args: Array<string>,
    cwd: NuclideUri,
    environmentVariables: Map<string, string>,
  ): Promise<boolean> {
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
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }

    const disposable = model.onDebuggerModeChange(() => {
      const debuggerModel = this._getModel();

      invariant(debuggerModel != null);
      const debuggerMode = debuggerModel.getDebuggerMode();
      if (debuggerMode === DebuggerMode.STOPPED) {
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
      this._killDebugger();
    });

    return true;
  }
}
