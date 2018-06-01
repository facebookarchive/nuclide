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

import type {
  AutoGenConfig,
  IProcessConfig,
  ControlButtonSpecification,
} from 'nuclide-debugger-common/types';
import type {Device} from 'nuclide-debugger-common/types';

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
  launchAndroidServiceOrActivityAndGetPid,
  getAdbAttachPortTargetInfo,
} from './AndroidJavaDebuggerHelpers';
import invariant from 'assert';

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

  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.JAVA_ANDROID,
      threads: true,
      properties: [deviceAndPackage, activity, service, intent],
      cwdPropertyName: 'cwd',
      header: null,
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.JAVA_ANDROID,
      threads: true,
      properties: [deviceAndProcess],
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

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const {adapterExecutable, config, debugMode, targetUri} = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }
  let pid = null;
  let device: ?Device = null;
  const subscriptions = new UniversalDisposable();
  const clickEvents = new Subject();
  const adbServiceUri =
    config.adbServiceUri != null ? config.adbServiceUri : targetUri;
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  if (debugMode === 'launch') {
    const {service, intent, activity, deviceAndPackage} = config;
    const {selectedPackage} = deviceAndPackage;
    device = deviceAndPackage.device;

    pid = (await launchAndroidServiceOrActivityAndGetPid(
      null /* providedPid */,
      adbServiceUri,
      service || null,
      activity || null,
      intent || null /* intent and action are the same */,
      device,
      selectedPackage,
    )).pid;
  } else if (debugMode === 'attach') {
    const {deviceAndProcess} = config;
    const {selectedProcess} = deviceAndProcess;
    device = deviceAndProcess.device;

    const selectedProcessPid = parseInt(selectedProcess.pid, 10);
    if (isNaN(selectedProcessPid)) {
      throw new Error(
        'Selected process pid is not a number: ' +
          JSON.stringify(selectedProcess.pid),
      );
    }

    pid = (await launchAndroidServiceOrActivityAndGetPid(
      selectedProcessPid,
      adbServiceUri,
      null,
      null,
      null,
      device,
      selectedProcess.name,
    )).pid;
  }

  invariant(
    debugMode === 'attach' || debugMode === 'launch',
    'Debug Mode was neither launch nor attach, debugMode: ' + debugMode,
  );

  const attachPortTargetConfig = await getAdbAttachPortTargetInfo(
    nullthrows(device),
    adbServiceUri,
    targetUri,
    nullthrows(pid),
    subscriptions,
  );

  const customDisposable =
    configuration.customDisposable || new UniversalDisposable();
  customDisposable.add(subscriptions);

  const sdkSourcePath =
    config.sdkVersion != null
      ? await getJavaDebuggerHelpersServiceByNuclideUri(
          targetUri,
        ).getSdkVersionSourcePath(config.sdkVersion)
      : null;
  const sdkSourcePathResolved =
    sdkSourcePath != null ? nuclideUri.getPath(sdkSourcePath) : sdkSourcePath;
  const additionalSourcePaths =
    sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];

  const onInitializeCallback = async session => {
    customDisposable.add(
      ...getSourcePathClickSubscriptions(
        targetUri,
        session,
        clickEvents,
        additionalSourcePaths,
      ),
    );
  };

  return {
    ...configuration,
    debugMode: attachPortTargetConfig.debugMode,
    adapterExecutable: await getJavaDebuggerHelpersServiceByNuclideUri(
      targetUri,
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
