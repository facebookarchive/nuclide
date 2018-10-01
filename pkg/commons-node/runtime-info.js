"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRuntimeInformation = getRuntimeInformation;
Object.defineProperty(exports, "__DEV__", {
  enumerable: true,
  get: function () {
    return _env().__DEV__;
  }
});

function _systemInfo() {
  const data = require("./system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _env() {
  const data = require("../../modules/nuclide-node-transpiler/lib/env");

  _env = function () {
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
let cachedInformation = null;

function getCacheableRuntimeInformation() {
  // eslint-disable-next-line eqeqeq
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: _uuid().default.v4(),
    user: _os.default.userInfo().username,
    osType: (0, _systemInfo().getOsType)(),
    timestamp: 0,
    isClient: !(0, _systemInfo().isRunningInServer)(),
    isDevelopment: _env().__DEV__,
    atomVersion: typeof atom === 'object' ? (0, _systemInfo().getAtomVersion)() : '',
    nuclideVersion: (0, _systemInfo().getNuclideVersion)(),
    installerPackageVersion: 0,
    uptime: 0,
    // TODO (chenshen) fill following information.
    serverVersion: 0
  };
  return cachedInformation;
}

function getRuntimeInformation() {
  const runtimeInformation = Object.assign({}, getCacheableRuntimeInformation(), {
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime() * 1000)
  });
  return runtimeInformation;
}