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

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
      threads: true,
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
      threads: true,
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
  var _ref, _ref2;

  return (0, _nullthrows().default)(debugMode === 'launch' ? (_ref = config) != null ? (_ref = _ref.deviceAndPackage) != null ? _ref.selectedPackage : _ref : _ref : (_ref2 = config) != null ? (_ref2 = _ref2.deviceAndProcess) != null ? (_ref2 = _ref2.selectedProcess) != null ? _ref2.name : _ref2 : _ref2 : _ref2);
}

function _getDevice(debugMode, config) {
  var _ref3, _ref4;

  return (0, _nullthrows().default)(debugMode === 'launch' ? (_ref3 = config) != null ? (_ref3 = _ref3.deviceAndPackage) != null ? _ref3.device : _ref3 : _ref3 : (_ref4 = config) != null ? (_ref4 = _ref4.deviceAndProcess) != null ? _ref4.device : _ref4 : _ref4);
}

async function _getPid(debugMode, config, adbServiceUri, device, packageName) {
  var _ref5;

  const selectedProcessPidString = (_ref5 = config) != null ? (_ref5 = _ref5.deviceAndProcess) != null ? (_ref5 = _ref5.selectedProcess) != null ? _ref5.pid : _ref5 : _ref5 : _ref5;
  const selectedProcessPid = parseInt(selectedProcessPidString, 10);
  const pid = debugMode === 'attach' && selectedProcessPidString != null ? selectedProcessPid : await (0, _AndroidJavaDebuggerHelpers().getPidFromPackageName)(adbServiceUri, device, packageName);

  if (isNaN(pid)) {
    throw new Error('Selected process pid is not a number: ' + JSON.stringify(selectedProcessPidString));
  }

  return pid;
}

function _getResolvedTargetUri(targetUri, config) {
  var _ref6;

  const selectSources = (_ref6 = config) != null ? _ref6.selectSources : _ref6;
  return selectSources != null ? selectSources : targetUri;
}

function _getAdbServiceUri(unresolvedTargetUri, config) {
  var _ref7;

  const adbServiceUri = (_ref7 = config) != null ? _ref7.adbServiceUri : _ref7;
  return adbServiceUri != null ? adbServiceUri : unresolvedTargetUri;
}

async function _getAndroidSdkSourcePaths(targetUri, adbServiceUri, device) {
  const sdkVersion = await (0, _nuclideAdb().getAdbServiceByNuclideUri)(adbServiceUri).getAPIVersion(device.serial);
  const sdkSourcePath = sdkVersion !== '' ? await (0, _utils().getJavaDebuggerHelpersServiceByNuclideUri)(targetUri).getSdkVersionSourcePath(sdkVersion) : null;

  if (sdkSourcePath == null) {
    atom.notifications.addInfo('Unable to find Android Sdk Sources for version: ' + sdkVersion + '. Check if they are installed. Nuclide can still debug your application, but source code for frames inside Android library routines will not be available.');
  }

  (0, _analytics().track)(_constants().AnalyticsEvents.ANDROID_DEBUGGER_SDK_SOURCES, {
    deviceSerial: device.serial,
    sdkVersion,
    sdkSourcePathExists: sdkSourcePath != null,
    sdkSourcePath
  });
  const sdkSourcePathResolved = sdkSourcePath != null ? _nuclideUri().default.getPath(sdkSourcePath) : null;
  return sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];
}

async function resolveConfiguration(configuration) {
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  const {
    config,
    debugMode,
    targetUri
  } = configuration;

  const adbServiceUri = _getAdbServiceUri(targetUri, config);

  const resolvedTargetUri = _getResolvedTargetUri(targetUri, config);

  const packageName = _getPackageName(debugMode, config);

  const device = _getDevice(debugMode, config);

  if (debugMode === 'launch') {
    const {
      service,
      intent,
      activity
    } = config;
    await (0, _AndroidJavaDebuggerHelpers().launchAndroidServiceOrActivity)(adbServiceUri, service, activity, intent,
    /* intent and action are the same */
    device, packageName);
  }

  const pid = await _getPid(debugMode, config, adbServiceUri, device, packageName);
  const subscriptions = new (_UniversalDisposable().default)();
  const attachPortTargetConfig = await (0, _AndroidJavaDebuggerHelpers().getAdbAttachPortTargetInfo)(device, adbServiceUri, resolvedTargetUri, pid, subscriptions, packageName);
  const customDisposable = configuration.customDisposable || new (_UniversalDisposable().default)();
  customDisposable.add(subscriptions);
  const androidSdkSourcePaths = await _getAndroidSdkSourcePaths(resolvedTargetUri, adbServiceUri, device);
  const clickEvents = new _RxMin.Subject();

  const onInitializeCallback = async session => {
    customDisposable.add(...(0, _utils().getSourcePathClickSubscriptions)(resolvedTargetUri, session, clickEvents, androidSdkSourcePaths));
  };

  const adapterExecutable = await (0, _utils().getJavaDebuggerHelpersServiceByNuclideUri)(resolvedTargetUri).getJavaVSAdapterExecutableInfo(false);

  let processName = _getPackageName(debugMode, config); // Gets rid of path to package.


  const lastPeriod = processName.lastIndexOf('.');

  if (lastPeriod >= 0) {
    processName = processName.substring(lastPeriod + 1, processName.length);
  }

  processName += ' (Android)';
  return Object.assign({}, configuration, {
    targetUri: resolvedTargetUri,
    debugMode: 'attach',
    adapterExecutable,
    customControlButtons: getCustomControlButtonsForJavaSourcePaths(clickEvents),
    config: attachPortTargetConfig,
    customDisposable,
    onInitializeCallback,
    processName
  });
}