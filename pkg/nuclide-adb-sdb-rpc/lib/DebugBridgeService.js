'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJavaProcesses = exports.activityExists = exports.launchActivity = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.getDeviceList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let getAdb = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_Adb || _load_Adb()).Adb((yield (0, (_DebugBridge || _load_DebugBridge()).pathForDebugBridge)('adb')));
  });

  return function getAdb() {
    return _ref.apply(this, arguments);
  };
})();

let getSdb = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return new (_Sdb || _load_Sdb()).Sdb((yield (0, (_DebugBridge || _load_DebugBridge()).pathForDebugBridge)('sdb')));
  });

  return function getSdb() {
    return _ref2.apply(this, arguments);
  };
})();

let getDeviceList = exports.getDeviceList = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (db) {
    return (yield getDb(db)).getDeviceList();
  });

  return function getDeviceList(_x) {
    return _ref3.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (db, device, packageName) {
    return (yield getDb(db)).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x2, _x3, _x4) {
    return _ref4.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (db, device, tcpPort, pid) {
    if (!(db === 'adb')) {
      throw new Error('only supported on android');
    }

    return (yield getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x5, _x6, _x7, _x8) {
    return _ref5.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (db, device, packageName, activity, debug, action) {
    if (!(db === 'adb')) {
      throw new Error('only supported on android');
    }

    return (yield getAdb()).launchActivity(device, packageName, activity, debug, action);
  });

  return function launchActivity(_x9, _x10, _x11, _x12, _x13, _x14) {
    return _ref6.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (db, device, packageName, activity) {
    if (!(db === 'adb')) {
      throw new Error('only supported on android');
    }

    return (yield getAdb()).activityExists(device, packageName, activity);
  });

  return function activityExists(_x15, _x16, _x17, _x18) {
    return _ref7.apply(this, arguments);
  };
})();

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (db, device) {
    if (!(db === 'adb')) {
      throw new Error('only supported on android');
    }

    return (yield getAdb()).getJavaProcesses(device);
  });

  return function getJavaProcesses(_x19, _x20) {
    return _ref8.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('./Sdb');
}

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDb(db) {
  switch (db) {
    case 'adb':
      return getAdb();
    case 'sdb':
      return getSdb();
  }
  throw new Error('unreacable');
}

function installPackage(db, device, packagePath) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getDb(db)).switchMap(d => d.installPackage(device, packagePath)).publish();
}

function uninstallPackage(db, device, packageName) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getDb(db)).switchMap(d => d.uninstallPackage(device, packageName)).publish();
}