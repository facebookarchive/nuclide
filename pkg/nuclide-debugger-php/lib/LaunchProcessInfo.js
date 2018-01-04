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
  HHVMLaunchConfig,
  HHVMAttachConfig,
} from '../../nuclide-debugger-hhvm-rpc';
import type {PhpDebuggerService as PhpDebuggerServiceType} from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';
import type {
  DebuggerCapabilities,
  DebuggerProperties,
} from 'nuclide-debugger-common';

import featureConfig from 'nuclide-commons-atom/feature-config';
import {DebuggerProcessInfo} from 'nuclide-debugger-common';
import {PhpDebuggerInstance} from './PhpDebuggerInstance';
import {
  getPhpDebuggerServiceByNuclideUri,
  getHhvmDebuggerServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import nuclideUri from 'nuclide-commons/nuclideUri';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

import logger from './utils';
import {getSessionConfig} from './utils';
import invariant from 'assert';
import {shellParse} from 'nuclide-commons/string';
import passesGK from '../../commons-node/passesGK';

export class LaunchProcessInfo extends DebuggerProcessInfo {
  _launchTarget: string;
  _launchWrapperCommand: ?string;
  _useTerminal: boolean;
  _scriptArguments: string;

  constructor(
    targetUri: NuclideUri,
    launchTarget: string,
    launchWrapperCommand: ?string,
    useTerminal: boolean,
    scriptArguments: ?string,
  ) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
    this._launchWrapperCommand = launchWrapperCommand;
    this._useTerminal = useTerminal;
    this._scriptArguments = scriptArguments != null ? scriptArguments : '';
  }

  clone(): LaunchProcessInfo {
    return new LaunchProcessInfo(
      this._targetUri,
      this._launchTarget,
      this._launchWrapperCommand,
      this._useTerminal,
    );
  }

  getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      ...super.getDebuggerCapabilities(),
      conditionalBreakpoints: true,
      continueToLocation: true,
      setVariable: true,
      threads: true,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    return super.getDebuggerProps();
  }

  async _hhvmDebug(): Promise<PhpDebuggerInstance> {
    const service = getHhvmDebuggerServiceByNuclideUri(this.getTargetUri());
    const hhvmDebuggerService = new service.HhvmDebuggerService();
    const remoteService = await consumeFirstProvider('nuclide-debugger.remote');
    const deferLaunch =
      this._useTerminal && remoteService.getTerminal() != null;

    // Honor any PHP configuration the user has in Nuclide settings.
    const userConfig = (featureConfig.get('nuclide-debugger-php'): any);
    const phpRuntimePath =
      userConfig.hhvmRuntimePath != null
        ? String(userConfig.hhvmRuntimePath)
        : null;
    const hhvmRuntimeArgs = shellParse(
      userConfig.hhvmRuntimeArgs != null
        ? String(userConfig.hhvmRuntimeArgs)
        : '',
    );

    const config: HHVMLaunchConfig = {
      targetUri: nuclideUri.getPath(this.getTargetUri()),
      action: 'launch',
      launchScriptPath: this._launchTarget,
      scriptArgs: shellParse(this._scriptArguments),
      hhvmRuntimeArgs,
      deferLaunch,
    };

    if (phpRuntimePath != null) {
      config.hhvmRuntimePath = phpRuntimePath;
    }

    if (this._launchWrapperCommand != null) {
      config.launchWrapperCommand = this._launchWrapperCommand;
    }

    logger.info(`Connection session config: ${JSON.stringify(config)}`);

    let result;
    if (deferLaunch) {
      const startupArgs = await hhvmDebuggerService.getLaunchArgs(config);

      // Launch the script and then convert this to an attach operation.
      const hostname = nuclideUri.getHostname(this.getTargetUri());
      const launchUri = nuclideUri.createRemoteUri(
        hostname,
        this._launchTarget,
      );

      invariant(remoteService != null);

      // Terminal args require everything to be a string, but debug port
      // is typed as a number.
      const terminalArgs = [];
      for (const arg of startupArgs.hhvmArgs) {
        terminalArgs.push(String(arg));
      }

      await remoteService.launchDebugTargetInTerminal(
        launchUri,
        startupArgs.hhvmPath,
        terminalArgs,
        nuclideUri.dirname(launchUri),
        new Map(),
      );

      const attachConfig: HHVMAttachConfig = {
        targetUri: nuclideUri.getPath(this.getTargetUri()),
        action: 'attach',
        debugPort: startupArgs.debugPort,
      };

      result = await hhvmDebuggerService.debug(attachConfig);
    } else {
      result = await hhvmDebuggerService.debug(config);
    }

    logger.info(`Launch process result: ${result}`);
    return new PhpDebuggerInstance(this, hhvmDebuggerService);
  }

  async debug(): Promise<PhpDebuggerInstance> {
    const useNewDebugger = await passesGK('nuclide_hhvm_debugger_vscode');
    if (useNewDebugger) {
      // TODO: Ericblue - this will be cleaned up when the old debugger
      // is removed. For now we need to leave both in place until the new
      // one is ready.
      return this._hhvmDebug();
    }

    const rpcService = this._getRpcService();
    const sessionConfig = getSessionConfig(
      nuclideUri.getPath(this.getTargetUri()),
      true,
    );

    // Set config related to script launching.
    sessionConfig.endDebugWhenNoRequests = true;
    sessionConfig.launchScriptPath = this._launchTarget;

    if (this._scriptArguments !== '') {
      sessionConfig.scriptArguments = shellParse(this._scriptArguments);
    }

    if (this._launchWrapperCommand != null) {
      sessionConfig.launchWrapperCommand = this._launchWrapperCommand;
    }

    const remoteService = await consumeFirstProvider('nuclide-debugger.remote');
    const deferLaunch = (sessionConfig.deferLaunch =
      this._useTerminal && remoteService.getTerminal() != null);

    logger.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);

    const result = await rpcService.debug(sessionConfig);
    logger.info(`Launch process result: ${result}`);

    if (deferLaunch) {
      const hostname = nuclideUri.getHostname(this.getTargetUri());
      const launchUri = nuclideUri.createRemoteUri(
        hostname,
        this._launchTarget,
      );
      const runtimeArgs = shellParse(sessionConfig.phpRuntimeArgs);
      const scriptArgs = shellParse(this._launchTarget);

      invariant(remoteService != null);
      await remoteService.launchDebugTargetInTerminal(
        launchUri,
        sessionConfig.launchWrapperCommand != null
          ? sessionConfig.launchWrapperCommand
          : sessionConfig.phpRuntimePath,
        [...runtimeArgs, ...scriptArgs, ...sessionConfig.scriptArguments],
        nuclideUri.dirname(launchUri),
        new Map(),
      );
    }

    return new PhpDebuggerInstance(this, rpcService);
  }

  _getRpcService(): PhpDebuggerServiceType {
    const service = getPhpDebuggerServiceByNuclideUri(this.getTargetUri());
    return new service.PhpDebuggerService();
  }
}
