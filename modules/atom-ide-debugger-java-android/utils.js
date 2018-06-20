'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_DEBUGGER_DEV_GK = undefined;
exports.getJavaAndroidConfig = getJavaAndroidConfig;
exports.getCustomControlButtonsForJavaSourcePaths = getCustomControlButtonsForJavaSourcePaths;
exports.resolveConfiguration = resolveConfiguration;

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../nuclide-adb');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

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
 * 
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
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA_ANDROID,
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
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA_ANDROID,
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
  var _ref, _ref2, _ref3, _ref4, _ref5;

  return (0, (_nullthrows || _load_nullthrows()).default)(debugMode === 'launch' ? (_ref = config) != null ? (_ref2 = _ref.deviceAndPackage) != null ? _ref2.selectedPackage : _ref2 : _ref : (_ref3 = config) != null ? (_ref4 = _ref3.deviceAndProcess) != null ? (_ref5 = _ref4.selectedProcess) != null ? _ref5.name : _ref5 : _ref4 : _ref3);
}

function _getDevice(debugMode, config) {
  var _ref6, _ref7, _ref8, _ref9;

  return (0, (_nullthrows || _load_nullthrows()).default)(debugMode === 'launch' ? (_ref6 = config) != null ? (_ref7 = _ref6.deviceAndPackage) != null ? _ref7.device : _ref7 : _ref6 : (_ref8 = config) != null ? (_ref9 = _ref8.deviceAndProcess) != null ? _ref9.device : _ref9 : _ref8);
}

async function _getPid(debugMode, config, adbServiceUri, device, packageName) {
  var _ref10, _ref11, _ref12;

  const selectedProcessPidString = (_ref10 = config) != null ? (_ref11 = _ref10.deviceAndProcess) != null ? (_ref12 = _ref11.selectedProcess) != null ? _ref12.pid : _ref12 : _ref11 : _ref10;
  const selectedProcessPid = parseInt(selectedProcessPidString, 10);
  const pid = debugMode === 'attach' && selectedProcessPidString != null ? selectedProcessPid : await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).getPidFromPackageName)(adbServiceUri, device, packageName);
  if (isNaN(pid)) {
    throw new Error('Selected process pid is not a number: ' + JSON.stringify(selectedProcessPidString));
  }
  return pid;
}

function _getResolvedTargetUri(targetUri, config) {
  var _ref13;

  const selectSources = (_ref13 = config) != null ? _ref13.selectSources : _ref13;
  return selectSources != null ? selectSources : targetUri;
}

function _getAdbServiceUri(unresolvedTargetUri, config) {
  var _ref14;

  const adbServiceUri = (_ref14 = config) != null ? _ref14.adbServiceUri : _ref14;
  return adbServiceUri != null ? adbServiceUri : unresolvedTargetUri;
}

async function _getAndroidSdkSourcePaths(targetUri, adbServiceUri, device) {
  const sdkVersion = await (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(adbServiceUri).getAPIVersion(device.name);
  const sdkSourcePath = sdkVersion !== '' ? await (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(targetUri).getSdkVersionSourcePath(sdkVersion) : null;
  const sdkSourcePathResolved = sdkSourcePath != null ? (_nuclideUri || _load_nuclideUri()).default.getPath(sdkSourcePath) : null;
  return sdkSourcePathResolved != null ? [sdkSourcePathResolved] : [];
}

async function resolveConfiguration(configuration) {
  // adapterType === VsAdapterTypes.JAVA_ANDROID
  const { config, debugMode, targetUri } = configuration;
  const adbServiceUri = _getAdbServiceUri(targetUri, config);
  const resolvedTargetUri = _getResolvedTargetUri(targetUri, config);
  const packageName = _getPackageName(debugMode, config);
  const device = _getDevice(debugMode, config);
  if (debugMode === 'launch') {
    const { service, intent, activity } = config;
    await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).launchAndroidServiceOrActivity)(adbServiceUri, service, activity, intent, /* intent and action are the same */
    device, packageName);
  }

  const pid = await _getPid(debugMode, config, adbServiceUri, device, packageName);

  const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const attachPortTargetConfig = await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).getAdbAttachPortTargetInfo)(device, adbServiceUri, resolvedTargetUri, pid, subscriptions);

  const customDisposable = configuration.customDisposable || new (_UniversalDisposable || _load_UniversalDisposable()).default();
  customDisposable.add(subscriptions);

  const androidSdkSourcePaths = await _getAndroidSdkSourcePaths(resolvedTargetUri, adbServiceUri, device);

  const clickEvents = new _rxjsBundlesRxMinJs.Subject();
  const onInitializeCallback = async session => {
    customDisposable.add(...(0, (_utils || _load_utils()).getSourcePathClickSubscriptions)(resolvedTargetUri, session, clickEvents, androidSdkSourcePaths));
  };

  const adapterExecutable = await (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(resolvedTargetUri).getJavaVSAdapterExecutableInfo(false);

  let processName = _getPackageName(debugMode, config);

  // Gets rid of path to package.
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