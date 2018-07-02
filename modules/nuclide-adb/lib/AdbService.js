"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceInfo = getDeviceInfo;
exports.getProcesses = getProcesses;
exports.stopProcess = stopProcess;
exports.getDeviceList = getDeviceList;
exports.getPidFromPackageName = getPidFromPackageName;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;
exports.forwardJdwpPortToPid = forwardJdwpPortToPid;
exports.removeJdwpForwardSpec = removeJdwpForwardSpec;
exports.launchActivity = launchActivity;
exports.launchMainActivity = launchMainActivity;
exports.launchService = launchService;
exports.activityExists = activityExists;
exports.getAllAvailablePackages = getAllAvailablePackages;
exports.getJavaProcesses = getJavaProcesses;
exports.dumpsysPackage = dumpsysPackage;
exports.touchFile = touchFile;
exports.removeFile = removeFile;
exports.getAPIVersion = getAPIVersion;
exports.getDeviceArchitecture = getDeviceArchitecture;
exports.getInstalledPackages = getInstalledPackages;
exports.killServer = killServer;
exports.getApkManifest = getApkManifest;
exports.getVersion = getVersion;
exports.checkMuxStatus = checkMuxStatus;
exports.checkInMuxPort = checkInMuxPort;
exports.checkOutMuxPort = checkOutMuxPort;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Adb() {
  const data = require("./Adb");

  _Adb = function () {
    return data;
  };

  return data;
}

function _Processes() {
  const data = require("./common/Processes");

  _Processes = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../nuclide-commons/process");

  _process = function () {
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
function getDeviceInfo(serial) {
  return new (_Adb().Adb)(serial).getDeviceInfo().publish();
}

function getProcesses(serial, timeout) {
  return new (_Processes().Processes)(new (_Adb().Adb)(serial)).fetch(timeout).publish();
}

async function stopProcess(serial, packageName, pid) {
  return new (_Adb().Adb)(serial).stopProcess(packageName, pid);
}

function getDeviceList() {
  return _Adb().Adb.getDevices();
}

async function getPidFromPackageName(serial, packageName) {
  return new (_Processes().Processes)(new (_Adb().Adb)(serial)).getPidFromPackageName(packageName);
}

function installPackage(serial, packagePath) {
  // TODO(T17463635)
  return new (_Adb().Adb)(serial).installPackage(packagePath).publish();
}

function uninstallPackage(serial, packageName) {
  // TODO(T17463635)
  return new (_Adb().Adb)(serial).uninstallPackage(packageName).publish();
}

async function forwardJdwpPortToPid(serial, tcpPort, pid) {
  return new (_Adb().Adb)(serial).forwardJdwpPortToPid(tcpPort, pid);
}

async function removeJdwpForwardSpec(serial, spec) {
  return new (_Adb().Adb)(serial).removeJdwpForwardSpec(spec);
}

async function launchActivity(serial, packageName, activity, debug, action, parameters) {
  return new (_Adb().Adb)(serial).launchActivity(packageName, activity, debug, action, parameters);
}

async function launchMainActivity(serial, packageName, debug) {
  return new (_Adb().Adb)(serial).launchMainActivity(packageName, debug);
}

async function launchService(serial, packageName, serviceName, debug) {
  return new (_Adb().Adb)(serial).launchService(packageName, serviceName, debug);
}

async function activityExists(serial, packageName, activity) {
  return new (_Adb().Adb)(serial).activityExists(packageName, activity);
}

async function getAllAvailablePackages(serial) {
  return new (_Adb().Adb)(serial).getAllAvailablePackages();
}

function getJavaProcesses(serial) {
  return new (_Adb().Adb)(serial).getJavaProcesses().publish();
}

async function dumpsysPackage(serial, identifier) {
  return new (_Adb().Adb)(serial).dumpsysPackage(identifier);
}

async function touchFile(serial, path) {
  return new (_Adb().Adb)(serial).touchFile(path);
}

async function removeFile(serial, path) {
  return new (_Adb().Adb)(serial).removeFile(path);
}

async function getAPIVersion(serial) {
  return new (_Adb().Adb)(serial).getAPIVersion().toPromise();
}

async function getDeviceArchitecture(serial) {
  return new (_Adb().Adb)(serial).getDeviceArchitecture().toPromise();
}

async function getInstalledPackages(serial) {
  return new (_Adb().Adb)(serial).getInstalledPackages();
}

async function killServer() {
  return _Adb().Adb.killServer();
}

async function getAaptBinary(buildToolsVersion) {
  if (process.env.ANDROID_SDK == null || buildToolsVersion == null) {
    return 'aapt';
  } else {
    const allBuildToolsPath = _nuclideUri().default.join(process.env.ANDROID_SDK, 'build-tools');

    const exactBuildToolPath = _nuclideUri().default.join(allBuildToolsPath, buildToolsVersion);

    const aaptPath = _nuclideUri().default.join(exactBuildToolPath, 'aapt');

    if (await _fsPromise().default.exists(aaptPath)) {
      return aaptPath;
    } else {
      return 'aapt';
    }
  }
}

async function getApkManifest(apkPath, buildToolsVersion) {
  const aaptBinary = await getAaptBinary(buildToolsVersion);
  return (0, _process().runCommand)(aaptBinary, ['dump', 'badging', apkPath]).toPromise();
}

async function getVersion() {
  return _Adb().Adb.getVersion();
}

async function checkMuxStatus() {
  try {
    await (0, _process().runCommand)('adbmux', ['status']).ignoreElements().toPromise();
  } catch (_) {
    return false;
  }

  return true;
}

function checkInMuxPort(port) {
  return (0, _process().runCommand)('adbmux', ['checkin', `${port}`]).ignoreElements().toPromise();
}

function checkOutMuxPort(port) {
  return (0, _process().runCommand)('adbmux', ['checkout', `${port}`]).ignoreElements().toPromise();
}