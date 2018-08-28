"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDevicePanelProviders = registerDevicePanelProviders;

function _nuclideAdb() {
  const data = require("../../../modules/nuclide-adb");

  _nuclideAdb = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _AndroidDeviceInfoProvider() {
  const data = require("./providers/AndroidDeviceInfoProvider");

  _AndroidDeviceInfoProvider = function () {
    return data;
  };

  return data;
}

function _AndroidDeviceProcessesProvider() {
  const data = require("./providers/AndroidDeviceProcessesProvider");

  _AndroidDeviceProcessesProvider = function () {
    return data;
  };

  return data;
}

function _AndroidDeviceStopProcessProvider() {
  const data = require("./providers/AndroidDeviceStopProcessProvider");

  _AndroidDeviceStopProcessProvider = function () {
    return data;
  };

  return data;
}

function _AvdComponentProvider() {
  const data = require("./providers/AvdComponentProvider");

  _AvdComponentProvider = function () {
    return data;
  };

  return data;
}

function _AdbTunnelingProvider() {
  const data = require("./providers/AdbTunnelingProvider");

  _AdbTunnelingProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function registerDevicePanelProviders(api) {
  return new (_UniversalDisposable().default)(api.registerListProvider({
    getType: () => 'Android',
    observe: host => (0, _nuclideAdb().observeAndroidDevices)(host).map(expected => expected.map(devices => devices.map(d => ({
      identifier: d.serial,
      displayName: d.displayName
    }))))
  }), api.registerInfoProvider(new (_AndroidDeviceInfoProvider().AndroidDeviceInfoProvider)()), api.registerProcessesProvider(new (_AndroidDeviceProcessesProvider().AndroidDeviceProcessesProvider)()), api.registerProcessTaskProvider(new (_AndroidDeviceStopProcessProvider().AndroidDeviceStopProcessProvider)()), api.registerDeviceTypeComponentProvider(new (_AvdComponentProvider().AvdComponentProvider)()), api.registerDeviceTypeComponentProvider(new (_AdbTunnelingProvider().AdbTunnelingProvider)()));
}