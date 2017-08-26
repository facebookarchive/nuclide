'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchApp = exports.getFileContentsAtPath = exports.getPidFromPackageName = exports.registerCustomPath = exports.getFullConfig = exports.registerSdbPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let registerSdbPath = exports.registerSdbPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (id, path, priority = -1) {
    (0, (_Store || _load_Store()).getStore)(SDB).registerPath(id, { path, priority });
  });

  return function registerSdbPath(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getFullConfig = exports.getFullConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return (0, (_Store || _load_Store()).getStore)(SDB).getFullConfig();
  });

  return function getFullConfig() {
    return _ref2.apply(this, arguments);
  };
})();

let registerCustomPath = exports.registerCustomPath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (path) {
    (0, (_Store || _load_Store()).getStore)(SDB).registerCustomPath(path);
  });

  return function registerCustomPath(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return new (_Processes || _load_Processes()).Processes(new (_Sdb || _load_Sdb()).Sdb(device)).getPidFromPackageName(packageName);
  });

  return function getPidFromPackageName(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

let getFileContentsAtPath = exports.getFileContentsAtPath = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, path) {
    return new (_Sdb || _load_Sdb()).Sdb(device).getFileContentsAtPath(path);
  });

  return function getFileContentsAtPath(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

let launchApp = exports.launchApp = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return new (_Sdb || _load_Sdb()).Sdb(device).launchApp(identifier);
  });

  return function launchApp(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
})();

exports.getDeviceInfo = getDeviceInfo;
exports.getDeviceList = getDeviceList;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _Store;

function _load_Store() {
  return _Store = require('./common/Store');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('./bridges/Sdb');
}

var _Processes;

function _load_Processes() {
  return _Processes = require('./common/Processes');
}

var _Devices;

function _load_Devices() {
  return _Devices = require('./common/Devices');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const SDB = 'sdb';

function getDeviceInfo(device) {
  return new (_Sdb || _load_Sdb()).Sdb(device).getDeviceInfo().publish();
}

function getDeviceList() {
  return new (_Devices || _load_Devices()).Devices((_Sdb || _load_Sdb()).Sdb).getDeviceList().publish();
}

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return new (_Sdb || _load_Sdb()).Sdb(device).installPackage(packagePath).publish();
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return new (_Sdb || _load_Sdb()).Sdb(device).uninstallPackage(packageName).publish();
}