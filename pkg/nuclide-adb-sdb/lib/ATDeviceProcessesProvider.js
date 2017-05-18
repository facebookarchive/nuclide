'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATDeviceProcessesProvider = undefined;

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

class ATDeviceProcessesProvider {

  constructor(type, rpcFactory) {
    this._type = type;
    this._rpcFactory = rpcFactory;
  }

  observe(host, device) {
    return _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this._rpcFactory(host).getProcesses(device)));
  }

  getType() {
    return this._type;
  }

  killProcess(host, device, id) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._rpcFactory(host).killProcess(device, id);
    })();
  }
}
exports.ATDeviceProcessesProvider = ATDeviceProcessesProvider;