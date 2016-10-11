Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getRuntimeInformation = getRuntimeInformation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('./system-info');
}

var _userInfo;

function _load_userInfo() {
  return _userInfo = _interopRequireDefault(require('./userInfo'));
}

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var cachedInformation = null;

function getCacheableRuntimeInformation() {
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: (_uuid || _load_uuid()).default.v4(),
    user: (0, (_userInfo || _load_userInfo()).default)().username,
    osType: (0, (_systemInfo || _load_systemInfo()).getOsType)(),
    timestamp: 0,
    isClient: (0, (_systemInfo || _load_systemInfo()).isRunningInClient)(),
    isDevelopment: (0, (_systemInfo || _load_systemInfo()).isDevelopment)(),
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
  var runtimeInformation = _extends({}, getCacheableRuntimeInformation(), {
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime() * 1000)
  });
  return runtimeInformation;
}