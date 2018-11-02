"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJavaAndroidConfig = getJavaAndroidConfig;
exports.getCustomControlButtonsForJavaSourcePaths = getCustomControlButtonsForJavaSourcePaths;
exports.resolveConfiguration = resolveConfiguration;
exports.NUCLIDE_DEBUGGER_DEV_GK = void 0;

function _constants() {
  const data = require("../atom-ide-ui/pkg/atom-ide-debugger/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _nuclideAdb() {
  const data = require("../nuclide-adb");

  _nuclideAdb = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _constants2() {
  const data = require("../nuclide-debugger-common/constants");

  _constants2 = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../atom-ide-debugger-java/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _AndroidJavaDebuggerHelpers() {
  const data = require("./AndroidJavaDebuggerHelpers");

  _AndroidJavaDebuggerHelpers = function () {
    return data;
  };

  return data;
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
 * 
 * @format
 */
// eslint-disable-next-line nuclide-internal/modules-dependencies
const NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';
exports.NUCLIDE_DEBUGGER_DEV_GK = NUCLIDE_DEBUGGER_DEV_GK;

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
  const selectSources = {
    name: 'selectSources',
    type: 'selectSources',
    description: '',
    required: true,
    visible: true
  };
  return {
    launch: {
      launch: true,
      vsAdapterType: _constants2().VsAdapterTypes.JAVA_ANDROID,
      properties: [deviceAndPackage, activity, service, intent, selectSources],
      cwdPropertyName: 'cwd',
      header: null,

      // Value will be replaced in the return value of resolveConfiguration().
      getProcessName(values) {
        return 'Android';
      }

    },
    attach: {
      launch: false,
      vsAdapterType: _constants2().VsAdapterTypes.JAVA_ANDROID,
      properties: [deviceAndProcess, selectSources],
      header: null,

      // Value will be replaced in the return value of resolveConfiguration().
      getProcessName(values) {
        return 'Android';
      }

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

function _getPackageName(debugMode, config) {
  return debugMode === 'launch' ? config.deviceAndPackage.selectedPackage : config.deviceAndProcess.selectedProcess.name;
}

function _getDeviceSerial(debugMode, config) {
  return (0, _nullthrows().default)(debugMode === 'launch' ? config.deviceAndPackage.deviceSerial : config.deviceAndProcess.deviceSerial);
}

async function _getPid(debugMode, config, adbServiceUri, deviceSerial, packageName) {
  var _config$deviceAndProc, _config$deviceAndProc2;

  const selectedProcessPidString = (_config$deviceAndProc = config.deviceAndProcess) === null || _config$deviceAndProc === void 0 ? void 0 : (_config$deviceAndProc2 = _config$deviceAndProc.selectedProcess) === null || _config$deviceAndProc2 === void 0 ? void 0 : _config$deviceAndProc2.pid;
  const pid = debugMode === 'attach' && selectedProcessPidString != null ? parseInt(selectedProcessPidString, 10) : await (0, _AndroidJavaDebuggerHelpers().getPidFromPackageName)(adbServiceUri, deviceSerial, packageName);

  if (isNaN(pid)) {
    throw new Error('Selected process pid is not a number: ' + JSON.stringify(selectedProcessPidString));
  }

  return pid;
}

async function _getAndroidSdkSourcePaths(targetUri, adbServiceUri, deviceSerial) {
  const sdkVersion = await (0, _nuclideAdb().getAdbServiceByNuclideUri)(adbServiceUri).getAPIVersion(deviceSerial);
  const sdkSourcePath = sdkVersion !== '' ? await (0, _utils().getJavaDebuggerHelpersServiceByNuclideUri)(targetUri).getSdkVersionSourcePath(sdkVersion, {
    useSdkManager: _nuclideUri().default.isLocal(targetUri)
  }) : null;

  if (sdkSourcePath == null) {
    atom.notifications.addInfo('Unable to find Android Sdk Sources for version: ' + sdkVersion + '. Check if they are installed. Nuclide can still debug your application, but source code for frames inside Android library routines will not be available.');
  }

  (0, _analytics().track)(_constants().AnalyticsEvents.ANDROID_DEBUGGER_SDK_SOURCES, {
    deviceSerial,
    sdkVersion,
    sdkSourcePathExists: sdkSourcePath != null,
    sdkSourcePath
  });
  const sdkSourcePathResolved = sdkSourcePath != null ? _nuclideUri().default.getPath(sdkSourcePath) : null;
  return sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];
}

async function resolveConfiguration(configuration) {
  var _config$adbServiceUri, _config$selectSources;

  // adapterType === VsAdapterTypes.JAVA_ANDROID
  const {
    config,
    debugMode,
    targetUri
  } = configuration;
  const adbServiceUri = (_config$adbServiceUri = config.adbServiceUri) !== null && _config$adbServiceUri !== void 0 ? _config$adbServiceUri : targetUri;
  const resolvedTargetUri = (_config$selectSources = config.selectSources) !== null && _config$selectSources !== void 0 ? _config$selectSources : targetUri;

  const packageName = _getPackageName(debugMode, config);

  const deviceSerial = _getDeviceSerial(debugMode, config);

  (0, _analytics().track)('atom-ide-debugger-java-android-configuration', {
    adbServiceUri,
    packageName,
    deviceSerial,
    debugMode
  });

  if (debugMode === 'launch') {
    const {
      service,
      intent,
      activity
    } = config;
    await (0, _AndroidJavaDebuggerHelpers().launchAndroidServiceOrActivity)(adbServiceUri, service, activity, intent,
    /* intent and action are the same */
    deviceSerial, packageName);
  }

  const pid = await _getPid(debugMode, config, adbServiceUri, deviceSerial, packageName);
  const subscriptions = new (_UniversalDisposable().default)();
  const attachPortTargetConfig = await (0, _AndroidJavaDebuggerHelpers().getAdbAttachPortTargetInfo)(deviceSerial, adbServiceUri, resolvedTargetUri, pid, subscriptions, packageName);
  const androidSdkSourcePaths = await _getAndroidSdkSourcePaths(resolvedTargetUri, adbServiceUri, deviceSerial);
  const clickEvents = new _rxjsCompatUmdMin.Subject();
  const adapterExecutable = await (0, _utils().getJavaDebuggerHelpersServiceByNuclideUri)(resolvedTargetUri).getJavaVSAdapterExecutableInfo(false);
  let processName = packageName; // Gets rid of path to package.

  const lastPeriod = processName.lastIndexOf('.');

  if (lastPeriod >= 0) {
    processName = processName.substring(lastPeriod + 1, processName.length);
  }

  return Object.assign({}, configuration, {
    targetUri: resolvedTargetUri,
    debugMode: 'attach',
    adapterExecutable,
    customControlButtons: getCustomControlButtonsForJavaSourcePaths(clickEvents),
    servicedFileExtensions: ['java'],
    config: Object.assign({}, attachPortTargetConfig, {
      deviceSerial,
      packageName,
      grammarName: 'source.java'
    }),
    onDebugStartingCallback: instance => {
      subscriptions.add(...(0, _utils().getSourcePathClickSubscriptions)(resolvedTargetUri, instance, clickEvents, androidSdkSourcePaths));
      return subscriptions;
    },
    processName
  });
}