'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugBridge = exports.DEFAULT_ADB_PORT = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

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

const DEFAULT_ADB_PORT = exports.DEFAULT_ADB_PORT = 5037;

function getPortArg(port) {
  return port != null ? ['-P', String(port)] : [];
}

class DebugBridge {

  constructor(device) {
    this._device = device;
  }

  runShortCommand(...command) {
    return this.constructor.configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, this._getDeviceArg().concat(this._getPortArg()).concat(command)));
  }

  runLongCommand(...command) {
    // TODO(T17463635)
    return this.constructor.configObs.switchMap(config => (0, (_process || _load_process()).observeProcess)(config.path, this._getDeviceArg().concat(this._getPortArg()).concat(command), {
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error }))); // TODO(T17463635)
  }

  _getPortArg() {
    return getPortArg(this._device.port);
  }

  _getDeviceArg() {
    return this._device.name !== '' ? ['-s', this._device.name] : [];
  }

  static getDevices() {
    return this.configObs.switchMap(config => {
      return _rxjsBundlesRxMinJs.Observable.concat(...config.ports.map(port => (0, (_process || _load_process()).runCommand)(config.path, getPortArg(port).concat(['devices'])).map(stdout => stdout.split(/\n+/g).slice(1).filter(s => s.length > 0 && !s.trim().startsWith('*')).map(s => s.split(/\s+/g)).filter(a => a[0] !== '').map(a => ({
        name: a[0],
        port
      }))))).toArray().switchMap(deviceList => _rxjsBundlesRxMinJs.Observable.of(deviceList.reduce((a, b) => a != null ? a.concat(...b) : b)));
    });
  }
}
exports.DebugBridge = DebugBridge;