'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugBridge = exports.DEFAULT_ADB_PORT = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../nuclide-commons/process');
}

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

const DEFAULT_ADB_PORT = exports.DEFAULT_ADB_PORT = 5037;
const ADB_TIMEOUT = 5000; // 5s

class DebugBridge {

  constructor(device) {
    this._device = device;
  }

  getDeviceArchitecture() {
    throw new Error('Base class DebugBridge.getDeviceArchitecture called (abstract method)');
  }

  getAPIVersion() {
    throw new Error('Base class DebugBridge.getAPIVersion called (abstract method)');
  }

  getDeviceModel() {
    throw new Error('Base class DebugBridge.getDeviceModel called (abstract method)');
  }

  runShortCommand(...command) {
    return this.constructor.configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, this.getDeviceArgs().concat(command)));
  }

  runLongCommand(...command) {
    // TODO(T17463635)
    return this.constructor.configObs.switchMap(config => (0, (_process || _load_process()).observeProcess)(config.path, this.getDeviceArgs().concat(command), {
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error }))); // TODO(T17463635)
  }

  getDeviceArgs() {
    throw new Error('Needs to be implemented by subclass!');
  }

  static _parseDevicesCommandOutput(stdout, port) {
    return stdout.split(/\n+/g).slice(1).filter(s => s.length > 0 && !s.trim().startsWith('*')).map(s => s.split(/\s+/g)).filter(a => a[0] !== '').map(a => ({
      name: a[0],
      port
    }));
  }

  static getDevices(options) {
    const { port: optionPort } = options || {};
    return this.configObs.switchMap(config => {
      const ports = optionPort != null ? [optionPort] : config.ports;
      const commandObs = ports.length > 0 ? _rxjsBundlesRxMinJs.Observable.concat(...ports.map(port => (0, (_process || _load_process()).runCommand)(config.path, ['-P', String(port), 'devices']).map(stdout => this._parseDevicesCommandOutput(stdout, port)))) : _rxjsBundlesRxMinJs.Observable.concat((0, (_process || _load_process()).runCommand)(config.path, ['devices']).map(stdout => this._parseDevicesCommandOutput(stdout, -1)));
      return commandObs.toArray().switchMap(deviceList => _rxjsBundlesRxMinJs.Observable.of(deviceList.reduce((a, b) => a != null ? a.concat(...b) : b))).timeout(ADB_TIMEOUT);
    });
  }

  static killServer() {
    return this.configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, ['kill-server'])).mapTo(undefined).toPromise();
  }

  static getVersion() {
    return this.configObs.switchMap(config => (0, (_process || _load_process()).runCommand)(config.path, ['version'])).map(versionString => {
      const version = versionString.match(/version (\d+.\d+.\d+)/);
      if (version) {
        return version[1];
      }
      throw new Error(`No version found with "${versionString}"`);
    }).toPromise();
  }
}
exports.DebugBridge = DebugBridge;