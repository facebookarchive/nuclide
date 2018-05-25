'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePoller = undefined;

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../nuclide-commons-atom/createPackage'));
}

var _DevicePoller;

function _load_DevicePoller() {
  return _DevicePoller = require('./DevicePoller');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
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

exports.DevicePoller = (_DevicePoller || _load_DevicePoller()).DevicePoller;


class Activation {
  constructor() {}
  dispose() {}

  consumeRpcService(rpcService) {
    return (0, (_utils || _load_utils()).setRpcService)(rpcService);
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);