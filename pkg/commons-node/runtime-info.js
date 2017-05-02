'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRuntimeInformation = getRuntimeInformation;

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('./system-info');
}

var _os = _interopRequireDefault(require('os'));

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var _env;

function _load_env() {
  return _env = require('../nuclide-node-transpiler/lib/env');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

let cachedInformation = null;

function getCacheableRuntimeInformation() {
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: (_uuid || _load_uuid()).default.v4(),
    user: _os.default.userInfo().username,
    osType: (0, (_systemInfo || _load_systemInfo()).getOsType)(),
    timestamp: 0,
    isClient: (0, (_systemInfo || _load_systemInfo()).isRunningInClient)(),
    isDevelopment: (_env || _load_env()).__DEV__,
    atomVersion: (0, (_systemInfo || _load_systemInfo()).isRunningInClient)() ? (0, (_systemInfo || _load_systemInfo()).getAtomVersion)() : '',
    nuclideVersion: (0, (_systemInfo || _load_systemInfo()).getNuclideVersion)(),
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