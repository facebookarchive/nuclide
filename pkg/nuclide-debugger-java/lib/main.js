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

import type {DeadlineRequest} from 'nuclide-commons/promise';
import type {NuclideDebuggerProvider} from 'nuclide-debugger-common';
import type {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  AdditionalLogFilesProvider,
  AdditionalLogFile,
} from '../../nuclide-logging/lib/rpc-types';
import type {
  NuclideJavaDebuggerProvider,
  AdbProcessParameters,
  JavaDebugInfo,
} from './types';
import type {DevicePanelServiceApi} from '../../nuclide-device-panel/lib/types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import os from 'os';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Subject} from 'rxjs';
import {
  createJavaVspProcessInfo,
  getAdbService,
  launchAndroidServiceOrActivityAndGetPid,
  getAdbAttachPortTargetInfo,
} from './JavaDebuggerServiceHelpers';
import {JavaLaunchAttachProvider} from './JavaLaunchAttachProvider';
import {JavaDebuggerDevicePanelProvider} from './JavaDebuggerDevicePanelProvider';

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return {
    name: 'java',
    getLaunchAttachProvider(
      connection: NuclideUri,
    ): ?DebuggerLaunchAttachProvider {
      return new JavaLaunchAttachProvider('Java', connection);
    },
  };
}

export function createJavaDebuggerProvider(): NuclideJavaDebuggerProvider {
  return {
    createAndroidDebugInfo: async (
      parameters: AdbProcessParameters,
    ): Promise<JavaDebugInfo> => {
      const {targetUri, packageName, activity, action, device} = parameters;

      const adbServiceUri =
        parameters.adbServiceUri != null
          ? parameters.adbServiceUri
          : parameters.targetUri;

      const service = parameters.service != null ? parameters.service : null;
      const adbService = getAdbService(targetUri);
      const {pid} = await launchAndroidServiceOrActivityAndGetPid(
        parameters.pid,
        adbService,
        service,
        activity,
        action,
        device,
        packageName,
      );

      const subscriptions = new UniversalDisposable();
      const attachPortTargetInfo = await getAdbAttachPortTargetInfo(
        device,
        adbService,
        adbServiceUri,
        targetUri,
        pid,
        subscriptions,
      );

      const clickEvents = new Subject();
      const processInfo = await createJavaVspProcessInfo(
        targetUri,
        'attach',
        attachPortTargetInfo,
        clickEvents,
      );
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        processInfo,
        subscriptions,
      };
    },
    createJavaAttachInfo: async (
      targetUri: string,
      attachPort: number,
    ): Promise<JavaDebugInfo> => {
      const subscriptions = new UniversalDisposable();
      const clickEvents = new Subject();
      const processInfo = await createJavaVspProcessInfo(
        targetUri,
        'attach',
        {
          machineName: nuclideUri.isRemote(targetUri)
            ? nuclideUri.getHostname(targetUri)
            : 'localhost',
          port: attachPort,
        },
        clickEvents,
      );
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        processInfo,
        subscriptions,
      };
    },
    createJavaTestAttachInfo: async (
      targetUri: string,
      attachPort: number,
    ): Promise<JavaDebugInfo> => {
      const subscriptions = new UniversalDisposable();
      const clickEvents = new Subject();
      const processInfo = await createJavaVspProcessInfo(
        targetUri,
        'attach',
        {
          machineName: nuclideUri.isRemote(targetUri)
            ? nuclideUri.getHostname(targetUri)
            : 'localhost',
          port: attachPort,
        },
        clickEvents,
      );
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        subscriptions,
        processInfo,
      };
    },
    createJavaLaunchInfo: async (
      targetUri: string,
      mainClass: string,
      classPath: string,
      runArgs: Array<string>,
    ): Promise<JavaDebugInfo> => {
      const subscriptions = new UniversalDisposable();
      const clickEvents = new Subject();
      const processInfo = await createJavaVspProcessInfo(
        targetUri,
        'launch',
        {
          commandLine: mainClass,
          classPath,
          runArgs,
        },
        clickEvents,
      );
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        subscriptions,
        processInfo,
      };
    },
  };
}

async function getAdditionalLogFilesOnLocalServer(
  deadline: DeadlineRequest,
): Promise<Array<AdditionalLogFile>> {
  // The DebuggerLogger.java file is hard-coded to write logs to certain
  // filepaths (<tmp>/nuclide-<user>-logs/JavaDebuggerServer.log). We have to
  // make sure this function reads from the exact same name.

  // TODO(ljw): It looks like the Java code is writing to JavaDebuggerServer.log
  // but the Nuclide code was reading from .log.0? I don't understand why, so
  // to be safe I'll try both.
  try {
    const results: Array<AdditionalLogFile> = [];
    const files = ['JavaDebuggerServer.log.0', 'JavaDebuggerServer.log'];
    await Promise.all(
      files.map(async file => {
        const filepath = nuclideUri.join(
          os.tmpdir(),
          `nuclide-${os.userInfo().username}-logs`,
          file,
        );
        let data = null;
        try {
          const stat = await fsPromise.stat(filepath);
          if (stat.size > 10 * 1024 * 1024) {
            data = 'file too big!'; // TODO(ljw): at least get the first 10Mb of it
          } else {
            data = await fsPromise.readFile(filepath, 'utf8');
          }
        } catch (e) {
          if (!e.message.includes('ENOENT')) {
            data = e.toString();
          }
        }
        if (data != null) {
          results.push({title: filepath + '.txt', data});
        }
      }),
    );
    return results;
  } catch (e) {
    return [];
  }
}

export function createJavaAdditionalLogFilesProvider(): AdditionalLogFilesProvider {
  return {
    id: 'java-debugger',
    getAdditionalLogFiles: getAdditionalLogFilesOnLocalServer,
  };
}

export function consumeDevicePanelServiceApi(api: DevicePanelServiceApi): void {
  api.registerProcessTaskProvider(
    new JavaDebuggerDevicePanelProvider(createJavaDebuggerProvider()),
  );
}
