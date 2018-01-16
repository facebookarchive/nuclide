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
import type {ConnectableObservable} from 'rxjs';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {getAvailableServerPort} from '../../commons-node/serverPort';
// eslint-disable-next-line rulesdir/no-unresolved
import {
  DebuggerRpcServiceBase,
  VsDebugSessionTranslator,
} from 'nuclide-debugger-common';
import type {AtomNotification} from 'nuclide-debugger-common';
import nullthrows from 'nullthrows';
import fsPromise from 'nuclide-commons/fsPromise';
import os from 'os';
import {runCommand} from 'nuclide-commons/process';

export type HHVMLaunchConfig = {
  action: 'launch',
  targetUri: NuclideUri,
  startupDocumentPath?: string,
  launchScriptPath: NuclideUri,
  scriptArgs: Array<string>,
  hhvmRuntimePath?: string,
  hhvmRuntimeArgs: Array<string>,
  deferLaunch: boolean,
  launchWrapperCommand?: string,
};

export type HHVMAttachConfig = {
  action: 'attach',
  targetUri: NuclideUri,
  startupDocumentPath?: string,
  debugPort?: number,
};

const DEFAULT_HHVM_PATH = '/usr/local/bin/hhvm';

// The default path (relative to Hack Root) to use for the startup document,
// which is loaded by the dummy request thread in the debugger backend.
const DEFAULT_STARTUP_DOC_PATH = 'scripts/vsdebug_includes.php';

export class HhvmDebuggerService extends DebuggerRpcServiceBase {
  _translator: ?VsDebugSessionTranslator;

  constructor() {
    super('HHVM');
  }

  getOutputWindowObservable(): ConnectableObservable<string> {
    return super.getOutputWindowObservable();
  }

  getAtomNotificationObservable(): ConnectableObservable<AtomNotification> {
    return super.getAtomNotificationObservable();
  }

  // TODO: Provided for interface compatibility with the old debugger, which is
  // needed in PhpDebuggerInstance on the client side. Remove once the old debugger
  // is removed.
  getNotificationObservable(): ConnectableObservable<AtomNotification> {
    return super.getAtomNotificationObservable();
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return super.getServerMessageObservable();
  }

  async debug(config: HHVMAttachConfig | HHVMLaunchConfig): Promise<string> {
    const debuggerArgs = await this._getDebuggerArgs(config);
    this._translator = new VsDebugSessionTranslator(
      'hhvm',
      {
        command: this._getNodePath(),
        args: [require.resolve('./hhvmWrapper.js')],
      },
      config.action,
      debuggerArgs,
      this.getClientCallback(),
      this.getLogger(),
    );

    this._subscriptions.add(
      this._translator,
      this._translator.observeSessionEnd().subscribe(this.dispose.bind(this)),
      () => (this._translator = null),
    );

    nullthrows(this._translator).initilize();
    return `HHVM debugger ${
      config.action === 'launch' ? 'launched' : 'attached'
    }.`;
  }

  async sendCommand(message: string): Promise<void> {
    if (this._translator) {
      this._translator.processCommand(JSON.parse(message));
    }
  }

  async _getDebuggerArgs(
    config: HHVMAttachConfig | HHVMLaunchConfig,
  ): Promise<Object> {
    switch (config.action) {
      case 'launch':
        const launchConfig: HHVMLaunchConfig = (config: any);
        return this.getLaunchArgs(launchConfig);
      case 'attach':
        const attachConfig: HHVMAttachConfig = (config: any);
        return this._getAttachArgs(attachConfig);
      default:
        throw new Error('Invalid launch/attach action');
    }
  }

  _expandPath(path: string, cwd: string): string {
    // Expand a path to interpret ~/ as home and ./ as relative
    // to the current working directory.
    return path.startsWith('./')
      ? nuclideUri.resolve(
          cwd != null ? nuclideUri.expandHomeDir(cwd) : '',
          path.substring(2),
        )
      : nuclideUri.expandHomeDir(path);
  }

  async getLaunchArgs(config: HHVMLaunchConfig): Promise<Object> {
    const cwd = nuclideUri.dirname(config.targetUri);

    // Expand paths in the launch config from the front end.
    if (config.hhvmRuntimePath != null) {
      config.hhvmRuntimePath = this._expandPath(config.hhvmRuntimePath, cwd);
    }

    config.launchScriptPath = this._expandPath(config.launchScriptPath, cwd);

    if (config.launchWrapperCommand != null) {
      config.launchWrapperCommand = this._expandPath(
        config.launchWrapperCommand,
        cwd,
      );
    }

    const deferArgs = [];
    let debugPort = null;
    if (config.deferLaunch) {
      debugPort = await getAvailableServerPort();
      deferArgs.push('--vsDebugPort');
      deferArgs.push(debugPort);
    }

    const hhvmPath = await this._getHhvmPath(config);
    const launchArgs =
      config.launchWrapperCommand != null &&
      config.launchWrapperCommand.trim() !== ''
        ? [config.launchWrapperCommand, config.launchScriptPath]
        : [config.launchScriptPath];

    const hhvmArgs = [
      ...config.hhvmRuntimeArgs,
      '--mode',
      'vsdebug',
      ...deferArgs,
      ...launchArgs,
      ...config.scriptArgs,
    ];

    const startupDocumentPath: ?string = await this._getStartupDocumentPath(
      config,
    );

    const logFilePath = this._getHHVMLogFilePath();

    return {
      hhvmPath,
      hhvmArgs,
      startupDocumentPath,
      logFilePath,
      debugPort,
      cwd:
        config.launchWrapperCommand != null
          ? nuclideUri.dirname(config.launchWrapperCommand)
          : cwd,
    };
  }

  _getHHVMLogFilePath(): string {
    return nuclideUri.join(
      os.tmpdir(),
      `nuclide-${os.userInfo().username}-logs`,
      'hhvm-debugger.log',
    );
  }

  async createLogFilePaste(): Promise<string> {
    try {
      // $FlowFB
      const fbPaste = require('../../fb-pastebin');
      return fsPromise
        .readFile(this._getHHVMLogFilePath(), 'utf8')
        .then(contents =>
          fbPaste.createPasteFromContents(contents, {title: 'HHVM-Debugger'}),
        );
    } catch (error) {
      return '';
    }
  }

  async _getAttachArgs(config: HHVMAttachConfig): Promise<Object> {
    const startupDocumentPath: ?string = await this._getStartupDocumentPath(
      config,
    );
    const logFilePath = this._getHHVMLogFilePath();
    return {
      debugPort: config.debugPort,
      startupDocumentPath,
      logFilePath,
    };
  }

  async _getStartupDocumentPath(
    config: HHVMAttachConfig | HHVMLaunchConfig,
  ): Promise<?string> {
    if (config.startupDocumentPath != null) {
      const configPath = nuclideUri.expandHomeDir(config.startupDocumentPath);
      if (await fsPromise.exists(configPath)) {
        return configPath;
      }
    }

    // Otherwise, fall back to the default path, relative to the current
    // hack root directory.
    const filePath = nuclideUri.getPath(config.targetUri);
    const hackRoot = await fsPromise.findNearestFile('.hhconfig', filePath);
    const startupDocPath = nuclideUri.join(
      hackRoot != null ? hackRoot : '',
      DEFAULT_STARTUP_DOC_PATH,
    );

    if (await fsPromise.exists(startupDocPath)) {
      return startupDocPath;
    }

    return null;
  }

  _getNodePath(): string {
    try {
      // $FlowFB
      return require('nuclide-debugger-common/fb-constants')
        .DEVSERVER_NODE_PATH;
    } catch (error) {
      return 'node';
    }
  }

  async _getHhvmPath(config: HHVMLaunchConfig): Promise<string> {
    // If the client specified an HHVM runtime path, and it exists, use that.
    if (config.hhvmRuntimePath != null && config.hhvmRuntimePath !== '') {
      const exists = await fsPromise.exists(config.hhvmRuntimePath);
      if (exists) {
        return String(config.hhvmRuntimePath);
      }
    }

    // Otherwise try to fall back to a default path.
    try {
      // $FlowFB
      return require('nuclide-debugger-common/fb-constants')
        .DEVSERVER_HHVM_PATH;
    } catch (error) {
      return DEFAULT_HHVM_PATH;
    }
  }

  async getAttachTargetList(): Promise<Array<{pid: number, command: string}>> {
    const commands = await runCommand(
      'ps',
      ['-e', '-o', 'pid,args'],
      {},
    ).toPromise();
    return commands
      .toString()
      .split('\n')
      .filter(line => line.indexOf('vsDebugPort') > 0)
      .map(line => {
        const words = line.trim().split(' ');
        const pid = Number(words[0]);
        const command = words.slice(1).join(' ');
        return {
          pid,
          command,
        };
      });
  }

  dispose(): Promise<void> {
    return super.dispose();
  }
}
