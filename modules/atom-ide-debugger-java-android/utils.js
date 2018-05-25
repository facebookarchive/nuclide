'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_DEBUGGER_DEV_GK = undefined;
exports.getJavaAndroidConfig = getJavaAndroidConfig;
exports.getCustomControlButtonsForJavaSourcePaths = getCustomControlButtonsForJavaSourcePaths;
exports.resolveConfiguration = resolveConfiguration;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-debugger-common/constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../atom-ide-debugger-java/utils');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _AndroidJavaDebuggerHelpers;

function _load_AndroidJavaDebuggerHelpers() {
  return _AndroidJavaDebuggerHelpers = require('./AndroidJavaDebuggerHelpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

const NUCLIDE_DEBUGGER_DEV_GK = exports.NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';

function getJavaAndroidConfig() {
  const deviceAndPackage = {
    name: 'deviceAndPackage',
    type: 'deviceAndPackage',
    description: '',
    required: true,
    visible: true
  };
  const activity = {
    name: 'activity',
    type: 'string',
    description: 'com.example.app.main.MainActivity',
    required: false,
    visible: true
  };
  const service = {
    name: 'service',
    type: 'string',
    description: '.example.package.path.MyServiceClass',
    required: false,
    visible: true
  };
  const intent = {
    name: 'intent',
    type: 'string',
    description: 'android.intent.action.MAIN',
    required: false,
    visible: true
  };

  const deviceAndProcess = {
    name: 'deviceAndProcess',
    type: 'deviceAndProcess',
    description: '',
    required: true,
    visible: true
  };

  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA_ANDROID,
      threads: true,
      properties: [deviceAndPackage, activity, service, intent],
      cwdPropertyName: 'cwd',
      header: null
    },
    attach: {
      launch: false,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA_ANDROID,
      threads: true,
      properties: [deviceAndProcess],
      header: null
    }
  };
}

function getCustomControlButtonsForJavaSourcePaths(clickEvents) {
  return [{
    icon: 'file-code',
    title: 'Set Source Path',
    onClick: () => clickEvents.next()
  }];
}

async function resolveConfiguration(configuration) {
  const { adapterExecutable, config, debugMode, targetUri } = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }
  let pid = null;
  let device = null;
  const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const clickEvents = new _rxjsBundlesRxMinJs.Subject();
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  if (debugMode === 'launch') {
    const { service, intent, activity, deviceAndPackage } = config;
    const { selectedPackage } = deviceAndPackage;
    device = deviceAndPackage.device;

    pid = (await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).launchAndroidServiceOrActivityAndGetPid)(null /* providedPid */
    , targetUri, service || null, activity || null, intent || null /* intent and action are the same */
    , device, selectedPackage)).pid;
  } else if (debugMode === 'attach') {
    const { deviceAndProcess } = config;
    const { selectedProcess } = deviceAndProcess;
    device = deviceAndProcess.device;

    const selectedProcessPid = parseInt(selectedProcess.pid, 10);
    if (isNaN(selectedProcessPid)) {
      throw new Error('Selected process pid is not a number: ' + JSON.stringify(selectedProcess.pid));
    }

    pid = (await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).launchAndroidServiceOrActivityAndGetPid)(selectedProcessPid, targetUri, null, null, null, device, selectedProcess.name)).pid;
  }

  if (!(debugMode === 'attach' || debugMode === 'launch')) {
    throw new Error('Debug Mode was neither launch nor attach, debugMode: ' + debugMode);
  }

  const attachPortTargetConfig = await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).getAdbAttachPortTargetInfo)((0, (_nullthrows || _load_nullthrows()).default)(device), targetUri, targetUri, (0, (_nullthrows || _load_nullthrows()).default)(pid), subscriptions);

  const customDisposable = configuration.customDisposable || new (_UniversalDisposable || _load_UniversalDisposable()).default();
  customDisposable.add(subscriptions);

  return Object.assign({}, configuration, {
    debugMode: attachPortTargetConfig.debugMode,
    adapterExecutable: await (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(targetUri).getJavaVSAdapterExecutableInfo(false),
    properties: Object.assign({}, configuration.properties, {
      customControlButtons: getCustomControlButtonsForJavaSourcePaths(clickEvents)
    }),
    config: attachPortTargetConfig,
    customDisposable,
    onInitializeCallback: session => {
      customDisposable.add(...(0, (_utils || _load_utils()).getSourcePathClickSubscriptions)(targetUri, session, clickEvents));
    }
  });
}