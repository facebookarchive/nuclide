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

var _ATDeviceStopProcessProvider;

function _load_ATDeviceStopProcessProvider() {
  return _ATDeviceStopProcessProvider = require('./ATDeviceStopProcessProvider');
}

var _ATConfigurePathTaskProvider;

function _load_ATConfigurePathTaskProvider() {
  return _ATConfigurePathTaskProvider = require('./ATConfigurePathTaskProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerDevicePanelProviders(api, android, tizen) {
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(android)), api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(android)), api.registerProcessesProvider(new (_ATDeviceProcessesProvider || _load_ATDeviceProcessesProvider()).ATDeviceProcessesProvider(android)), api.registerProcessTaskProvider(new (_ATDeviceStopProcessProvider || _load_ATDeviceStopProcessProvider()).ATDeviceStopProcessProvider(android)), api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(android)));

  if (atom.config.get('nuclide.nuclide-adb-sdb.tizen')) {
    disposable.add(api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(tizen)), api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(tizen)), api.registerProcessesProvider(new (_ATDeviceProcessesProvider || _load_ATDeviceProcessesProvider()).ATDeviceProcessesProvider(tizen)), api.registerProcessTaskProvider(new (_ATDeviceStopProcessProvider || _load_ATDeviceStopProcessProvider()).ATDeviceStopProcessProvider(tizen)), api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(tizen)));
  }
  return disposable;
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