'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDevicePanelProviders = registerDevicePanelProviders;

var _AndroidBridge;

function _load_AndroidBridge() {
  return _AndroidBridge = require('../bridges/AndroidBridge');
}

var _TizenBridge;

function _load_TizenBridge() {
  return _TizenBridge = require('../bridges/TizenBridge');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ATDeviceListProvider;

function _load_ATDeviceListProvider() {
  return _ATDeviceListProvider = require('./ATDeviceListProvider');
}

var _ATDeviceInfoProvider;

function _load_ATDeviceInfoProvider() {
  return _ATDeviceInfoProvider = require('./ATDeviceInfoProvider');
}

var _ATDeviceProcessesProvider;

function _load_ATDeviceProcessesProvider() {
  return _ATDeviceProcessesProvider = require('./ATDeviceProcessesProvider');
}

var _ATDeviceStopPackageProvider;

function _load_ATDeviceStopPackageProvider() {
  return _ATDeviceStopPackageProvider = require('./ATDeviceStopPackageProvider');
}

var _ATConfigurePathTaskProvider;

function _load_ATConfigurePathTaskProvider() {
  return _ATConfigurePathTaskProvider = require('./ATConfigurePathTaskProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerDevicePanelProviders(api, android, tizen) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // list
  api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(android)), api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(tizen)),
  // info
  api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(android)), api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(tizen)),
  // processes
  api.registerProcessesProvider(new (_ATDeviceProcessesProvider || _load_ATDeviceProcessesProvider()).ATDeviceProcessesProvider(android)),
  // process tasks
  api.registerProcessTaskProvider(new (_ATDeviceStopPackageProvider || _load_ATDeviceStopPackageProvider()).ATDeviceStopPackageProvider(android)),
  // device type tasks
  api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(android)), api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(tizen)));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */