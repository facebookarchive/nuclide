'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dumpsysPackage = exports.getJavaProcesses = exports.activityExists = exports.launchActivity = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.startServer = exports.getDeviceList = exports.getDeviceInfo = exports.registerAdbPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAdb = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_Adb || _load_Adb()).Adb((yield (0, (_DebugBridgePathStore || _load_DebugBridgePathStore()).pathForDebugBridge)('adb')));
  });

  return function getAdb() {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

let registerAdbPath = exports.registerAdbPath = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (id, path, priority = -1) {
    (0, (_DebugBridgePathStore || _load_DebugBridgePathStore()).getStore)('adb').registerPath(id, { path, priority });
  });

  return function registerAdbPath(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
})();

let getDeviceInfo = exports.getDeviceInfo = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (device) {
    return (yield getAdb()).getDeviceInfo(device);
  });

  return function getDeviceInfo(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let getDeviceList = exports.getDeviceList = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* () {
    return (yield getAdb()).getDeviceList();
  });

  return function getDeviceList() {
    return _ref4.apply(this, arguments);
  };
})();

let startServer = exports.startServer = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* () {
    return (yield getAdb()).startServer();
  });

  return function startServer() {
    return _ref5.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getAdb()).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x4, _x5) {
    return _ref6.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (device, tcpPort, pid) {
    return (yield getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x6, _x7, _x8) {
    return _ref7.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, packageName, activity, debug, action) {
    return (yield getAdb()).launchActivity(device, packageName, activity, debug, action);
  });

  return function launchActivity(_x9, _x10, _x11, _x12, _x13) {
    return _ref8.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (device, packageName, activity) {
    return (yield getAdb()).activityExists(device, packageName, activity);
  });

  return function activityExists(_x14, _x15, _x16) {
    return _ref9.apply(this, arguments);
  };
})();

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (device) {
    return (yield getAdb()).getJavaProcesses(device);
  });

  return function getJavaProcesses(_x17) {
    return _ref10.apply(this, arguments);
  };
})();

let dumpsysPackage = exports.dumpsysPackage = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return (yield getAdb()).dumpsysPackage(device, identifier);
  });

  return function dumpsysPackage(_x18, _x19) {
    return _ref11.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _DebugBridgePathStore;

function _load_DebugBridgePathStore() {
  return _DebugBridgePathStore = require('./DebugBridgePathStore');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return _rxjsBundlesRxMinJs.Observable.defer(() => getAdb()).switchMap(d => d.installPackage(device, packagePath)).publish();
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return _rxjsBundlesRxMinJs.Observable.defer(() => getAdb()).switchMap(d => d.uninstallPackage(device, packageName)).publish();
}