'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerAdbPath = registerAdbPath;
exports.getFullConfig = getFullConfig;
exports.registerCustomPath = registerCustomPath;
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
exports.getInstalledPackages = getInstalledPackages;
exports.addAdbPort = addAdbPort;
exports.removeAdbPort = removeAdbPort;
exports.getAdbPorts = getAdbPorts;
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

var _Store;

function _load_Store() {
  return _Store = require('./common/Store');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./bridges/Adb');
}

var _Processes;

function _load_Processes() {
  return _Processes = require('./common/Processes');
}

var _Devices;

function _load_Devices() {
  return _Devices = require('./common/Devices');
}

var _process;

function _load_process() {
  return _process = require('../../nuclide-commons/process');
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

const ADB = 'adb';

async function registerAdbPath(id, path, priority = -1) {
  (0, (_Store || _load_Store()).getStore)(ADB).registerPath(id, { path, priority });
}

async function getFullConfig() {
  return (0, (_Store || _load_Store()).getStore)(ADB).getFullConfig();
}

async function registerCustomPath(path) {
  (0, (_Store || _load_Store()).getStore)(ADB).registerCustomPath(path);
}

function getDeviceInfo(device) {
  return new (_Adb || _load_Adb()).Adb(device).getDeviceInfo().publish();
}

function getProcesses(device, timeout) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).fetch(timeout).publish();
}

async function stopProcess(device, packageName, pid) {
  return new (_Adb || _load_Adb()).Adb(device).stopProcess(packageName, pid);
}

function getDeviceList(options) {
  return new (_Devices || _load_Devices()).Devices((_Adb || _load_Adb()).Adb).getDeviceList(options).publish();
}

async function getPidFromPackageName(device, packageName) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).getPidFromPackageName(packageName);
}

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(device).installPackage(packagePath).publish();
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(device).uninstallPackage(packageName).publish();
}

async function forwardJdwpPortToPid(device, tcpPort, pid) {
  return new (_Adb || _load_Adb()).Adb(device).forwardJdwpPortToPid(tcpPort, pid);
}

async function removeJdwpForwardSpec(device, spec) {
  return new (_Adb || _load_Adb()).Adb(device).removeJdwpForwardSpec(spec);
}

async function launchActivity(device, packageName, activity, debug, action, parameters) {
  return new (_Adb || _load_Adb()).Adb(device).launchActivity(packageName, activity, debug, action, parameters);
}

async function launchMainActivity(device, packageName, debug) {
  return new (_Adb || _load_Adb()).Adb(device).launchMainActivity(packageName, debug);
}

async function launchService(device, packageName, serviceName, debug) {
  return new (_Adb || _load_Adb()).Adb(device).launchService(packageName, serviceName, debug);
}

async function activityExists(device, packageName, activity) {
  return new (_Adb || _load_Adb()).Adb(device).activityExists(packageName, activity);
}

async function getAllAvailablePackages(device) {
  return new (_Adb || _load_Adb()).Adb(device).getAllAvailablePackages();
}

function getJavaProcesses(device) {
  return new (_Adb || _load_Adb()).Adb(device).getJavaProcesses().publish();
}

async function dumpsysPackage(device, identifier) {
  return new (_Adb || _load_Adb()).Adb(device).dumpsysPackage(identifier);
}

async function touchFile(device, path) {
  return new (_Adb || _load_Adb()).Adb(device).touchFile(path);
}

async function removeFile(device, path) {
  return new (_Adb || _load_Adb()).Adb(device).removeFile(path);
}

async function getInstalledPackages(device) {
  return new (_Adb || _load_Adb()).Adb(device).getInstalledPackages();
}

function addAdbPort(port) {
  (0, (_Store || _load_Store()).getStore)('adb').addPort(port);
}

function removeAdbPort(port) {
  (0, (_Store || _load_Store()).getStore)('adb').removePort(port);
}

function getAdbPorts() {
  return Promise.resolve((0, (_Store || _load_Store()).getStore)('adb').getPorts());
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