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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  AutoGenConfig,
  IProcessConfig,
  ControlButtonSpecification,
  DebuggerConfigAction,
} from 'nuclide-debugger-common/types';

import {AnalyticsEvents} from 'atom-ide-ui/pkg/atom-ide-debugger/lib/constants';
import {getAdbServiceByNuclideUri} from 'nuclide-adb';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Subject} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
// eslint-disable-next-line nuclide-internal/modules-dependencies
import {
  getJavaDebuggerHelpersServiceByNuclideUri,
  getSourcePathClickSubscriptions,
} from 'atom-ide-debugger-java/utils';
import nullthrows from 'nullthrows';
import {track} from 'nuclide-commons/analytics';
import {
  getAdbAttachPortTargetInfo,
  launchAndroidServiceOrActivity,
  getPidFromPackageName,
} from './AndroidJavaDebuggerHelpers';

export const NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';

export function getJavaAndroidConfig(): AutoGenConfig {
  const deviceAndPackage = {
    name: 'deviceAndPackage',
    type: 'deviceAndPackage',
    description: '',
    required: true,
    visible: true,
  };
  const activity = {
    name: 'activity',
    type: 'string',
    description: 'com.example.app.main.MainActivity',
    required: false,
    visible: true,
  };
  const service = {
    name: 'service',
    type: 'string',
    description: '.example.package.path.MyServiceClass',
    required: false,
    visible: true,
  };
  const intent = {
    name: 'intent',
    type: 'string',
    description: 'android.intent.action.MAIN',
    required: false,
    visible: true,
  };

  const deviceAndProcess = {
    name: 'deviceAndProcess',
    type: 'deviceAndProcess',
    description: '',
    required: true,
    visible: true,
  };
  const selectSources = {
    name: 'selectSources',
    type: 'selectSources',
    description: '',
    required: true,
    visible: true,
  };

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.JAVA_ANDROID,
      properties: [deviceAndPackage, activity, service, intent, selectSources],
      cwdPropertyName: 'cwd',
      header: null,
      // Value will be replaced in the return value of resolveConfiguration().
      getProcessName(values) {
        return 'Android';
      },
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.JAVA_ANDROID,
      properties: [deviceAndProcess, selectSources],
      header: null,
      // Value will be replaced in the return value of resolveConfiguration().
      getProcessName(values) {
        return 'Android';
      },
    },
  };
}

export function getCustomControlButtonsForJavaSourcePaths(
  clickEvents: rxjs$Subject<void>,
): ControlButtonSpecification[] {
  return [
    {
      icon: 'file-code',
      title: 'Set Source Path',
      onClick: () => clickEvents.next(),
    },
  ];
}

function _getPackageName(debugMode: DebuggerConfigAction, config): string {
  return debugMode === 'launch'
    ? config.deviceAndPackage.selectedPackage
    : config.deviceAndProcess.selectedProcess.name;
}

function _getDeviceSerial(debugMode: DebuggerConfigAction, config): string {
  return nullthrows(
    debugMode === 'launch'
      ? config.deviceAndPackage.deviceSerial
      : config.deviceAndProcess.deviceSerial,
  );
}

async function _getPid(
  debugMode: DebuggerConfigAction,
  config,
  adbServiceUri: string,
  deviceSerial: string,
  packageName: string,
): Promise<number> {
  const selectedProcessPidString =
    config.deviceAndProcess?.selectedProcess?.pid;
  const pid =
    debugMode === 'attach' && selectedProcessPidString != null
      ? parseInt(selectedProcessPidString, 10)
      : await getPidFromPackageName(adbServiceUri, deviceSerial, packageName);
  if (isNaN(pid)) {
    throw new Error(
      'Selected process pid is not a number: ' +
        JSON.stringify(selectedProcessPidString),
    );
  }
  return pid;
}

function _getResolvedTargetUri(targetUri: NuclideUri, config) {
  const selectSources = config.selectSources;
  return selectSources != null ? selectSources : targetUri;
}

function _getAdbServiceUri(unresolvedTargetUri: NuclideUri, config) {
  const adbServiceUri = config.adbServiceUri;
  return adbServiceUri != null ? adbServiceUri : unresolvedTargetUri;
}

async function _getAndroidSdkSourcePaths(
  targetUri: NuclideUri,
  adbServiceUri: NuclideUri,
  deviceSerial: string,
): Promise<Array<string>> {
  const sdkVersion = await getAdbServiceByNuclideUri(
    adbServiceUri,
  ).getAPIVersion(deviceSerial);
  const sdkSourcePath =
    sdkVersion !== ''
      ? await getJavaDebuggerHelpersServiceByNuclideUri(
          targetUri,
        ).getSdkVersionSourcePath(sdkVersion, {
          useSdkManager: nuclideUri.isLocal(targetUri),
        })
      : null;
  if (sdkSourcePath == null) {
    atom.notifications.addInfo(
      'Unable to find Android Sdk Sources for version: ' +
        sdkVersion +
        '. Check if they are installed. Nuclide can still debug your application, but source code for frames inside Android library routines will not be available.',
    );
  }
  track(AnalyticsEvents.ANDROID_DEBUGGER_SDK_SOURCES, {
    deviceSerial,
    sdkVersion,
    sdkSourcePathExists: sdkSourcePath != null,
    sdkSourcePath,
  });
  const sdkSourcePathResolved =
    sdkSourcePath != null ? nuclideUri.getPath(sdkSourcePath) : null;
  return sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];
}

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  const {config, debugMode, targetUri} = configuration;
  const adbServiceUri = _getAdbServiceUri(targetUri, config);
  const resolvedTargetUri = _getResolvedTargetUri(targetUri, config);
  const packageName = _getPackageName(debugMode, config);
  const deviceSerial = _getDeviceSerial(debugMode, config);
  if (debugMode === 'launch') {
    const {service, intent, activity} = config;
    await launchAndroidServiceOrActivity(
      adbServiceUri,
      (service: ?string),
      (activity: ?string),
      (intent: ?string) /* intent and action are the same */,
      deviceSerial,
      packageName,
    );
  }

  const pid = await _getPid(
    debugMode,
    config,
    adbServiceUri,
    deviceSerial,
    packageName,
  );

  const subscriptions = new UniversalDisposable();
  const attachPortTargetConfig = await getAdbAttachPortTargetInfo(
    deviceSerial,
    adbServiceUri,
    resolvedTargetUri,
    pid,
    subscriptions,
    packageName,
  );

  const androidSdkSourcePaths = await _getAndroidSdkSourcePaths(
    resolvedTargetUri,
    adbServiceUri,
    deviceSerial,
  );

  const clickEvents = new Subject();
  const adapterExecutable = await getJavaDebuggerHelpersServiceByNuclideUri(
    resolvedTargetUri,
  ).getJavaVSAdapterExecutableInfo(false);

  let processName = packageName;

  // Gets rid of path to package.
  const lastPeriod = processName.lastIndexOf('.');
  if (lastPeriod >= 0) {
    processName = processName.substring(lastPeriod + 1, processName.length);
  }

  return {
    ...configuration,
    targetUri: resolvedTargetUri,
    debugMode: 'attach',
    adapterExecutable,
    customControlButtons: getCustomControlButtonsForJavaSourcePaths(
      clickEvents,
    ),
    servicedFileExtensions: ['java'],
    config: {
      ...attachPortTargetConfig,
      deviceSerial,
      packageName,
      grammarName: 'source.java',
    },
    onDebugStartingCallback: instance => {
      subscriptions.add(
        ...getSourcePathClickSubscriptions(
          resolvedTargetUri,
          instance,
          clickEvents,
          androidSdkSourcePaths,
        ),
      );
      return subscriptions;
    },
    processName,
  };
}
