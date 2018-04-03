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
  ControlButtonSpecification,
  DebuggerConfigAction,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {
  JavaLaunchTargetInfo,
  JavaAttachPortTargetInfo,
} from '../../nuclide-debugger-java-rpc/lib/JavaDebuggerHelpersService';
import type {Device} from '../../nuclide-device-panel/lib/types';
import type {SshTunnelService} from '../../nuclide-ssh-tunnel/lib/types';

import {VsAdapterTypes} from 'nuclide-debugger-common';
import passesGK from '../../commons-node/passesGK';
import typeof * as AdbService from '../../nuclide-adb-sdb-rpc/lib/AdbService';

import {getJavaDebuggerHelpersServiceByNuclideUri} from '../../nuclide-remote-connection';
import invariant from 'assert';
import featureConfig from 'nuclide-commons-atom/feature-config';
import showModal from 'nuclide-commons-ui/showModal';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable, Subject} from 'rxjs';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {getDebuggerService} from '../../commons-atom/debugger';
import {track} from '../../nuclide-analytics';
import * as BuckService from '../../nuclide-buck-rpc';
import * as React from 'react';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VspProcessInfo} from 'nuclide-debugger-common';
import {getAdbServiceByNuclideUri} from '../../nuclide-remote-connection';
import {SourceFilePathsModal} from './SourceFilePathsModal';

// Only one AdbProcessInfo can be active at a time. Since it ties up a forwarded
// adb port, new instances need to wait for the previous one to clean up before
// they can begin debugging.
let cleanupSubject: ?Subject<void> = null;

export const NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';

export async function getJavaVSAdapterExecutableInfo(
  targetUri: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getJavaDebuggerHelpersServiceByNuclideUri(
    targetUri,
  ).getJavaVSAdapterExecutableInfo(await passesGK(NUCLIDE_DEBUGGER_DEV_GK));
}

export type AndroidDebugTargetInfo = {
  pid: number,
  attach: boolean,
};

export async function launchAndroidServiceOrActivityAndGetPid(
  providedPid: ?number,
  adbService: AdbService,
  service: ?string,
  activity: ?string,
  action: ?string,
  device: Device,
  packageName: string,
): Promise<AndroidDebugTargetInfo> {
  let attach = true;
  let pid = providedPid;
  if (service != null) {
    attach = false;
    await adbService.launchService(device, packageName, service || '', true);
  } else if (activity != null && action != null) {
    // First query the device to be sure the activity exists in the specified package.
    // This will allow us to bubble up a useful error message instead of a cryptic
    // adb failure if the user simply mistyped the activity or package name.
    const activityExists = await adbService.activityExists(
      device,
      packageName,
      activity || '',
    );

    if (!activityExists) {
      throw Error(
        `Activity ${activity || ''} does not exist in package ` + packageName,
      );
    }

    attach = false;
    await adbService.launchActivity(
      device,
      packageName,
      activity || '',
      true,
      action,
    );
  }

  if (pid == null) {
    pid = await adbService.getPidFromPackageName(device, packageName);
    if (!Number.isInteger(pid)) {
      throw Error(`Fail to get pid for package: ${packageName}`);
    }
  }

  return {
    pid,
    attach,
  };
}

export async function getAdbAttachPortTargetInfo(
  device: Device,
  adbService: AdbService,
  adbServiceUri: NuclideUri,
  targetUri: NuclideUri,
  pid: ?number,
  subscriptions: UniversalDisposable,
): Promise<JavaAttachPortTargetInfo> {
  const tunnelRequired =
    nuclideUri.isLocal(adbServiceUri) && nuclideUri.isRemote(targetUri);
  let tunnelService: ?SshTunnelService;
  let adbPort;
  if (tunnelRequired) {
    tunnelService = await consumeFirstProvider('nuclide.ssh-tunnel');
    adbPort = await tunnelService.getAvailableServerPort(adbServiceUri);
  } else {
    tunnelService = null;
    const service = getJavaDebuggerHelpersServiceByNuclideUri(adbServiceUri);
    adbPort = await service.getPortForJavaDebugger();
  }

  const forwardSpec = await adbService.forwardJdwpPortToPid(
    device,
    adbPort,
    pid || 0,
  );

  if (cleanupSubject != null) {
    await cleanupSubject.toPromise();
  }

  cleanupSubject = new Subject();
  subscriptions.add(async () => {
    const result = await adbService.removeJdwpForwardSpec(device, forwardSpec);
    if (result.trim().startsWith('error')) {
      // TODO(Ericblue): The OneWorld proxy swaps TCP forward for a local filesystem
      // redirection, which confuses adb and prevents proper removal of
      // the forward spec.  Fall back to removing all specs to avoid leaking
      // the port.
      await adbService.removeJdwpForwardSpec(device, null);
    }

    if (cleanupSubject != null) {
      cleanupSubject.complete();
    }
  });

  const attachPort = await new Promise(async (resolve, reject) => {
    if (!tunnelRequired) {
      resolve(adbPort);
      return;
    }
    invariant(tunnelService);
    const debuggerPort = await tunnelService.getAvailableServerPort(targetUri);
    const tunnel = {
      description: 'Java debugger',
      from: {
        host: nuclideUri.getHostname(targetUri),
        port: debuggerPort,
        family: 4,
      },
      to: {host: 'localhost', port: adbPort, family: 4},
    };
    subscriptions.add(
      tunnelService.openTunnel(
        tunnel,
        error => {
          if (error == null) {
            resolve(debuggerPort);
          } else {
            reject(error);
          }
        },
        () => {},
      ),
    );
  });
  return {
    machineName: 'localhost',
    port: attachPort,
  };
}

export function getAdbService(adbServiceUri: NuclideUri): AdbService {
  const service = getAdbServiceByNuclideUri(adbServiceUri);
  invariant(service != null);
  return service;
}

export function getCustomSetSourcePathButton(
  clickEvents: rxjs$Subject<void>,
): ControlButtonSpecification {
  return {
    icon: 'file-code',
    title: 'Set Source Path',
    onClick: () => clickEvents.next(),
  };
}

export function getDialogValues(
  clickEvents: rxjs$Subject<void>,
): rxjs$Observable<Array<string>> {
  let userSourcePaths = getSavedPathsFromConfig();
  return clickEvents.switchMap(() => {
    return Observable.create(observer => {
      const modalDisposable = showModal(
        ({dismiss}) => (
          <SourceFilePathsModal
            initialSourcePaths={userSourcePaths}
            sourcePathsChanged={(newPaths: Array<string>) => {
              userSourcePaths = newPaths;
              persistSourcePathsToConfig(newPaths);
              observer.next(newPaths);
            }}
            onClosed={dismiss}
          />
        ),
        {className: 'sourcepath-modal-container'},
      );

      track('fb-java-debugger-source-dialog-shown');
      return () => {
        modalDisposable.dispose();
      };
    });
  });
}

export async function createJavaVspProcessInfo(
  targetUri: NuclideUri,
  debugMode: DebuggerConfigAction,
  info: JavaLaunchTargetInfo | JavaAttachPortTargetInfo,
  clickEvents: rxjs$Subject<void>,
): Promise<VspProcessInfo> {
  const adapterExecutable = await getJavaVSAdapterExecutableInfo(targetUri);
  // If you have built using debug information, then print the debug server port:
  if (await passesGK(NUCLIDE_DEBUGGER_DEV_GK)) {
    try {
      const port = adapterExecutable.args[1].split(':')[2].split(',')[0];
      /* eslint-disable no-console */
      console.log('Java Debugger Debug Port:', port);
    } catch (error) {
      /* eslint-disable no-console */
      console.log(
        'Could not find debug server port from adapter executable',
        adapterExecutable,
      );
    }
  }
  return new VspProcessInfo(
    targetUri,
    debugMode,
    VsAdapterTypes.JAVA,
    adapterExecutable,
    infoToArgs(info),
    {threads: true},
    {customControlButtons: [getCustomSetSourcePathButton(clickEvents)]},
  );
}

export type AndroidDebugInfo = {|
  attach: boolean,
  subscriptions: UniversalDisposable,
  pid: number,
  attachPortTargetInfo: JavaAttachPortTargetInfo,
|};

export async function setupAndroidDebuggerService(
  providedPid: ?number,
  adbService: AdbService,
  service: ?string,
  activity: ?string,
  action: ?string,
  device: Device,
  packageName: string,
  adbServiceUri: NuclideUri,
  targetUri: NuclideUri,
): Promise<AndroidDebugInfo> {
  const subscriptions = new UniversalDisposable();
  const {pid, attach} = await launchAndroidServiceOrActivityAndGetPid(
    providedPid,
    adbService,
    service,
    activity,
    action,
    device,
    packageName,
  );

  const attachPortTargetInfo = await getAdbAttachPortTargetInfo(
    device,
    adbService,
    adbServiceUri,
    targetUri,
    pid,
    subscriptions,
  );

  await setupJavaDebuggerService(
    targetUri,
    'attach',
    attachPortTargetInfo,
    subscriptions,
  );

  return {
    attach,
    subscriptions,
    pid,
    attachPortTargetInfo,
  };
}

export async function setupJavaDebuggerService(
  targetUri: NuclideUri,
  debugMode: DebuggerConfigAction,
  info: JavaLaunchTargetInfo | JavaAttachPortTargetInfo,
  subscriptions: UniversalDisposable = new UniversalDisposable(),
): Promise<void> {
  const clickEvents = new Subject();
  const processInfo = await createJavaVspProcessInfo(
    targetUri,
    debugMode,
    info,
    clickEvents,
  );
  const defaultValues = getDefaultSourceSearchPaths(targetUri);

  const debuggerService = await getDebuggerService();
  await debuggerService.startDebugging(processInfo);
  //  The following line must come after `startDebugging` because otherwise
  //    the rpcService has not yet been initialized for us to send custom
  //    commands to
  //  Additionally we set the disposable to be on the processInfo because
  //    it cannot be in the UI lifecyle. The UI lifecycle disposes its
  //    disposable on componentWillUnmount which has already occurred

  subscriptions.add(
    getDialogValues(clickEvents)
      .startWith(getSavedPathsFromConfig())
      .subscribe(userValues => {
        processInfo.customRequest('setSourcePath', {
          sourcePath: getSourcePathString(defaultValues.concat(userValues)),
        });
      }),
    clickEvents,
  );
  processInfo.addCustomDisposable(subscriptions);
}

export function persistSourcePathsToConfig(
  newSourcePaths: Array<string>,
): void {
  featureConfig.set(
    'nuclide-debugger-java.sourceFilePaths',
    newSourcePaths.join(';'),
  );
}

export function getSavedPathsFromConfig(): Array<string> {
  const paths = featureConfig.get('nuclide-debugger-java.sourceFilePaths');
  // flowlint-next-line sketchy-null-mixed:off
  if (paths && typeof paths === 'string') {
    return (paths: string).split(';');
  } else {
    featureConfig.set('nuclide-debugger-java.sourceFilePaths', '');
  }
  return [];
}

export function getDefaultSourceSearchPaths(
  targetUri: NuclideUri,
): Array<string> {
  const searchPaths: Array<string> = [];
  const remote = nuclideUri.isRemote(targetUri);

  // Add all the project root paths as potential source locations the Java debugger server should
  // check for resolving source.
  // NOTE: the Java debug server will just ignore any directory path that doesn't exist.
  atom.project.getPaths().forEach(path => {
    if (
      (remote && nuclideUri.isRemote(path)) ||
      (!remote && nuclideUri.isLocal(path))
    ) {
      const translatedPath = remote ? nuclideUri.getPath(path) : path;
      searchPaths.push(translatedPath);

      try {
        // $FlowFB
        require('./fb-AndroidSourcePathUtils').addKnownSubdirectoryPaths(
          remote,
          translatedPath,
          searchPaths,
        );
      } catch (e) {}
    }
  });

  return searchPaths;
}

export function infoToArgs(
  info: JavaLaunchTargetInfo | JavaAttachPortTargetInfo,
) {
  return {
    config: {
      info,
    },
    trace: false,
  };
}

export async function javaDebugSetSourcePaths(
  processInfo: VspProcessInfo,
  sourcePaths: Array<string>,
): Promise<void> {
  await processInfo.customRequest('setSourcePath', {
    sourcePath: getSourcePathString(sourcePaths),
  });
}

// Employs a heuristic to try and find the Java source path roots for a buck target.
export async function javaDebugAddBuckTargetSourcePaths(
  processInfo: VspProcessInfo,
  buckRoot: NuclideUri,
  targetName: string,
): Promise<void> {
  const newSourceDirs = new Set();
  const sources = await BuckService.query(
    buckRoot,
    `inputs(deps("${targetName}", 1))`,
    [] /* no extra arguments */,
  );
  for (const sourcePath of sources) {
    const fullPath = nuclideUri.join(buckRoot, sourcePath);
    const javaRootsToTry = ['java', 'com', 'net', 'org'];
    for (const javaRoot of javaRootsToTry) {
      const idx = fullPath.indexOf('/' + javaRoot + '/');
      if (idx > 0) {
        const dirname = fullPath.substring(0, idx);
        newSourceDirs.add(dirname);
        newSourceDirs.add(nuclideUri.join(dirname, javaRoot));
      }
    }
  }

  const newDirs = Array.from(newSourceDirs);
  if (newDirs.length > 0) {
    await javaDebugSetSourcePaths(processInfo, newDirs);
  }
}

export function getSourcePathString(searchPaths: Array<string>): string {
  return searchPaths.join(';');
}
