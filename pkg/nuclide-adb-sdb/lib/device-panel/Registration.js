'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDevicePanelProviders = registerDevicePanelProviders;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
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

function registerDevicePanelProviders(api, store) {
  const TIZEN = 'tizen';
  const ANDROID = 'android';

  const tizenSdkFactory = host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host);
  const androidSdkFactory = host => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host);

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // list
  api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(ANDROID, androidSdkFactory)), api.registerListProvider(new (_ATDeviceListProvider || _load_ATDeviceListProvider()).ATDeviceListProvider(TIZEN, tizenSdkFactory)),
  // info
  api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(ANDROID, androidSdkFactory)), api.registerInfoProvider(new (_ATDeviceInfoProvider || _load_ATDeviceInfoProvider()).ATDeviceInfoProvider(TIZEN, tizenSdkFactory)),
  // processes
  api.registerProcessesProvider(new (_ATDeviceProcessesProvider || _load_ATDeviceProcessesProvider()).ATDeviceProcessesProvider(ANDROID, androidSdkFactory)),
  // process tasks
  api.registerProcessTaskProvider(new (_ATDeviceStopPackageProvider || _load_ATDeviceStopPackageProvider()).ATDeviceStopPackageProvider(ANDROID, androidSdkFactory)),
  // device type tasks
  api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(ANDROID, androidSdkFactory, store)), api.registerDeviceTypeTaskProvider(new (_ATConfigurePathTaskProvider || _load_ATConfigurePathTaskProvider()).ATConfigurePathTaskProvider(TIZEN, tizenSdkFactory, store)));
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