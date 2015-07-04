'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


const {log, logError} = require('./utils');
const {getFirstConnection} = require('./connect');

// Connection states
const INITIAL = 'initial';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';
const ERROR = 'error';

const HhvmDebuggerProxyService = require('./HhvmDebuggerProxyService');

const NOTIFY_EVENT = 'notify';
const SESSION_END_EVENT = 'session-end';

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
  _state: string;
  _emitter: EventEmitter;
  _translator: ?MessageTranslator;

  constructor() {
    super();

    this._state = INITIAL;
    this._translator = null;
    var {EventEmitter} = require("events");
    this._emitter = new EventEmitter();
  }

  onNotify(callback: (message: string) => void): Disposable {
    return this._addListener(NOTIFY_EVENT, callback);
  }

  onSessionEnd(callback: () => void): Disposable {
    return this._addListener(SESSION_END_EVENT, callback);
  }

  _addListener(eventName: string, callback: Function): Disposable {
    this._emitter.addListener(eventName, callback);
    return {
      dispose: () => this._emitter.removeListener(eventName, callback),
    };
  }

  attach(config: ConnectionConfig): Promise<string> {
    log('Connecting config: ' + JSON.stringify(config));

    this._setState(CONNECTING);
    return new Promise((resolve, reject) => {
      getFirstConnection(config).then(socket => {
        try {
          socket.on('end', this._onEnd.bind(this));
          socket.on('error', this._onError.bind(this));

          var MessageTranslator = require('./MessageTranslator');
          this._translator = new MessageTranslator(socket, message => this._emitter.emit(NOTIFY_EVENT, message));
          this._translator.onSessionEnd(this._onEnd.bind(this));

          this._setState(CONNECTED);

          resolve('HHVM connected');
        } catch (e) {
          logError('Exception attaching: ' + e.message);
          logError(e.stack);
          reject(e);
        }
      },
      reason => {
        logError('Failed to attach: ' + reason.message);
        reject(reason);
      });
    });
  }

  sendCommand(message: string): void {
    log('Recieved command: ' + message);
    if (this._translator) {
      this._translator.handleCommand(message);
    }
  }

  _onEnd(): void {
    this._setState(CLOSED);
  }

  _onError(error: Error): void {
    this._setState(ERROR);
    log('connection error ' + error.code);
  }

  _setState(newState: string): void {
    log('state change from ' + this._state + ' to ' + newState);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._state === ERROR || this._state === CLOSED) {
      this.dispose();
    }
  }

  dispose(): void {
    log('Proxy: Ending session');
    this._emitter.emit(SESSION_END_EVENT)
    this._emitter.removeAllListeners(SESSION_END_EVENT)

    if (this._translator) {
      this._translator.dispose();
      this._translator = null;
    }
  }
}

module.exports = LocalHhvmDebuggerProxyService;
