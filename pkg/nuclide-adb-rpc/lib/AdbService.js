'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJavaProcesses = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (adbPath, device) {
    return (_ADB || _load_ADB()).getJavaProcesses(adbPath, device);
  });

  return function getJavaProcesses(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.startServer = startServer;
exports.getDeviceList = getDeviceList;
exports.getDeviceArchitecture = getDeviceArchitecture;
exports.getDeviceModel = getDeviceModel;
exports.getAPIVersion = getAPIVersion;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;
exports.getPidFromPackageName = getPidFromPackageName;
exports.forwardJdwpPortToPid = forwardJdwpPortToPid;
exports.launchActivity = launchActivity;
exports.activityExists = activityExists;

var _ADB;

function _load_ADB() {
  return _ADB = _interopRequireWildcard(require('./ADB'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function startServer(adbPath) {
  return (_ADB || _load_ADB()).startServer(adbPath);
}

function getDeviceList(adbPath) {
  return (_ADB || _load_ADB()).getDeviceList(adbPath);
}

function getDeviceArchitecture(adbPath, device) {
  return (_ADB || _load_ADB()).getDeviceArchitecture(adbPath, device);
}

function getDeviceModel(adbPath, device) {
  return (_ADB || _load_ADB()).getDeviceModel(adbPath, device);
}

function getAPIVersion(adbPath, device) {
  return (_ADB || _load_ADB()).getAPIVersion(adbPath, device);
}

function installPackage(adbPath, device, packagePath) {
  return (_ADB || _load_ADB()).installPackage(adbPath, device, packagePath).publish();
}

function uninstallPackage(adbPath, device, packageName) {
  return (_ADB || _load_ADB()).uninstallPackage(adbPath, device, packageName).publish();
}

function getPidFromPackageName(adbPath, device, packageName) {
  return (_ADB || _load_ADB()).getPidFromPackageName(adbPath, device, packageName);
}

function forwardJdwpPortToPid(adbPath, device, tcpPort, pid) {
  return (_ADB || _load_ADB()).forwardJdwpPortToPid(adbPath, device, tcpPort, pid);
}

function launchActivity(adbPath, device, packageName, activity, action) {
  return (_ADB || _load_ADB()).launchActivity(adbPath, device, packageName, activity, action);
}

function activityExists(adbPath, device, packageName, activity) {
  return (_ADB || _load_ADB()).activityExists(adbPath, device, packageName, activity);
}