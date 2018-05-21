/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  IProcessConfig,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {
  JavaTargetConfig,
  JavaAttachPortTargetConfig,
} from 'atom-ide-debugger-java/JavaDebuggerHelpersService';

import type {Device} from '../../nuclide-device-panel/lib/types';
import type {SshTunnelService} from '../../nuclide-ssh-tunnel/lib/types';
import typeof * as AdbService from 'nuclide-adb/lib/AdbService';

import {VsAdapterTypes} from 'nuclide-debugger-common';
import passesGK from '../../commons-node/passesGK';

import invariant from 'assert';
import {
  getJavaDebuggerHelpersServiceByNuclideUri,
  NUCLIDE_DEBUGGER_DEV_GK,
  getSourcePathString,
  getCustomControlButtonsForJavaSourcePaths,
  getSourcePathClickSubscriptionsOnVspInstance,
} from 'atom-ide-debugger-java/utils';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject} from 'rxjs';
import consumeFirstProvider from 'nuclide-commons-atom/consumeFirstProvider';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';
import {track} from '../../nuclide-analytics';
import * as BuckService from '../../nuclide-buck-rpc';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VspProcessInfo} from 'nuclide-debugger-common';
import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';

// Only one AdbProcessInfo can be active at a time. Since it ties up a forwarded
// adb port, new instances need to wait for the previous one to clean up before
// they can begin debugging.
let cleanupSubject: ?Subject<void> = null;

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
      const packages = await adbService.getAllAvailablePackages(device);
      const availableActivities = new Set(
        packages.filter(line => line.includes(packageName + '/')),
      );
      atom.notifications.addError(
        `Activity ${activity || ''} does not exist in package ` +
          packageName +
          '\n' +
          'Did you mean one of these activities: ' +
          '\n' +
          Array.from(availableActivities)
            .map(activityLine => activityLine.split('/')[1])
            .join('\n'),
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
): Promise<JavaAttachPortTargetConfig> {
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
    try {
      if (!tunnelRequired) {
        resolve(adbPort);
        return;
      }
      invariant(tunnelService);
      const debuggerPort = await tunnelService.getAvailableServerPort(
        targetUri,
      );
      const tunnel = {
        description: 'Java debugger',
        from: {
          host: nuclideUri.getHostname(targetUri),
          port: debuggerPort,
          family: 4,
        },
        to: {host: 'localhost', port: adbPort, family: 4},
      };
      const openTunnel = tunnelService.openTunnels([tunnel]).share();
      subscriptions.add(openTunnel.subscribe());
      await openTunnel.take(1).toPromise();
      resolve(debuggerPort);
    } catch (e) {
      reject(e);
    }
  });
  return {
    debugMode: 'attach',
    machineName: 'localhost',
    port: attachPort,
  };
}

export function getAdbService(adbServiceUri: NuclideUri): AdbService {
  const service = getAdbServiceByNuclideUri(adbServiceUri);
  invariant(service != null);
  return service;
}

export async function createJavaVspProcessInfo(
  targetUri: NuclideUri,
  config: JavaTargetConfig,
  clickEvents: rxjs$Subject<void>,
): Promise<VspProcessInfo> {
  const processConfig = await _createJavaVspIProcessConfig(
    targetUri,
    config,
    clickEvents,
  );
  const info = new VspProcessInfo(
    processConfig.targetUri,
    processConfig.debugMode,
    processConfig.adapterType,
    processConfig.adapterExecutable,
    processConfig.config,
    {threads: true},
    {
      customControlButtons: getCustomControlButtonsForJavaSourcePaths(
        clickEvents,
      ),
      threadsComponentTitle: 'Threads',
    },
  );

  const subscriptions = new UniversalDisposable();
  subscriptions.add(
    ...getSourcePathClickSubscriptionsOnVspInstance(
      targetUri,
      info,
      clickEvents,
    ),
  );
  info.addCustomDisposable(subscriptions);
  return info;
}

async function getJavaVSAdapterExecutableInfo(
  targetUri: NuclideUri,
): Promise<VSAdapterExecutableInfo> {
  return getJavaDebuggerHelpersServiceByNuclideUri(
    targetUri,
  ).getJavaVSAdapterExecutableInfo(await passesGK(NUCLIDE_DEBUGGER_DEV_GK));
}

async function _createJavaVspIProcessConfig(
  targetUri: NuclideUri,
  config: JavaTargetConfig,
  clickEvents: rxjs$Subject<void>,
): Promise<IProcessConfig> {
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

  return {
    targetUri,
    debugMode: config.debugMode,
    adapterType: VsAdapterTypes.JAVA,
    adapterExecutable,
    config,
    capabilities: {threads: true},
    properties: {
      customControlButtons: getCustomControlButtonsForJavaSourcePaths(
        clickEvents,
      ),
      threadsComponentTitle: 'Threads',
    },
  };
}

export type AndroidDebugInfo = {|
  attach: boolean,
  subscriptions: UniversalDisposable,
  pid: number,
  attachPortTargetInfo: JavaAttachPortTargetConfig,
|};

export async function debugAndroidDebuggerService(
  providedPid: ?number,
  adbService: AdbService,
  service: ?string,
  activity: ?string,
  action: ?string,
  device: Device,
  packageName: string,
  adbServiceUri: NuclideUri,
  targetUri: NuclideUri,
): Promise<void> {
  const {pid, attach} = await launchAndroidServiceOrActivityAndGetPid(
    providedPid,
    adbService,
    service,
    activity,
    action,
    device,
    packageName,
  );

  let subscriptions = new UniversalDisposable();
  try {
    const attachPortTargetConfig = await getAdbAttachPortTargetInfo(
      device,
      adbService,
      adbServiceUri,
      targetUri,
      pid,
      subscriptions,
    );

    await debugJavaDebuggerService(
      targetUri,
      attachPortTargetConfig,
      subscriptions,
      false /* do not track because we will */,
    );

    // Subscriptions is now owned by the debugger service, and will
    // be disposed when debugging stops.
    subscriptions = null;

    track('fb-java-debugger-start', {
      startType: attach ? 'android-attach' : 'android-launch',
      target: packageName,
      targetType: 'android',
      port: attachPortTargetConfig.port,
      deviceName: device.name,
      activity,
      action,
      pid,
    });
  } finally {
    if (subscriptions != null) {
      subscriptions.dispose();
    }
  }
}

export async function debugJavaDebuggerService(
  targetUri: NuclideUri,
  config: JavaTargetConfig,
  subscriptions: UniversalDisposable = new UniversalDisposable(),
  trackDebug: boolean = true,
): Promise<void> {
  const clickEvents = new Subject();
  const processConfig = await _createJavaVspIProcessConfig(
    targetUri,
    config,
    clickEvents,
  );

  const debuggerService = await getDebuggerService();
  const vspInstance = await debuggerService.startVspDebugging(processConfig);
  //  The following line must come after `startDebugging` because otherwise
  //    the rpcService has not yet been initialized for us to send custom
  //    commands to
  //  Additionally we set the disposable to be on the vspInstance because
  //    it cannot be in the UI lifecyle. The UI lifecycle disposes its
  //    disposable on componentWillUnmount which has already occurred

  subscriptions.add(
    ...getSourcePathClickSubscriptionsOnVspInstance(
      targetUri,
      vspInstance,
      clickEvents,
    ),
  );
  vspInstance.addCustomDisposable(subscriptions);

  if (trackDebug) {
    if (config.debugMode === 'attach') {
      // if attach
      track('fb-java-debugger-start', {
        startType: 'java-attach',
        machineName: config.machineName,
        port: config.port,
        targetUri,
      });
    } else if (config.debugMode === 'launch') {
      // else launch
      track('fb-java-debugger-start', {
        startType: 'java-launch',
        commandLine: config.commandLine,
        classPath: config.classPath,
        targetUri,
      });
    }
  }
}

async function javaDebugSetSourcePaths(
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
