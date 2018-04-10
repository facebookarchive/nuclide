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
  VSAdapterExecutableInfo,
  VsAdapterType,
} from 'nuclide-debugger-common';
import type {AutoGenConfig} from 'nuclide-debugger-common/types';
import type {
  PythonDebuggerAttachTarget,
  RemoteDebugCommandRequest,
} from 'nuclide-debugger-vsps/RemoteDebuggerCommandService';
import type {ReactNativeAttachArgs, ReactNativeLaunchArgs} from './types';

import {diffSets, fastDebounce} from 'nuclide-commons/observable';
import * as React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Logger} from 'vscode-debugadapter';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes, VspProcessInfo} from 'nuclide-debugger-common';
import {generatePropertyArray} from 'nuclide-debugger-common/autogen-utils';
import {
  ServerConnection,
  getRemoteDebuggerCommandServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {getLogger} from 'log4js';
import {Observable} from 'rxjs';
import {track} from '../../nuclide-analytics';
import {isRunningInTest} from '../../commons-node/system-info';

const DEFAULT_DEBUG_OPTIONS = new Set([
  'WaitOnAbnormalExit',
  'WaitOnNormalExit',
  'RedirectOutput',
]);

export const NUCLIDE_PYTHON_DEBUGGER_DEX_URI =
  'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';

export const REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

// Delay starting the remote debug server to avoid affecting Nuclide's startup.
const REMOTE_DEBUG_SERVICES_DELAYED_STARTUP_MS = 10 * 1000;

export type VspNativeDebuggerLaunchBuilderParms = {
  args: Array<string>,
  cwd: string,
  env: Array<string>,
  sourcePath: string,
};

export type VspNativeDebuggerAttachBuilderParms = {
  pid?: number,
  sourcePath: string,
};

export async function getPythonParLaunchProcessInfo(
  parPath: NuclideUri,
  args: Array<string>,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    parPath,
    'launch',
    VsAdapterTypes.PYTHON,
    null,
    getPythonParConfig(parPath, args),
    {threads: true},
  );
}

export function getPythonAutoGenConfig(): AutoGenConfig {
  const pkgJson = require('../../../modules/nuclide-debugger-vsps/VendorLib/vs-py-debugger/package.json');
  const configurationAttributes =
    pkgJson.contributes.debuggers[0].configurationAttributes;
  configurationAttributes.launch.properties.pythonPath.description =
    'Path (fully qualified) to python executable.';
  const launchProperties = {};
  const launchRequired = ['pythonPath', 'program', 'cwd'];
  const launchVisible = launchRequired.concat(['args', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(
    launchVisible.concat(['console', 'debugOptions']),
  );

  Object.entries(configurationAttributes.launch.properties)
    .filter(property => launchWhitelisted.has(property[0]))
    .forEach(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      // TODO(goom): replace the indexOf '$' stuff with logic that accesses settings
      if (
        propertyDetails.default != null &&
        typeof propertyDetails.default === 'string' &&
        propertyDetails.default.indexOf('$') === 0
      ) {
        delete propertyDetails.default;
      }
      launchProperties[name] = propertyDetails;
    });

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.PYTHON,
      threads: true,
      properties: generatePropertyArray(
        launchProperties,
        launchRequired,
        launchVisible,
      ),
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: (
        <p>
          This is intended to debug python script files.
          <br />
          To debug buck targets, you should{' '}
          <a href={NUCLIDE_PYTHON_DEBUGGER_DEX_URI}>
            use the buck toolbar instead
          </a>.
        </p>
      ),
    },
    attach: null,
  };
}

function getPythonParConfig(parPath: NuclideUri, args: Array<string>): Object {
  const localParPath = nuclideUri.getPath(parPath);
  const cwd = nuclideUri.dirname(localParPath);
  return {
    stopOnEntry: false,
    console: 'none',
    // Will be replaced with the main module at runtime.
    program: '/dev/null',
    args,
    debugOptions: Array.from(DEFAULT_DEBUG_OPTIONS),
    pythonPath: localParPath,
    cwd,
  };
}

async function getPythonAttachTargetProcessInfo(
  targetRootUri: NuclideUri,
  target: PythonDebuggerAttachTarget,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    targetRootUri,
    'attach',
    VsAdapterTypes.PYTHON,
    null,
    getPythonAttachTargetConfig(target),
    {threads: true},
  );
}

function getPythonAttachTargetConfig(
  target: PythonDebuggerAttachTarget,
): Object {
  const debugOptions = new Set(DEFAULT_DEBUG_OPTIONS);
  (target.debugOptions || []).forEach(opt => debugOptions.add(opt));
  return {
    localRoot: target.localRoot,
    remoteRoot: target.remoteRoot,
    // debugOptions: Array.from(debugOptions),
    port: target.port,
    host: '127.0.0.1',
  };
}

function rootUriOfConnection(connection: ?ServerConnection): string {
  return connection == null ? '' : connection.getUriOfRemotePath('/');
}

export function getPrepackAutoGenConfig(): AutoGenConfig {
  const fileToPrepack = {
    name: 'sourceFile',
    type: 'string',
    description: 'Input the file you want to Prepack',
    required: true,
    visible: true,
  };
  const prepackRuntimePath = {
    name: 'prepackRuntime',
    type: 'string',
    description:
      'Prepack executable path (e.g. lib/prepack-cli.js). Will use default prepack command if not provided',
    required: false,
    visible: true,
  };
  const argumentsProperty = {
    name: 'prepackArguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to start Prepack',
    required: false,
    defaultValue: '',
    visible: true,
  };

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType: VsAdapterTypes.PREPACK,
    threads: false,
    properties: [fileToPrepack, prepackRuntimePath, argumentsProperty],
    scriptPropertyName: 'fileToPrepack',
    scriptExtension: '.js',
    cwdPropertyName: null,
    header: null,
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null,
  };
}

export function getOCamlAutoGenConfig(): AutoGenConfig {
  const debugExecutable = {
    name: 'ocamldebugExecutable',
    type: 'string',
    description: 'Path to ocamldebug or launch script',
    required: true,
    visible: true,
  };
  const executablePath = {
    name: 'executablePath',
    type: 'string',
    description:
      'Input the executable path you want to launch (leave blank if using an ocamldebug launch script)',
    required: false,
    visible: true,
  };
  const argumentsProperty = {
    name: 'arguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
    visible: true,
  };
  const environmentVariables = {
    name: 'environmentVariables',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
    visible: true,
  };
  const workingDirectory = {
    name: 'workingDirectory',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true,
    visible: true,
  };
  const additionalIncludeDirectories = {
    name: 'includeDirectories',
    type: 'array',
    itemType: 'string',
    description:
      'Additional include directories that debugger will use to search for source code',
    required: false,
    defaultValue: '',
    visible: true,
  };
  const breakAfterStart = {
    name: 'breakAfterStart',
    type: 'boolean',
    description: '',
    required: false,
    defaultValue: true,
    visible: true,
  };
  const logLevel = {
    name: 'logLevel',
    type: 'string',
    description: '',
    required: false,
    defaultValue: Logger.LogLevel.Verbose,
    visible: false,
  };

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType: VsAdapterTypes.OCAML,
    threads: false,
    properties: [
      debugExecutable,
      executablePath,
      argumentsProperty,
      environmentVariables,
      workingDirectory,
      additionalIncludeDirectories,
      breakAfterStart,
      logLevel,
    ],
    scriptPropertyName: 'executable',
    scriptExtension: '.ml',
    cwdPropertyName: 'working directory',
    header: null,
  };
  return {
    launch: autoGenLaunchConfig,
    attach: null,
  };
}

async function lldbVspAdapterWrapperPath(program: string): Promise<string> {
  try {
    // $FlowFB
    return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
  } catch (ex) {
    return 'lldb-vscode';
  }
}

async function getNativeVSPAdapterExecutable(
  adapter: VsAdapterType,
  program: string,
): Promise<?VSAdapterExecutableInfo> {
  if (adapter === 'native_gdb') {
    return null;
  }

  const adapterInfo = {
    command: await lldbVspAdapterWrapperPath(program),
    args: [],
  };

  return adapterInfo;
}

export async function getNativeVSPLaunchProcessInfo(
  adapter: VsAdapterType,
  program: NuclideUri,
  args: VspNativeDebuggerLaunchBuilderParms,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNativeVSPAdapterExecutable(adapter, program);
  return new VspProcessInfo(
    program,
    'launch',
    adapter,
    adapterInfo,
    {
      program: nuclideUri.getPath(program),
      ...args,
    },
    {threads: true},
  );
}

export async function getNativeVSPAttachProcessInfo(
  adapter: VsAdapterType,
  targetUri: NuclideUri,
  args: VspNativeDebuggerAttachBuilderParms,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNativeVSPAdapterExecutable(adapter, targetUri);
  return new VspProcessInfo(targetUri, 'attach', adapter, adapterInfo, args, {
    threads: true,
  });
}

export async function getReactNativeAttachProcessInfo(
  args: ReactNativeAttachArgs,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    args.program,
    'attach',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}

export async function getReactNativeLaunchProcessInfo(
  args: ReactNativeLaunchArgs,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    args.program,
    'launch',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}

export function listenToRemoteDebugCommands(): IDisposable {
  const connections = ServerConnection.observeRemoteConnections()
    .map(conns => new Set(conns))
    .let(diffSets())
    .flatMap(diff => Observable.from(diff.added))
    .startWith(null);

  const remoteDebuggerServices = connections.map(conn => {
    const rootUri = rootUriOfConnection(conn);
    const service = getRemoteDebuggerCommandServiceByNuclideUri(rootUri);

    return {service, rootUri};
  });

  const delayStartupObservable = Observable.interval(
    REMOTE_DEBUG_SERVICES_DELAYED_STARTUP_MS,
  )
    .first()
    .ignoreElements();

  return new UniversalDisposable(
    delayStartupObservable
      .switchMap(() => {
        return remoteDebuggerServices.flatMap(({service, rootUri}) => {
          return service
            .observeAttachDebugTargets()
            .refCount()
            .map(targets => findDuplicateAttachTargetIds(targets));
        });
      })
      .subscribe(duplicateTargetIds =>
        notifyDuplicateDebugTargets(duplicateTargetIds),
      ),
    delayStartupObservable
      .concat(remoteDebuggerServices)
      .flatMap(({service, rootUri}) => {
        return service
          .observeRemoteDebugCommands()
          .refCount()
          .catch(error => {
            if (!isRunningInTest()) {
              getLogger().error(
                'Failed to listen to remote debug commands - ' +
                  'You could be running locally with two Atom windows. ' +
                  `IsLocal: ${String(rootUri === '')}`,
              );
            }
            return Observable.empty();
          })
          .map((command: RemoteDebugCommandRequest) => ({rootUri, command}));
      })
      .let(fastDebounce(500))
      .subscribe(async ({rootUri, command}) => {
        const attachProcessInfo = await getPythonAttachTargetProcessInfo(
          rootUri,
          command.target,
        );
        const debuggerService = await getDebuggerService();
        track('fb-python-debugger-auto-attach');
        debuggerService.startDebugging(attachProcessInfo);
        // Otherwise, we're already debugging that target.
      }),
  );
}

let shouldNotifyDuplicateTargets = true;
let duplicateTargetsNotification;

function notifyDuplicateDebugTargets(duplicateTargetIds: Set<string>): void {
  if (
    duplicateTargetIds.size > 0 &&
    shouldNotifyDuplicateTargets &&
    duplicateTargetsNotification == null
  ) {
    const formattedIds = Array.from(duplicateTargetIds).join(', ');
    duplicateTargetsNotification = atom.notifications.addInfo(
      `Debugger: duplicate attach targets: \`${formattedIds}\``,
      {
        buttons: [
          {
            onDidClick: () => {
              shouldNotifyDuplicateTargets = false;
              if (duplicateTargetsNotification != null) {
                duplicateTargetsNotification.dismiss();
              }
            },
            text: 'Ignore',
          },
        ],
        description:
          `Nuclide debugger detected duplicate attach targets with ids (${formattedIds}) ` +
          'That could be instagram running multiple processes - check out https://our.intern.facebook.com/intern/dex/instagram-server/debugging-with-nuclide/',
        dismissable: true,
      },
    );
    duplicateTargetsNotification.onDidDismiss(() => {
      duplicateTargetsNotification = null;
    });
  }
}

function findDuplicateAttachTargetIds(
  targets: Array<PythonDebuggerAttachTarget>,
): Set<string> {
  const targetIds = new Set();
  const duplicateTargetIds = new Set();
  targets.forEach(target => {
    const {id} = target;
    if (id == null) {
      return;
    }
    if (targetIds.has(id)) {
      duplicateTargetIds.add(id);
    } else {
      targetIds.add(id);
    }
  });
  return duplicateTargetIds;
}
