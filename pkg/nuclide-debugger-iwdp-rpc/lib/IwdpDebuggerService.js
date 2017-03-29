'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IwdpDebuggerService = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _connectToPackager;

function _load_connectToPackager() {
  return _connectToPackager = require('./connectToPackager');
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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _main;

function _load_main() {
  return _main = require('../../nuclide-debugger-common/lib/main');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const { log, logError } = (_logger || _load_logger()).logger;
let lastServiceObjectDispose = null;

class IwdpDebuggerService {

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

  getAtomNotificationObservable() {
    return this._clientCallback.getAtomNotificationObservable().publish();
  }

  attach(targetEnvironment) {
    const connection = connectToTarget(targetEnvironment);
    this._disposables.add(connection.subscribe(deviceInfo => {
      log(`Got device info: ${JSON.stringify(deviceInfo)}`);
      this._connectionMultiplexer.add(deviceInfo);
    }, err => {
      logError(`The debug proxy was killed!  Error: ${err}`);
      this._clientCallback.sendAtomNotification('warning', 'The session has ended because the debug proxy was killed!');
      // We need to wait for the event loop to run before disposing, otherwise our atom
      // notification never makes it through the service framework.
      process.nextTick(() => this.dispose());
    }));
    return Promise.resolve('IWDP Connected');
  }

  sendCommand(message) {
    this._connectionMultiplexer.sendCommand(JSON.parse(message));
    return Promise.resolve();
  }

  dispose() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
    return Promise.resolve();
  }
}

exports.IwdpDebuggerService = IwdpDebuggerService;
function connectToTarget(targetEnvironment) {
  if (targetEnvironment === 'iOS') {
    return (0, (_connectToIwdp || _load_connectToIwdp()).connectToIwdp)();
  } else if (targetEnvironment === 'Android') {
    return (0, (_connectToPackager || _load_connectToPackager()).connectToPackager)();
  }
  throw new Error(`Unrecognized environment: ${targetEnvironment}`);
}