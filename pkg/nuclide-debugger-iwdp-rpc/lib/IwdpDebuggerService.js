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

var _connectToIwdp;

function _load_connectToIwdp() {
  return _connectToIwdp = require('./connectToIwdp');
}

var _ConnectionMultiplexer;

function _load_ConnectionMultiplexer() {
  return _ConnectionMultiplexer = require('./ConnectionMultiplexer');
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
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
    this._clientCallback = new (_main || _load_main()).ClientCallback();
    this._connectionMultiplexer = new (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexer(message => this._clientCallback.sendChromeMessage(JSON.stringify(message)));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._clientCallback, this._connectionMultiplexer);
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  attach() {
    this._disposables.add((0, (_connectToIwdp || _load_connectToIwdp()).connectToIwdp)().subscribe(deviceInfo => {
      log(`Got device info: ${ JSON.stringify(deviceInfo) }`);
      this._connectionMultiplexer.add(deviceInfo);
    }));
    return Promise.resolve('IWDP Connected');
  }

  sendCommand(message) {
    this._connectionMultiplexer.sendCommand(JSON.parse(message));
    return Promise.resolve();
  }

  dispose() {
    this._disposables.dispose();
    return Promise.resolve();
  }
};