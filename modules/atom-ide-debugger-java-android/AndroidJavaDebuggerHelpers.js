/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {SshTunnelService} from 'nuclide-adb/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  IProcessConfig,
  VSAdapterExecutableInfo,
} from 'nuclide-debugger-common';
import type {
  JavaTargetConfig,
  JavaAttachPortTargetConfig,
} from 'atom-ide-debugger-java/JavaDebuggerHelpersService';
import type {Device} from 'nuclide-debugger-common/types';

import {VsAdapterTypes} from 'nuclide-debugger-common';

import invariant from 'assert';
import {
  getJavaDebuggerHelpersServiceByNuclideUri,
  getCustomControlButtonsForJavaSourcePaths,
  getSourcePathClickSubscriptionsOnVspInstance,
} from 'atom-ide-debugger-java/utils';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject} from 'rxjs';
import consumeFirstProvider from 'nuclide-commons-atom/consumeFirstProvider';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VspProcessInfo} from 'nuclide-debugger-common';
import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';

// Only one AdbProcessInfo can be active at a time. Since it ties up a forwarded
// adb port, new instances need to wait for the previous one to clean up before
// they can begin debugging.
let cleanupSubject: ?Subject<void> = null;

const DEBUG_JAVA_DEBUGGER = false;

export type AndroidDebugTargetInfo = {
  pid: number,
  attach: boolean,
};

export async function launchAndroidServiceOrActivityAndGetPid(
  providedPid: ?number,
  adbServiceUri: NuclideUri,
  service: ?string,
  activity: ?string,
  action: ?string,
  device: Device,
  packageName: string,
): Promise<AndroidDebugTargetInfo> {
  let attach = true;
  let pid = providedPid;
  const adbService = getAdbServiceByNuclideUri(adbServiceUri);
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
  adbServiceUri: NuclideUri,
  targetUri: NuclideUri,
  pid: ?number,
  subscriptions: UniversalDisposable,
): Promise<JavaAttachPortTargetConfig> {
  const tunnelRequired =
    nuclideUri.isLocal(adbServiceUri) && nuclideUri.isRemote(targetUri);
  const adbService = getAdbServiceByNuclideUri(adbServiceUri);
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

export async function createJavaVspProcessInfo(
  targetUri: NuclideUri,
  config: JavaTargetConfig,
  clickEvents: rxjs$Subject<void>,
): Promise<VspProcessInfo> {
  const processConfig = await createJavaVspIProcessConfig(
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
  ).getJavaVSAdapterExecutableInfo(DEBUG_JAVA_DEBUGGER);
}

export async function createJavaVspIProcessConfig(
  targetUri: NuclideUri,
  config: JavaTargetConfig,
  clickEvents: rxjs$Subject<void>,
): Promise<IProcessConfig> {
  const adapterExecutable = await getJavaVSAdapterExecutableInfo(targetUri);
  // If you have built using debug information, then print the debug server port:
  if (DEBUG_JAVA_DEBUGGER) {
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
