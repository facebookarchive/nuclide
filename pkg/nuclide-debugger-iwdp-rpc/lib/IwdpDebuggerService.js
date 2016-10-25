'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IwdpDebuggerService = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _DebuggerConnection;

function _load_DebuggerConnection() {
  return _DebuggerConnection = require('./DebuggerConnection');
}

var _connectToIwdp;

function _load_connectToIwdp() {
  return _connectToIwdp = require('./connectToIwdp');
}

var _main;

function _load_main() {
  return _main = require('../../nuclide-debugger-common/lib/main');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log;

let lastServiceObjectDispose = null;

let IwdpDebuggerService = exports.IwdpDebuggerService = class IwdpDebuggerService {

  constructor() {
    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._clientCallback = new (_main || _load_main()).ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  attach() {
    return new Promise(resolve => {
      this._disposables.add((0, (_connectToIwdp || _load_connectToIwdp()).connectToIwdp)().subscribe(deviceInfos => {
        log(`Got device infos: ${ JSON.stringify(deviceInfos) }`);

        if (!(deviceInfos.length > 0)) {
          throw new Error('DeviceInfo array is empty.');
        }

        this._debuggerConnection = new (_DebuggerConnection || _load_DebuggerConnection()).DebuggerConnection(deviceInfos[0], message => this._clientCallback.sendChromeMessage(message));
        // Block resolution of this promise until we have successfully connected to the proxy.
        resolve('IWDP connected');
      }));
    });
  }

  sendCommand(message) {
    if (this._debuggerConnection != null) {
      this._debuggerConnection.sendCommand(message);
    }
    return Promise.resolve();
  }

  dispose() {
    this._disposables.dispose();
    return Promise.resolve();
  }
};