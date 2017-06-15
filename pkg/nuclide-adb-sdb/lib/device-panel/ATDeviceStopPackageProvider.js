'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceStopPackageProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

class ATDeviceStopPackageProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  getType() {
    return this._type;
  }

  getTaskType() {
    return 'KILL';
  }

  getName() {
    return 'Stop package';
  }

  isSupported(proc) {
    return true;
  }

  getSupportedPIDs(host, device, procs) {
    return _rxjsBundlesRxMinJs.Observable.of(new Set(procs.map(proc => proc.pid)));
  }

  run(host, device, proc) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._rpcFactory(host).stopPackage(device, proc.name);
    })();
  }
}
exports.ATDeviceStopPackageProvider = ATDeviceStopPackageProvider;