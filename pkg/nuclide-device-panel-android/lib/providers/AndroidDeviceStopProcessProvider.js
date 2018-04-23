'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AndroidDeviceStopProcessProvider = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));


















var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _nuclideRemoteConnection;
function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                          * All rights reserved.
                                                                                                                                                                                                                          *
                                                                                                                                                                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                          * the root directory of this source tree.
                                                                                                                                                                                                                          *
                                                                                                                                                                                                                          * 
                                                                                                                                                                                                                          * @format
                                                                                                                                                                                                                          */class AndroidDeviceStopProcessProvider {getType() {return 'Android';}getTaskType() {return 'KILL';
  }

  getName() {
    return 'Stop process/package';
  }

  isSupported(proc) {
    return true;
  }

  getSupportedPIDs(
  host,
  device,
  procs)
  {
    return _rxjsBundlesRxMinJs.Observable.of(new Set(procs.map(proc => proc.pid)));
  }

  run(host, device, proc) {return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host).stopProcess(
      device,
      proc.name,
      proc.pid);})();

  }}exports.AndroidDeviceStopProcessProvider = AndroidDeviceStopProcessProvider;