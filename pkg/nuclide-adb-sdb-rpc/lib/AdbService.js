'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dumpsysPackage = exports.getJavaProcesses = exports.activityExists = exports.launchActivity = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.getDeviceList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAdb = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_Adb || _load_Adb()).Adb((yield (0, (_DebugBridge || _load_DebugBridge()).pathForDebugBridge)('adb')));
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
       */

let getDeviceList = exports.getDeviceList = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return (yield getAdb()).getDeviceList();
  });

  return function getDeviceList() {
    return _ref2.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getAdb()).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device, tcpPort, pid) {
    return (yield getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x3, _x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, packageName, activity, debug, action) {
    return (yield getAdb()).launchActivity(device, packageName, activity, debug, action);
  });

  return function launchActivity(_x6, _x7, _x8, _x9, _x10) {
    return _ref5.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, packageName, activity) {
    return (yield getAdb()).activityExists(device, packageName, activity);
  });

  return function activityExists(_x11, _x12, _x13) {
    return _ref6.apply(this, arguments);
  };
})();

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (device) {
    return (yield getAdb()).getJavaProcesses(device);
  });

  return function getJavaProcesses(_x14) {
    return _ref7.apply(this, arguments);
  };
})();

let dumpsysPackage = exports.dumpsysPackage = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return (yield getAdb()).dumpsysPackage(device, identifier);
  });

  return function dumpsysPackage(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installPackage(device, packagePath) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getAdb()).switchMap(d => d.installPackage(device, packagePath)).publish();
}

function uninstallPackage(device, packageName) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getAdb()).switchMap(d => d.uninstallPackage(device, packageName)).publish();
}