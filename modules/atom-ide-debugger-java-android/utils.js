/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  AutoGenConfig,
  IProcessConfig,
  ControlButtonSpecification,
  DebuggerConfigAction,
} from 'nuclide-debugger-common/types';
import type {Device} from 'nuclide-debugger-common/types';

import idx from 'idx';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Subject} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import {
  getJavaDebuggerHelpersServiceByNuclideUri,
  getSourcePathClickSubscriptions,
} from 'atom-ide-debugger-java/utils';
import nullthrows from 'nullthrows';
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
      threads: true,
      properties: [deviceAndPackage, activity, service, intent, selectSources],
      cwdPropertyName: 'cwd',
      header: null,
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.JAVA_ANDROID,
      threads: true,
      properties: [deviceAndProcess, selectSources],
      header: null,
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
  return nullthrows(
    debugMode === 'launch'
      ? (idx(config, _ => _.deviceAndPackage.selectedPackage): ?string)
      : (idx(config, _ => _.deviceAndProcess.selectedProcess.name): ?string),
  );
}

function _getDevice(debugMode: DebuggerConfigAction, config): Device {
  return nullthrows(
    debugMode === 'launch'
      ? (idx(config, _ => _.deviceAndPackage.device): ?Device)
      : (idx(config, _ => _.deviceAndProcess.device): ?Device),
  );
}

async function _getPid(
  debugMode: DebuggerConfigAction,
  config,
  adbServiceUri: string,
  device: Device,
  packageName: string,
): Promise<number> {
  const selectedProcessPidString = idx(
    config,
    _ => _.deviceAndProcess.selectedProcess.pid,
  );
  const selectedProcessPid = parseInt(selectedProcessPidString, 10);
  const pid =
    debugMode === 'attach' && selectedProcessPidString != null
      ? selectedProcessPid
      : await getPidFromPackageName(adbServiceUri, device, packageName);
  if (isNaN(pid)) {
    throw new Error(
      'Selected process pid is not a number: ' +
        JSON.stringify(selectedProcessPidString),
    );
  }
  return pid;
}

function _getResolvedTargetUri(targetUri: NuclideUri, config) {
  const selectSources: ?string = idx(config, _ => _.selectSources);
  return selectSources != null ? selectSources : targetUri;
}

function _getAdbServiceUri(unresolvedTargetUri: NuclideUri, config) {
  const adbServiceUri: ?string = idx(config, _ => _.adbServiceUri);
  return adbServiceUri != null ? adbServiceUri : unresolvedTargetUri;
}

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  const {config, debugMode, targetUri} = configuration;
  const adbServiceUri = _getAdbServiceUri(targetUri, config);
  const resolvedTargetUri = _getResolvedTargetUri(targetUri, config);
  const packageName = _getPackageName(debugMode, config);
  const device = _getDevice(debugMode, config);
  if (debugMode === 'launch') {
    const {service, intent, activity} = config;
    await launchAndroidServiceOrActivity(
      adbServiceUri,
      (service: ?string),
      (activity: ?string),
      (intent: ?string) /* intent and action are the same */,
      device,
      packageName,
    );
  }

  const pid = await _getPid(
    debugMode,
    config,
    adbServiceUri,
    device,
    packageName,
  );

  const subscriptions = new UniversalDisposable();
  const attachPortTargetConfig = await getAdbAttachPortTargetInfo(
    device,
    adbServiceUri,
    resolvedTargetUri,
    pid,
    subscriptions,
  );

  const customDisposable =
    configuration.customDisposable || new UniversalDisposable();
  customDisposable.add(subscriptions);

  const sdkSourcePath =
    config.sdkVersion != null
      ? await getJavaDebuggerHelpersServiceByNuclideUri(
          resolvedTargetUri,
        ).getSdkVersionSourcePath(config.sdkVersion)
      : null;
  const sdkSourcePathResolved =
    sdkSourcePath != null ? nuclideUri.getPath(sdkSourcePath) : sdkSourcePath;
  const additionalSourcePaths =
    sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];

  const clickEvents = new Subject();
  const onInitializeCallback = async session => {
    customDisposable.add(
      ...getSourcePathClickSubscriptions(
        resolvedTargetUri,
        session,
        clickEvents,
        additionalSourcePaths,
      ),
    );
  };

  return {
    ...configuration,
    targetUri: resolvedTargetUri,
    debugMode: attachPortTargetConfig.debugMode,
    adapterExecutable: await getJavaDebuggerHelpersServiceByNuclideUri(
      resolvedTargetUri,
    ).getJavaVSAdapterExecutableInfo(false),
    properties: {
      ...configuration.properties,
      customControlButtons: getCustomControlButtonsForJavaSourcePaths(
        clickEvents,
      ),
    },
    config: attachPortTargetConfig,
    customDisposable,
    onInitializeCallback,
  };
}
