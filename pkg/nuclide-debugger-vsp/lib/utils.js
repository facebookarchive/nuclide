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
import type {OCamlDebugStartInfo} from '../../../modules/nuclide-debugger-vsps/vscode-ocaml/OCamlDebugger';
import type {
  PythonDebuggerAttachTarget,
  RemoteDebugCommandRequest,
} from '../../nuclide-debugger-vsp-rpc/lib/RemoteDebuggerCommandService';
import type {Adapter} from 'nuclide-debugger-vsps/main';
import type {
  ReactNativeAttachArgs,
  ReactNativeLaunchArgs,
  AutoGenConfig,
  AutoGenProperty,
} from './types';

import invariant from 'assert';
import {shellParse} from 'nuclide-commons/string';
import nullthrows from 'nullthrows';
import {diffSets, fastDebounce} from 'nuclide-commons/observable';
import * as React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Logger} from 'vscode-debugadapter';
import {getDebuggerService} from '../../commons-atom/debugger';
import VspProcessInfo from './VspProcessInfo';
import nuclideUri from 'nuclide-commons/nuclideUri';
// eslint-disable-next-line rulesdir/no-unresolved
import {VsAdapterTypes} from 'nuclide-debugger-common/main';
import {
  ServerConnection,
  getRemoteDebuggerCommandServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {getLogger} from 'log4js';
import {Observable} from 'rxjs';
import {track} from '../../nuclide-analytics';
import {isRunningInTest} from '../../commons-node/system-info';
import {getNodeBinaryPath} from '../../commons-node/node-info';

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

// extension must be a string starting with a '.' like '.js' or '.py'
export function getActiveScriptPath(extension: string): string {
  const center = atom.workspace.getCenter
    ? atom.workspace.getCenter()
    : atom.workspace;
  const activeEditor: ?atom$TextEditor = center.getActiveTextEditor();
  if (
    activeEditor == null ||
    !activeEditor.getPath() ||
    !nullthrows(activeEditor.getPath()).endsWith(extension)
  ) {
    return '';
  }
  return nuclideUri.getPath(nullthrows(activeEditor.getPath()));
}

function generatePropertyArray(
  launchOrAttachConfigProperties: Object,
  required: string[],
): AutoGenProperty[] {
  const propertyArray = Object.entries(launchOrAttachConfigProperties)
    .map(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      const autoGenProperty: AutoGenProperty = {
        name,
        type: propertyDetails.type,
        description: propertyDetails.description,
        required: required.includes(name),
      };
      if (typeof propertyDetails.default !== 'undefined') {
        autoGenProperty.defaultValue = propertyDetails.default;
      }
      if (
        propertyDetails.items != null &&
        typeof propertyDetails.items.type !== 'undefined'
      ) {
        autoGenProperty.itemType = propertyDetails.items.type;
      }
      return autoGenProperty;
    })
    .sort((p1, p2) => {
      if (p1.required && !p2.required) {
        return -1;
      }
      if (p2.required && !p1.required) {
        return 1;
      }
      return 0;
    });
  return propertyArray;
}

export async function getPythonParLaunchProcessInfo(
  parPath: NuclideUri,
  args: Array<string>,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    parPath,
    'launch',
    VsAdapterTypes.PYTHON,
    await getPythonAdapterInfo(parPath),
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
  const usedLaunchProperties = new Set([
    'pythonPath',
    'program',
    'args',
    'cwd',
    'env',
  ]);
  Object.entries(configurationAttributes.launch.properties)
    .filter(property => usedLaunchProperties.has(property[0]))
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
      properties: generatePropertyArray(launchProperties, launchRequired),
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

export async function pythonHandleLaunchButtonClick(
  targetUri: NuclideUri,
  stringValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  enumValues: Map<string, string>,
  numberValues: Map<string, number>,
): Promise<void> {
  track('fb-python-debugger-launch-from-dialog');
  const pythonPath = nullthrows(stringValues.get('pythonPath')).trim();
  const scriptPath = nullthrows(stringValues.get('program')).trim();
  const args = shellParse(nullthrows(stringValues.get('args')));
  const workingDirectory = nullthrows(stringValues.get('cwd')).trim();
  const environmentVariables = {};
  shellParse(nullthrows(stringValues.get('env'))).forEach(variable => {
    const [key, value] = variable.split('=');
    environmentVariables[key] = value;
  });

  const {hostname} = nuclideUri.parse(targetUri);
  const scriptUri =
    hostname != null
      ? nuclideUri.createRemoteUri(hostname, scriptPath)
      : scriptPath;

  const launchInfo = await getPythonScriptLaunchProcessInfo(
    scriptUri,
    pythonPath,
    args,
    workingDirectory,
    environmentVariables,
  );

  const debuggerService = await getDebuggerService();
  debuggerService.startDebugging(launchInfo);
}

export async function getPythonScriptLaunchProcessInfo(
  scriptPath: NuclideUri,
  pythonPath: string,
  args: Array<string>,
  cwd: string,
  env: Object,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    scriptPath,
    'launch',
    VsAdapterTypes.PYTHON,
    await getPythonAdapterInfo(scriptPath),
    getPythonScriptConfig(scriptPath, pythonPath, cwd, args, env),
    {threads: true},
  );
}

async function getAdapterExecutableWithProperNode(
  adapterType: Adapter,
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  const service = getRemoteDebuggerCommandServiceByNuclideUri(path);
  const adapterInfo = await service.getAdapterExecutableInfo(adapterType);

  if (adapterInfo.command === 'node') {
    adapterInfo.command = await getNodeBinaryPath(path);
  }

  return adapterInfo;
}

async function getPythonAdapterInfo(
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getAdapterExecutableWithProperNode('python', path);
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

function getPythonScriptConfig(
  scriptPath: NuclideUri,
  pythonPath: string,
  cwd: string,
  args: Array<string>,
  env: Object,
): Object {
  return {
    stopOnEntry: false,
    console: 'none',
    program: nuclideUri.getPath(scriptPath),
    cwd,
    args,
    env,
    debugOptions: Array.from(DEFAULT_DEBUG_OPTIONS),
    pythonPath,
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
    await getPythonAdapterInfo(targetRootUri),
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

function notifyOpenDebugSession(): void {
  atom.notifications.addInfo(
    "Received a remote debug request, but there's an open debug session already!",
    {
      detail:
        'To be able to remote debug, please terminate your existing session',
    },
  );
}
export async function getPrepackLaunchProcessInfo(
  scriptPath: NuclideUri,
  prepackPath: string,
  args: Array<string>,
): Promise<VspProcessInfo> {
  const adapterInfo = await getPrepackAdapterInfo(scriptPath);
  return new VspProcessInfo(
    scriptPath,
    'launch',
    VsAdapterTypes.PREPACK,
    adapterInfo,
    getPrepackScriptConfig(scriptPath, prepackPath, args),
    {threads: false},
  );
}

async function getPrepackAdapterInfo(
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getAdapterExecutableWithProperNode('prepack', path);
}

function getPrepackScriptConfig(
  scriptPath: NuclideUri,
  prepackPath: string,
  args: Array<string>,
): Object {
  return {
    sourceFile: nuclideUri.getPath(scriptPath),
    prepackRuntime: prepackPath,
    prepackArguments: args,
  };
}

export function getNodeAutoGenConfig(): AutoGenConfig {
  const pkgJson = require('../../../modules/nuclide-debugger-vsps/VendorLib/vscode-node-debug2/package.json');
  const pkgJsonDescriptions = require('../../../modules/nuclide-debugger-vsps/VendorLib/vscode-node-debug2/package.nls.json');
  const configurationAttributes =
    pkgJson.contributes.debuggers[1].configurationAttributes;
  Object.entries(configurationAttributes.launch.properties).forEach(
    property => {
      const name = property[0];
      const descriptionSubstitution =
        configurationAttributes.launch.properties[name].description;
      if (
        descriptionSubstitution != null &&
        typeof descriptionSubstitution === 'string'
      ) {
        configurationAttributes.launch.properties[name].description =
          pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
      }
    },
  );
  configurationAttributes.launch.properties.nodePath = {
    type: 'string',
    description:
      "Node executable path (e.g. /usr/local/bin/node). Will use Nuclide's node version if not provided.",
    default: '',
  };
  Object.entries(configurationAttributes.attach.properties).forEach(
    property => {
      const name = property[0];
      const descriptionSubstitution =
        configurationAttributes.attach.properties[name].description;
      if (
        descriptionSubstitution != null &&
        typeof descriptionSubstitution === 'string'
      ) {
        configurationAttributes.attach.properties[name].description =
          pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
      }
    },
  );

  const launchProperties = {};
  const attachProperties = {};
  const launchRequired = ['program', 'cwd'];
  const attachRequired = ['port'];

  const usedLaunchProperties = new Set(
    launchRequired.concat(['nodePath', 'args', 'outFiles', 'env']),
  );

  Object.entries(configurationAttributes.launch.properties)
    .filter(property => usedLaunchProperties.has(property[0]))
    .forEach(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      launchProperties[name] = propertyDetails;
    });

  const usedAttachProperties = new Set(['port']);

  Object.entries(configurationAttributes.attach.properties)
    .filter(property => usedAttachProperties.has(property[0]))
    .forEach(property => {
      const name = property[0];
      const propertyDetails: any = property[1];
      attachProperties[name] = propertyDetails;
    });

  return {
    launch: {
      launch: true,
      properties: generatePropertyArray(launchProperties, launchRequired),
      scriptPropertyName: 'program',
      cwdPropertyName: 'cwd',
      scriptExtension: '.js',
      header: (
        <p>This is intended to debug node.js files (for node version 6.3+).</p>
      ),
    },
    attach: {
      launch: false,
      properties: generatePropertyArray(attachProperties, attachRequired),
      header: <p>Attach to a running node.js process</p>,
    },
  };
}

export async function nodeHandleAttachButtonClick(
  targetUri: NuclideUri,
  stringValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  enumValues: Map<string, string>,
  numberValues: Map<string, number>,
): Promise<void> {
  track('fb-node-debugger-attach-from-dialog');
  const port = numberValues.get('port');
  invariant(port != null);
  const attachInfo = await getNodeAttachProcessInfo(targetUri, port);
  const debuggerService = await getDebuggerService();
  debuggerService.startDebugging(attachInfo);
}

export async function nodeHandleLaunchButtonClick(
  targetUri: NuclideUri,
  stringValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  enumValues: Map<string, string>,
  numberValues: Map<string, number>,
): Promise<void> {
  track('fb-node-debugger-launch-from-dialog');
  const nodePath = nullthrows(stringValues.get('nodePath')).trim();
  const scriptPath = nullthrows(stringValues.get('program')).trim();
  const args = shellParse(nullthrows(stringValues.get('args')));
  const workingDirectory = nullthrows(stringValues.get('cwd')).trim();
  const outFiles = nullthrows(stringValues.get('outFiles')).trim();
  const environmentVariables = {};
  shellParse(nullthrows(stringValues.get('env'))).forEach(variable => {
    const [key, value] = variable.split('=');
    environmentVariables[key] = value;
  });

  const {hostname} = nuclideUri.parse(targetUri);
  const scriptUri =
    hostname != null
      ? nuclideUri.createRemoteUri(hostname, scriptPath)
      : scriptPath;

  const launchInfo = await getNodeLaunchProcessInfo(
    scriptUri,
    nodePath,
    args,
    workingDirectory,
    environmentVariables,
    outFiles,
  );
  const debuggerService = await getDebuggerService();
  debuggerService.startDebugging(launchInfo);
}

export async function getNodeLaunchProcessInfo(
  scriptPath: NuclideUri,
  nodePath: string,
  args: Array<string>,
  cwd: string,
  env: Object,
  outFiles: string,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNodeAdapterInfo(scriptPath);
  return new VspProcessInfo(
    scriptPath,
    'launch',
    VsAdapterTypes.NODE,
    adapterInfo,
    getNodeScriptConfig(
      scriptPath,
      nodePath.length > 0 ? nodePath : adapterInfo.command,
      cwd,
      args,
      env,
      outFiles,
    ),
    {threads: false},
  );
}

export function getOCamlAutoGenConfig(): AutoGenConfig {
  const debugExecutable = {
    name: 'ocamldebug executable',
    type: 'string',
    description: 'Path to ocamldebug or launch script',
    required: true,
  };
  const executable = {
    name: 'executable',
    type: 'string',
    description:
      'Input the executable path you want to launch (leave blank if using an ocamldebug launch script)',
    required: false,
  };
  const argumentsProperty = {
    name: 'arguments',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
  };
  const environmentVariables = {
    name: 'environment variables',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
  };
  const workingDirectory = {
    name: 'working directory',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true,
  };
  const additionalIncludeDirectories = {
    name: 'additional include directories',
    type: 'array',
    itemType: 'string',
    description:
      'Additional include directories that debugger will use to search for source code',
    required: false,
    defaultValue: '',
  };
  const breakAfterStart = {
    name: 'break after start',
    type: 'boolean',
    description: '',
    required: false,
    defaultValue: true,
  };
  const autoGenLaunchConfig = {
    launch: true,
    properties: [
      debugExecutable,
      executable,
      argumentsProperty,
      environmentVariables,
      workingDirectory,
      additionalIncludeDirectories,
      breakAfterStart,
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

export async function ocamlHandleLaunchButtonClick(
  targetUri: NuclideUri,
  stringValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  enumValues: Map<string, string>,
  numberValues: Map<string, number>,
): Promise<void> {
  track('fb-ocaml-debugger-launch-from-dialog');
  const _expandIfLocal = (path: NuclideUri) => {
    if (nuclideUri.isRemote(targetUri)) {
      // TODO: support expansion for remote paths.
      return path;
    }
    return nuclideUri.expandHomeDir(path);
  };
  // TODO: perform some validation for the input.
  const launchExecutable = _expandIfLocal(
    (stringValues.get('executable') || '').trim(),
  );
  const ocamldebugExecutable = _expandIfLocal(
    nullthrows(stringValues.get('ocamldebug executable')).trim(),
  );
  const launchArguments = shellParse(nullthrows(stringValues.get('arguments')));
  const launchEnvironmentVariables = shellParse(
    nullthrows(stringValues.get('environment variables')),
  );
  const launchWorkingDirectory = _expandIfLocal(
    nullthrows(stringValues.get('working directory')).trim(),
  );
  const additionalIncludeDirectories = shellParse(
    nullthrows(stringValues.get('additional include directories')),
  );
  const breakAfterStart = nullthrows(booleanValues.get('break after start'));
  const launchTarget = {
    ocamldebugExecutable,
    executablePath: launchExecutable,
    arguments: launchArguments,
    environmentVariables: launchEnvironmentVariables,
    workingDirectory: launchWorkingDirectory,
    includeDirectories: additionalIncludeDirectories,
    breakAfterStart,
    targetUri,
    logLevel: Logger.LogLevel.Verbose, // TODO: read from configuration
  };

  const debuggerService = await getDebuggerService();
  const launchProcessInfo = await getOCamlLaunchProcessInfo(
    targetUri,
    launchTarget,
  );
  debuggerService.startDebugging(launchProcessInfo);
}

export async function getOCamlLaunchProcessInfo(
  targetUri: NuclideUri,
  launchTarget: OCamlDebugStartInfo,
): Promise<VspProcessInfo> {
  const adapterInfo = await getAdapterExecutableWithProperNode(
    'ocaml',
    targetUri,
  );
  return new VspProcessInfo(
    targetUri,
    'launch',
    VsAdapterTypes.OCAML,
    adapterInfo,
    {config: launchTarget},
    {threads: false},
  );
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
): Promise<VSAdapterExecutableInfo> {
  if (adapter === 'native_gdb') {
    return getAdapterExecutableWithProperNode(adapter, program);
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

export async function getNodeAttachProcessInfo(
  targetUri: NuclideUri,
  port: number,
): Promise<VspProcessInfo> {
  const adapterInfo = await getNodeAdapterInfo(targetUri);
  return new VspProcessInfo(
    targetUri,
    'attach',
    VsAdapterTypes.NODE,
    adapterInfo,
    getAttachNodeConfig(port),
    {threads: false},
  );
}

async function getNodeAdapterInfo(
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getAdapterExecutableWithProperNode('node', path);
}

function getNodeScriptConfig(
  scriptPath: NuclideUri,
  nodePath: string,
  cwd: string,
  args: Array<string>,
  env: Object,
  outFiles: string,
): Object {
  return {
    protocol: 'inspector',
    stopOnEntry: false,
    program: nuclideUri.getPath(scriptPath),
    runtimeExecutable: nodePath,
    cwd,
    args,
    env,
    outFiles: outFiles.length > 0 ? [outFiles] : [],
  };
}

export async function getReactNativeAttachProcessInfo(
  args: ReactNativeAttachArgs,
): Promise<VspProcessInfo> {
  const adapterInfo = await getReactNativeAdapterInfo(args.program);
  return new VspProcessInfo(
    args.program,
    'attach',
    VsAdapterTypes.REACT_NATIVE,
    adapterInfo,
    args,
    {threads: false},
  );
}

export async function getReactNativeLaunchProcessInfo(
  args: ReactNativeLaunchArgs,
): Promise<VspProcessInfo> {
  const adapterInfo = await getReactNativeAdapterInfo(args.program);
  return new VspProcessInfo(
    args.program,
    'launch',
    VsAdapterTypes.REACT_NATIVE,
    adapterInfo,
    args,
    {threads: false},
  );
}

async function getReactNativeAdapterInfo(
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getAdapterExecutableWithProperNode('react-native', path);
}

function getAttachNodeConfig(port: number): Object {
  return {port};
}

export async function getHhvmAdapterInfo(
  path: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getAdapterExecutableWithProperNode('hhvm', path);
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
        const debuggerName = debuggerService.getCurrentDebuggerName();
        if (debuggerName == null) {
          track('fb-python-debugger-auto-attach');
          debuggerService.startDebugging(attachProcessInfo);
          return;
        } else {
          notifyOpenDebugSession();
          return;
        }
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
