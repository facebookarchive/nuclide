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
import type {VSAdapterExecutableInfo} from 'nuclide-debugger-common';
import type {OCamlDebugStartInfo} from '../../../modules/nuclide-debugger-vsps/vscode-ocaml/OCamlDebugger';
import type {
  PythonDebuggerAttachTarget,
  RemoteDebugCommandRequest,
} from '../../nuclide-debugger-vsp-rpc/lib/RemoteDebuggerCommandService';
import type {Adapter} from 'nuclide-debugger-vsps/main';
import type {ReactNativeAttachArgs, ReactNativeLaunchArgs} from './types';

import {diffSets, fastDebounce} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
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

export const REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

// Delay starting the remote debug server to avoid affecting Nuclide's startup.
const REMOTE_DEBUG_SERVICES_DELAYED_STARTUP_MS = 10 * 1000;

export async function getPythonParLaunchProcessInfo(
  parPath: NuclideUri,
  args: Array<string>,
): Promise<VspProcessInfo> {
  return new VspProcessInfo(
    parPath,
    'launch',
    VsAdapterTypes.PYTHON,
    await getPythonAdapterInfo(parPath),
    true, // showThreads
    getPythonParConfig(parPath, args),
  );
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
    true, // showThreads
    getPythonScriptConfig(scriptPath, pythonPath, cwd, args, env),
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
    true, // showThreads
    getPythonAttachTargetConfig(target),
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
    false,
    getPrepackScriptConfig(scriptPath, prepackPath, args),
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
    false, // showThreads
    getNodeScriptConfig(
      scriptPath,
      nodePath.length > 0 ? nodePath : adapterInfo.command,
      cwd,
      args,
      env,
      outFiles,
    ),
  );
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
    false, // showThreads
    {config: launchTarget},
  );
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
    false, // showThreads
    getAttachNodeConfig(port),
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
    false, // showThreads
    args,
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
    false, // showThreads
    args,
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
