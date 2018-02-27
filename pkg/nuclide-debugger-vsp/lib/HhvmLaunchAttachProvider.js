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
  DebuggerConfigAction,
  ControlButtonSpecification,
} from 'nuclide-debugger-common';
import type {
  HHVMLaunchConfig,
  HHVMAttachConfig,
} from '../../nuclide-debugger-hhvm-rpc';
import type {PhpDebuggerSessionConfig} from '../../nuclide-debugger-php-rpc';

import featureConfig from 'nuclide-commons-atom/feature-config';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {shellParse} from 'nuclide-commons/string';
import {
  DebuggerLaunchAttachProvider,
  VsAdapterTypes,
} from 'nuclide-debugger-common';
import * as React from 'react';
import {getDebuggerService} from '../../commons-atom/debugger';
import passesGK from '../../commons-node/passesGK';
import {getHhvmDebuggerServiceByNuclideUri} from '../../nuclide-remote-connection';
import {LaunchUiComponent} from './HhvmLaunchUiComponent';
import {AttachUiComponent} from './HhvmAttachUiComponent';
import invariant from 'assert';
import {getHhvmAdapterInfo, getPhpXDebugAdapterInfo} from './utils';
import VspProcessInfo from './VspProcessInfo';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

const CUSTOM_CPABILITIES = {
  completionsRequest: true,
  conditionalBreakpoints: true,
  continueToLocation: true,
  setVariable: true,
  threads: true,
};

const CUSTOM_ATTACH_PROPERTIES = {
  customControlButtons: getCustomControlButtons(),
  threadsComponentTitle: 'Requests',
};

function getCustomControlButtons(): Array<ControlButtonSpecification> {
  const customControlButtons = [
    {
      icon: 'link-external',
      title: 'Toggle HTTP Request Sender',
      onClick: () =>
        atom.commands.dispatch(
          atom.views.getView(atom.workspace),
          'nuclide-http-request-sender:toggle-http-request-edit-dialog',
        ),
    },
  ];

  try {
    return customControlButtons.concat(
      // $FlowFB
      require('./fb-HhvmServices').customControlButtons,
    );
  } catch (_) {
    return customControlButtons;
  }
}

export default class HhvmLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
  }

  getCallbacksForAction(action: DebuggerConfigAction) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (): Promise<boolean> => {
        return Promise.resolve(nuclideUri.isRemote(this.getTargetUri()));
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action)
        .getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (
        debuggerTypeName: string,
        configIsValidChanged: (valid: boolean) => void,
      ) => {
        if (action === 'launch') {
          return (
            <LaunchUiComponent
              targetUri={this.getTargetUri()}
              configIsValidChanged={configIsValidChanged}
              getLaunchProcessInfo={getLaunchProcessInfo}
            />
          );
        } else if (action === 'attach') {
          return (
            <AttachUiComponent
              targetUri={this.getTargetUri()}
              configIsValidChanged={configIsValidChanged}
              getAttachProcessInfo={getAttachProcessInfo}
            />
          );
        } else {
          invariant(false, 'Unrecognized action for component.');
        }
      },
    };
  }

  dispose(): void {}
}

// BEGIN XDEBUG STUFF: This will go away once XDebug support is dropped.
function getConfig(): PhpDebuggerSessionConfig {
  return (featureConfig.get('nuclide-debugger-php'): any);
}

function isValidRegex(value: ?string): boolean {
  if (value == null) {
    return false;
  }
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }
  return true;
}

function validateConfig(config): void {
  const {attachScriptRegex} = config;
  if (!isValidRegex(attachScriptRegex)) {
    invariant(attachScriptRegex != null);
    throw Error(
      `config scriptRegex is not a valid regular expression: ${attachScriptRegex}`,
    );
  }

  if (!isValidRegex(config.idekeyRegex)) {
    invariant(config.idekeyRegex != null);
    throw Error(
      `config idekeyRegex is not a valid regular expression: ${
        config.idekeyRegex
      }`,
    );
  }
}

function _getSessionConfig(
  targetUri: string,
  isLaunch: boolean,
): PhpDebuggerSessionConfig {
  const config = getConfig();
  validateConfig(config);
  const sessionConfig: PhpDebuggerSessionConfig = {
    xdebugAttachPort: config.xdebugAttachPort,
    xdebugLaunchingPort: config.xdebugLaunchingPort,
    targetUri,
    logLevel: config.logLevel,
    endDebugWhenNoRequests: false,
    phpRuntimePath: config.phpRuntimePath,
    phpRuntimeArgs: config.phpRuntimeArgs,
    scriptArguments: [],
    dummyRequestFilePath: 'php_only_xdebug_request.php',
    stopOneStopAll: false,
    attachScriptRegex: config.attachScriptRegex,
    idekeyRegex: config.idekeyRegex,
    deferLaunch: config.deferLaunch || false,
  };
  if (isLaunch) {
    sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
  }
  return sessionConfig;
}

function _getPhpXDebugLaunchConfig(
  targetUri: NuclideUri,
  scriptPath: string,
  scriptArgs: string,
  scriptWrapperCommand: ?string,
): Object {
  // TODO: Ericblue - this will be cleaned up when the old debugger
  // is removed. For now we need to leave both in place until the new
  // one is ready.
  // Use XDebug configuration.
  const sessionConfig = _getSessionConfig(nuclideUri.getPath(targetUri), true);

  // Set config related to script launching.
  sessionConfig.endDebugWhenNoRequests = true;
  sessionConfig.launchScriptPath = scriptPath;

  if (scriptArgs !== '') {
    sessionConfig.scriptArguments = shellParse(scriptArgs);
  }

  if (scriptWrapperCommand != null && scriptWrapperCommand !== '') {
    sessionConfig.launchWrapperCommand = scriptWrapperCommand;
  }

  return sessionConfig;
}

// --- END XDEBUG STUFF

async function _useNewDebugger(): Promise<boolean> {
  const userConfig = getConfig();
  const useXDebug = userConfig.useXDebug != null ? userConfig.useXDebug : false;
  const useNewDebugger =
    !useXDebug && (await passesGK('nuclide_hhvm_debugger_vscode'));
  return useNewDebugger;
}

// Determines the debug configuration for launching the HHVM debugger
async function _getHHVMLaunchConfig(
  targetUri: NuclideUri,
  scriptPath: string,
  scriptArgs: string,
  scriptWrapperCommand: ?string,
  runInTerminal: boolean,
  cwdPath: string,
): Promise<Object> {
  const userConfig = getConfig();
  const deferLaunch = runInTerminal;

  // Honor any PHP configuration the user has in Nuclide settings.
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
    targetUri: nuclideUri.getPath(targetUri),
    action: 'launch',
    launchScriptPath: scriptPath,
    scriptArgs: shellParse(scriptArgs),
    hhvmRuntimeArgs,
    deferLaunch,
  };

  if (cwdPath != null && cwdPath !== '') {
    config.cwd = cwdPath;
  }

  if (phpRuntimePath != null) {
    config.hhvmRuntimePath = phpRuntimePath;
  }

  if (scriptWrapperCommand != null) {
    config.launchWrapperCommand = scriptWrapperCommand;
  }

  const service = getHhvmDebuggerServiceByNuclideUri(targetUri);

  if (deferLaunch) {
    // This is a launch in terminal request. Perform the launch and then
    // return an attach configuration.
    const startupArgs = await service.getLaunchArgs(config);

    // Launch the script and then convert this to an attach operation.
    const hostname = nuclideUri.getHostname(targetUri);
    const launchUri = nuclideUri.createRemoteUri(hostname, scriptPath);

    const remoteService = await getDebuggerService();
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
      targetUri: nuclideUri.getPath(targetUri),
      action: 'attach',
      debugPort: startupArgs.debugPort,
    };

    return service.getDebuggerArgs(attachConfig);
  }

  return service.getDebuggerArgs(config);
}

export async function getLaunchProcessInfo(
  targetUri: NuclideUri,
  scriptPath: string,
  scriptArgs: string,
  scriptWrapperCommand: ?string,
  runInTerminal: boolean,
  cwdPath: string,
): Promise<VspProcessInfo> {
  const useNewDebugger = await _useNewDebugger();
  let adapterExecutable;
  let adapterType;
  let config;
  if (!useNewDebugger) {
    adapterExecutable = await getPhpXDebugAdapterInfo(targetUri);
    config = {
      config: _getPhpXDebugLaunchConfig(
        targetUri,
        scriptPath,
        scriptArgs,
        scriptWrapperCommand,
      ),
      trace: false,
    };
    adapterType = VsAdapterTypes.PHP_XDEBUG;
  } else {
    adapterExecutable = await getHhvmAdapterInfo(targetUri);
    config = await _getHHVMLaunchConfig(
      targetUri,
      scriptPath,
      scriptArgs,
      scriptWrapperCommand,
      runInTerminal,
      cwdPath,
    );
    adapterType = VsAdapterTypes.HHVM;
  }
  return new VspProcessInfo(
    targetUri,
    'launch',
    adapterType,
    adapterExecutable,
    config,
    CUSTOM_CPABILITIES,
  );
}

async function _getHHVMAttachConfig(targetUri: NuclideUri): Object {
  // Note: not specifying startup document or debug port here, the backend
  // will use the default parameters. We can surface these options in the
  // Attach Dialog if users need to be able to customize them in the future.
  const config: HHVMAttachConfig = {
    targetUri: nuclideUri.getPath(targetUri),
    action: 'attach',
  };

  let debugPort = null;
  try {
    // $FlowFB
    const fetch = require('../../commons-node/fb-sitevar').fetchSitevarOnce;
    debugPort = await fetch('NUCLIDE_HHVM_DEBUG_PORT');
  } catch (e) {}

  if (debugPort != null) {
    config.debugPort = debugPort;
  }

  return config;
}

export async function getAttachProcessInfo(
  targetUri: NuclideUri,
  attachPort: ?number,
): Promise<VspProcessInfo> {
  const useNewDebugger = await _useNewDebugger();
  let adapterExecutable;
  let config;
  let processInfo;
  if (!useNewDebugger) {
    adapterExecutable = await getPhpXDebugAdapterInfo(targetUri);
    config = {
      config: _getSessionConfig(nuclideUri.getPath(targetUri), false),
      trace: false,
    };
    processInfo = new VspProcessInfo(
      targetUri,
      // The legacy XDebug adapter only accepts `launch` requests,
      // but handles `attach` configurations.
      'launch',
      VsAdapterTypes.PHP_XDEBUG,
      adapterExecutable,
      config,
      CUSTOM_CPABILITIES,
      CUSTOM_ATTACH_PROPERTIES,
    );
  } else {
    adapterExecutable = await getHhvmAdapterInfo(targetUri);
    config = await _getHHVMAttachConfig(targetUri);
    processInfo = new VspProcessInfo(
      targetUri,
      'attach',
      VsAdapterTypes.HHVM,
      adapterExecutable,
      config,
      CUSTOM_CPABILITIES,
      CUSTOM_ATTACH_PROPERTIES,
    );
  }
  try {
    // $FlowFB
    const services = require('./fb-HhvmServices');
    services.startSlog();
    processInfo.setCustomDisposable(
      new UniversalDisposable(() => services.stopSlog()),
    );
  } catch (_) {}
  return processInfo;
}
