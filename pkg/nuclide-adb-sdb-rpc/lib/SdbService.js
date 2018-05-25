'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerSdbPath = registerSdbPath;
exports.getFullConfig = getFullConfig;
exports.registerCustomPath = registerCustomPath;
exports.getDeviceInfo = getDeviceInfo;
exports.getDeviceList = getDeviceList;
exports.getPidFromPackageName = getPidFromPackageName;
exports.getFileContentsAtPath = getFileContentsAtPath;
exports.installPackage = installPackage;
exports.launchApp = launchApp;
exports.stopProcess = stopProcess;
exports.uninstallPackage = uninstallPackage;
exports.getProcesses = getProcesses;

var _Store;

function _load_Store() {
  return _Store = require('../../../modules/nuclide-adb/lib/common/Store');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('./bridges/Sdb');
}

var _Processes;

function _load_Processes() {
  return _Processes = require('../../../modules/nuclide-adb/lib/common/Processes');
}

var _Devices;

function _load_Devices() {
  return _Devices = require('../../../modules/nuclide-adb/lib/common/Devices');
}

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

async function registerSdbPath(id, path, priority = -1) {
  (0, (_Store || _load_Store()).getStore)(SDB).registerPath(id, { path, priority });
}

async function getFullConfig() {
  return (0, (_Store || _load_Store()).getStore)(SDB).getFullConfig();
}

async function registerCustomPath(path) {
  (0, (_Store || _load_Store()).getStore)(SDB).registerCustomPath(path);
}

function getDeviceInfo(device) {
  return new (_Sdb || _load_Sdb()).Sdb(device).getDeviceInfo().publish();
}

function getDeviceList() {
  return new (_Devices || _load_Devices()).Devices((_Sdb || _load_Sdb()).Sdb).getDeviceList().publish();
}

async function getPidFromPackageName(device, packageName) {
  return new (_Processes || _load_Processes()).Processes(new (_Sdb || _load_Sdb()).Sdb(device)).getPidFromPackageName(packageName);
}

async function getFileContentsAtPath(device, path) {
  return new (_Sdb || _load_Sdb()).Sdb(device).getFileContentsAtPath(path);
}

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return new (_Sdb || _load_Sdb()).Sdb(device).installPackage(packagePath).publish();
}

async function launchApp(device, identifier) {
  return new (_Sdb || _load_Sdb()).Sdb(device).launchApp(identifier);
}

async function stopProcess(device, packageName, pid) {
  return new (_Sdb || _load_Sdb()).Sdb(device).stopProcess(packageName, pid);
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return new (_Sdb || _load_Sdb()).Sdb(device).uninstallPackage(packageName).publish();
}

function getProcesses(device, timeout) {
  return new (_Processes || _load_Processes()).Processes(new (_Sdb || _load_Sdb()).Sdb(device)).fetch(timeout).publish();
}