'use strict';

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
exports.getInstalledPackages = getInstalledPackages;
exports.killServer = killServer;
exports.getApkManifest = getApkManifest;
exports.getVersion = getVersion;
exports.checkMuxStatus = checkMuxStatus;
exports.checkInMuxPort = checkInMuxPort;
exports.checkOutMuxPort = checkOutMuxPort;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

var _Processes;

function _load_Processes() {
  return _Processes = require('./common/Processes');
}

var _process;

function _load_process() {
  return _process = require('../../nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDeviceInfo(serial) {
  return new (_Adb || _load_Adb()).Adb(serial).getDeviceInfo().publish();
} /**
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

function getProcesses(serial, timeout) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(serial)).fetch(timeout).publish();
}

async function stopProcess(serial, packageName, pid) {
  return new (_Adb || _load_Adb()).Adb(serial).stopProcess(packageName, pid);
}

function getDeviceList() {
  return (_Adb || _load_Adb()).Adb.getDevices();
}

async function getPidFromPackageName(serial, packageName) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(serial)).getPidFromPackageName(packageName);
}

function installPackage(serial, packagePath) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(serial).installPackage(packagePath).publish();
}

function uninstallPackage(serial, packageName) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(serial).uninstallPackage(packageName).publish();
}

async function forwardJdwpPortToPid(serial, tcpPort, pid) {
  return new (_Adb || _load_Adb()).Adb(serial).forwardJdwpPortToPid(tcpPort, pid);
}

async function removeJdwpForwardSpec(serial, spec) {
  return new (_Adb || _load_Adb()).Adb(serial).removeJdwpForwardSpec(spec);
}

async function launchActivity(serial, packageName, activity, debug, action, parameters) {
  return new (_Adb || _load_Adb()).Adb(serial).launchActivity(packageName, activity, debug, action, parameters);
}

async function launchMainActivity(serial, packageName, debug) {
  return new (_Adb || _load_Adb()).Adb(serial).launchMainActivity(packageName, debug);
}

async function launchService(serial, packageName, serviceName, debug) {
  return new (_Adb || _load_Adb()).Adb(serial).launchService(packageName, serviceName, debug);
}

async function activityExists(serial, packageName, activity) {
  return new (_Adb || _load_Adb()).Adb(serial).activityExists(packageName, activity);
}

async function getAllAvailablePackages(serial) {
  return new (_Adb || _load_Adb()).Adb(serial).getAllAvailablePackages();
}

function getJavaProcesses(serial) {
  return new (_Adb || _load_Adb()).Adb(serial).getJavaProcesses().publish();
}

async function dumpsysPackage(serial, identifier) {
  return new (_Adb || _load_Adb()).Adb(serial).dumpsysPackage(identifier);
}

async function touchFile(serial, path) {
  return new (_Adb || _load_Adb()).Adb(serial).touchFile(path);
}

async function removeFile(serial, path) {
  return new (_Adb || _load_Adb()).Adb(serial).removeFile(path);
}

async function getAPIVersion(serial) {
  return new (_Adb || _load_Adb()).Adb(serial).getAPIVersion().toPromise();
}

async function getInstalledPackages(serial) {
  return new (_Adb || _load_Adb()).Adb(serial).getInstalledPackages();
}

async function killServer() {
  return (_Adb || _load_Adb()).Adb.killServer();
}

async function getAaptBinary(buildToolsVersion) {
  if (process.env.ANDROID_SDK == null || buildToolsVersion == null) {
    return 'aapt';
  } else {
    const allBuildToolsPath = (_nuclideUri || _load_nuclideUri()).default.join(process.env.ANDROID_SDK, 'build-tools');
    const exactBuildToolPath = (_nuclideUri || _load_nuclideUri()).default.join(allBuildToolsPath, buildToolsVersion);
    const aaptPath = (_nuclideUri || _load_nuclideUri()).default.join(exactBuildToolPath, 'aapt');
    if (await (_fsPromise || _load_fsPromise()).default.exists(aaptPath)) {
      return aaptPath;
    } else {
      return 'aapt';
    }
  }
}

async function getApkManifest(apkPath, buildToolsVersion) {
  const aaptBinary = await getAaptBinary(buildToolsVersion);
  return (0, (_process || _load_process()).runCommand)(aaptBinary, ['dump', 'badging', apkPath]).toPromise();
}

async function getVersion() {
  return (_Adb || _load_Adb()).Adb.getVersion();
}

async function checkMuxStatus() {
  try {
    await (0, (_process || _load_process()).runCommand)('adbmux', ['status']).ignoreElements().toPromise();
  } catch (_) {
    return false;
  }
  return true;
}

function checkInMuxPort(port) {
  return (0, (_process || _load_process()).runCommand)('adbmux', ['checkin', `${port}`]).ignoreElements().toPromise();
}

function checkOutMuxPort(port) {
  return (0, (_process || _load_process()).runCommand)('adbmux', ['checkout', `${port}`]).ignoreElements().toPromise();
}