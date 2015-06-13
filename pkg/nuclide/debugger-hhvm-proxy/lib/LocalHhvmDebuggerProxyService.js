'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log, parseDbgpMessage} = require('./utils');
var {getFirstConnection} = require('./connect');

// Connection states
var INITIAL = 'initial';
var CONNECTING = 'connecting';
var CONNECTED = 'connected';
var CLOSED = 'closed';
var ERROR = 'error';

var HhvmDebuggerProxyService = require('./HhvmDebuggerProxyService');

/**
 * Proxy for converting between Chrome dev tools debugger
 * and HHVM Dbgp debuggee.
 *
 * Chrome Debugging protocol spec is here:
 * https://developer.chrome.com/devtools/docs/protocol/1.1/index
 *
 * Dbgp spec is here:
 * http://xdebug.org/docs-dbgp.php
 *
 * Usage:
 *    After construction, call onNotify() with a callback to receive Chrome
 *    Notifications.
 *    Call attach() to attach to the dbgp debuggee.
 *    After the promise returned by attach() is resolved, call sendCommand()
 *    to send Chrome Commands, and be prepared to receive notifications on the
 *    callback registered with onNotify().
 */
class LocalHhvmDebuggerProxyService extends HhvmDebuggerProxyService {
  _socket: ?Socket;
  _state: string;
  _port: number;
  _callback: ?(message: string) => void;

  constructor() {
    super();

    this._socket = null;
    this._state = INITIAL;
    this._port = 0;
    this._callback = null;
  }

  onNotify(callback: (message: string) => void): void {
    this._callback = callback;
  }

  // port: must match port in hhvm's xdebug.ini config file
  attach(port: number, pid: ?number, idekey: ?string, path: ?string): Promise<string> {
    if (!this._callback) {
      throw new Error('Must call onNotify before attach.');
    }
    this._port = port;
    this._setState(CONNECTING);
    return new Promise((resolve, reject) => {
      // TODO: Add optional filtering on pid, idekey, path
      // TODO: Disable pid filtering for now to ease development.
      getFirstConnection(port, null, null, null).then(socket => {

        this._socket = socket;
        this._socket.on('data', this._onData.bind(this));
        this._socket.on('end', this._onEnd.bind(this));
        this._socket.on('error', this._onError.bind(this));
        this._setState(CONNECTED);

        resolve('TODO: HHVM attached');
      }, reject);
    });
  }

  sendCommand(message: string): Promise<string> {
    log('Received command: ' + message);
    // TODO
  }

  _onData(data: Buffer | string): void {
    var message = data.toString();
    log('Received data: ' + message);
    var content = parseDbgpMessage(message);

    if (this._state !== CONNECTED) {
      throw new Error('Unexpected state ' + this._state);
    }

    // TODO
    log(content.toString()); // Silence Lint
  }

  _onEnd(): void {
    this._setState(CLOSED);
  }

  _onError(error: Error): void {
    this._setState(ERROR);
    log('connection error ' + error.code );
  }

  _setState(newState: string): void {
    log('state change from ' + this._state + ' to ' + newState + ' on port ' + this._port);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._socket && (this._state === ERROR || this._state === CLOSED)) {
      this._dispose();
    }
  }

  dispose(): void {
    if (this._socket) {
      this._socket.end();
      this._socket.destroy();
      this._socket = null;
    }
  }
}

module.exports = LocalHhvmDebuggerProxyService;
