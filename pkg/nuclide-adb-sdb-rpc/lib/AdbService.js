'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dumpsysPackage = exports.getJavaProcesses = exports.activityExists = exports.launchActivity = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.startServer = exports.getDeviceList = exports.stopPackage = exports.getProcesses = exports.getDeviceInfo = exports.registerAdbPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let getAdb = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_Adb || _load_Adb()).Adb((yield (0, (_AdbSdbPathStore || _load_AdbSdbPathStore()).pathForDebugBridge)('adb')));
  });

  return function getAdb() {
    return _ref.apply(this, arguments);
  };
})();

let registerAdbPath = exports.registerAdbPath = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (id, path, priority = -1) {
    (0, (_AdbSdbPathStore || _load_AdbSdbPathStore()).getStore)('adb').registerPath(id, { path, priority });
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

let getProcesses = exports.getProcesses = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device) {
    return new (_AdbTop || _load_AdbTop()).AdbTop((yield getAdb()), device).fetch();
  });

  return function getProcesses(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let stopPackage = exports.stopPackage = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getAdb()).stopPackage(device, packageName);
  });

  return function stopPackage(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
})();

let getDeviceList = exports.getDeviceList = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* () {
    return (yield getAdb()).getDeviceList();
  });

  return function getDeviceList() {
    return _ref6.apply(this, arguments);
  };
})();

let startServer = exports.startServer = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* () {
    try {
      return (yield getAdb()).startServer();
    } catch (e) {
      return false;
    }
  });

  return function startServer() {
    return _ref7.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getAdb()).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x7, _x8) {
    return _ref8.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (device, tcpPort, pid) {
    return (yield getAdb()).forwardJdwpPortToPid(device, tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x9, _x10, _x11) {
    return _ref9.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (device, packageName, activity, debug, action) {
    return (yield getAdb()).launchActivity(device, packageName, activity, debug, action);
  });

  return function launchActivity(_x12, _x13, _x14, _x15, _x16) {
    return _ref10.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (device, packageName, activity) {
    return (yield getAdb()).activityExists(device, packageName, activity);
  });

  return function activityExists(_x17, _x18, _x19) {
    return _ref11.apply(this, arguments);
  };
})();

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (device) {
    return (yield getAdb()).getJavaProcesses(device);
  });

  return function getJavaProcesses(_x20) {
    return _ref12.apply(this, arguments);
  };
})();

let dumpsysPackage = exports.dumpsysPackage = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return (yield getAdb()).dumpsysPackage(device, identifier);
  });

  return function dumpsysPackage(_x21, _x22) {
    return _ref13.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _AdbSdbPathStore;

function _load_AdbSdbPathStore() {
  return _AdbSdbPathStore = require('./AdbSdbPathStore');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

var _AdbTop;

function _load_AdbTop() {
  return _AdbTop = require('./AdbTop');
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