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

import featureConfig from 'nuclide-commons-atom/feature-config';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {shellParse} from 'nuclide-commons/string';
import {
  DebuggerLaunchAttachProvider,
  VsAdapterTypes,
} from 'nuclide-debugger-common';
import * as React from 'react';
import {getDebuggerService} from '../../commons-atom/debugger';
import {getHhvmDebuggerServiceByNuclideUri} from '../../nuclide-remote-connection';
import {LaunchUiComponent} from './HhvmLaunchUiComponent';
import {AttachUiComponent} from './HhvmAttachUiComponent';
import invariant from 'assert';
import {getHhvmAdapterInfo} from './utils';
import VspProcessInfo from './VspProcessInfo';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

type PhpDebuggerSessionConfig = {
  hhvmRuntimeArgs: string,
  hhvmRuntimePath: string,
};

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

function getConfig(): PhpDebuggerSessionConfig {
  return (featureConfig.get('nuclide-debugger-php'): any);
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
  const adapterExecutable = await getHhvmAdapterInfo(targetUri);
  const config = await _getHHVMLaunchConfig(
    targetUri,
    scriptPath,
    scriptArgs,
    scriptWrapperCommand,
    runInTerminal,
    cwdPath,
  );
  const adapterType = VsAdapterTypes.HHVM;
  return new VspProcessInfo(
    targetUri,
    runInTerminal ? 'attach' : 'launch',
    adapterType,
    adapterExecutable,
    config,
    CUSTOM_CPABILITIES,
  );
}

async function _getHHVMAttachConfig(
  targetUri: NuclideUri,
  attachPort: ?number,
): Promise<Object> {
  // Note: not specifying startup document or debug port here, the backend
  // will use the default parameters. We can surface these options in the
  // Attach Dialog if users need to be able to customize them in the future.
  const config: HHVMAttachConfig = {
    targetUri: nuclideUri.getPath(targetUri),
    action: 'attach',
  };

  if (attachPort != null) {
    config.debugPort = attachPort;
  }

  const service = getHhvmDebuggerServiceByNuclideUri(targetUri);
  return service.getDebuggerArgs(config);
}

export async function getAttachProcessInfo(
  targetUri: NuclideUri,
  attachPort: ?number,
  serverAttach: boolean,
): Promise<VspProcessInfo> {
  const adapterExecutable = await getHhvmAdapterInfo(targetUri);
  const config = await _getHHVMAttachConfig(targetUri, attachPort);
  const processInfo = new VspProcessInfo(
    targetUri,
    'attach',
    VsAdapterTypes.HHVM,
    adapterExecutable,
    config,
    CUSTOM_CPABILITIES,
    CUSTOM_ATTACH_PROPERTIES,
  );
  try {
    // $FlowFB
    const services = require('./fb-HhvmServices');
    services.startSlog();

    if (serverAttach) {
      services.startCrashHandler(targetUri, processInfo, getAttachProcessInfo);
    }

    processInfo.addCustomDisposable(
      new UniversalDisposable(() => {
        services.stopSlog();

        if (serverAttach) {
          services.stopCrashHandler(processInfo);
        }
      }),
    );
  } catch (_) {}
  return processInfo;
}
