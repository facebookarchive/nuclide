'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceInfoProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

class ATDeviceInfoProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  fetch(host, device) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const infoMap = new Map();
      for (const [key, value] of yield _this._rpcFactory(host).getDeviceInfo(device)) {
        const beautifulKey = key.toLowerCase().replace('_', ' ');
        infoMap.set(beautifulKey.charAt(0).toUpperCase() + beautifulKey.slice(1), value);
      }
      return infoMap;
    })();
  }

  getTitle() {
    return 'Device information';
  }

  getType() {
    return this._type;
  }

  getPriority() {
    return 100;
  }

  isSupported() {
    return Promise.resolve(true);
  }
}
exports.ATDeviceInfoProvider = ATDeviceInfoProvider;