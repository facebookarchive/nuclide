'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugBridge = undefined;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

class DebugBridge {

  constructor(configObs) {
    this._configObs = configObs;
  }

  _getDeviceArg(device) {
    return device !== '' ? ['-s', device] : [];
  }

  runShortCommand(device, command) {
    return this._configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, this._getDeviceArg(device).concat(command)));
  }

  runLongCommand(device, command) {
    // TODO(T17463635)
    return this._configObs.switchMap(config => (0, (_process || _load_process()).observeProcess)(config.path, this._getDeviceArg(device).concat(command), {
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error }))); // TODO(T17463635)
  }

  getDevices() {
    return this._configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, ['devices']).map(stdout => stdout.split(/\n+/g).slice(1).filter(s => s.length > 0 && !s.trim().startsWith('*')).map(s => s.split(/\s+/g)).filter(a => a[0] !== '').map(a => a[0])));
  }
}
exports.DebugBridge = DebugBridge;