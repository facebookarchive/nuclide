'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServer = startServer;
exports.getDeviceList = getDeviceList;
exports.getDeviceArchitecture = getDeviceArchitecture;
exports.getDeviceModel = getDeviceModel;
exports.getAPIVersion = getAPIVersion;
exports.getPidFromPackageName = getPidFromPackageName;
exports.forwardJdwpPortToPid = forwardJdwpPortToPid;

var _ADB;

function _load_ADB() {
  return _ADB = _interopRequireWildcard(require('./ADB'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function startServer(adbPath) {
  return (_ADB || _load_ADB()).startServer(adbPath);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

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

function getPidFromPackageName(adbPath, packageName) {
  return (_ADB || _load_ADB()).getPidFromPackageName(adbPath, packageName);
}

function forwardJdwpPortToPid(adbPath, tcpPort, pid) {
  return (_ADB || _load_ADB()).forwardJdwpPortToPid(adbPath, tcpPort, pid);
}