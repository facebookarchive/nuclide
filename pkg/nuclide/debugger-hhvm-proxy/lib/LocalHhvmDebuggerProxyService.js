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

// Connection states
const INITIAL = 'initial';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';

const HhvmDebuggerProxyService = require('./HhvmDebuggerProxyService');

const NOTIFY_EVENT = 'notify';
const SESSION_END_EVENT = 'session-end';

var {MessageTranslator} = require('./MessageTranslator');
import type {ConnectionConfig} from './DbgpConnector';
import type {Disposable} from 'nuclide-commons';
var {EventEmitter} = require("events");

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
    this._emitter = new EventEmitter();
  }

  onNotify(callback: (message: string) => void): Disposable {
    return this._addListener(NOTIFY_EVENT, callback);
  }

  onSessionEnd(callback: () => void): Disposable {
    return this._addListener(SESSION_END_EVENT, callback);
  }

  _addListener(eventName: string, callback: Function): Disposable {
    return require('nuclide-commons').event.attachEvent(this._emitter, eventName, callback);
  }

  async attach(config: ConnectionConfig): Promise<string> {
    log('Connecting config: ' + JSON.stringify(config));

    this._setState(CONNECTING);

    this._translator = new MessageTranslator(
      config, message => { this._emitter.emit(NOTIFY_EVENT, message); });
    this._translator.onSessionEnd(() => { this._onEnd(); });

    this._setState(CONNECTED);

    return 'HHVM connected';
  }

  async launchScript(scriptPath: string): Promise<string> {
    log('launchScript: ' + scriptPath);
    var child_process = require('child_process');
    var args = ['-c', 'xdebug.ini', scriptPath];
    // TODO[jeffreytan]: make hhvm path configurable so that it will
    // work for non-FB environment.
    var proc = child_process.spawn('/usr/local/hphpi/bin/hhvm', args);

    proc.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        // string would come on one line.
        var block: string = chunk.toString();
        var output = `child_process stdout: ${block}`;
        log(output);
      });
    proc.on('error', err => {
      log('child_process error: ' + err);
    });
    proc.on('exit', code => {
      log('child_process exit: ' + code);
    });

    return 'Script launched';
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

  _setState(newState: string): void {
    log('state change from ' + this._state + ' to ' + newState);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._state === CLOSED) {
      this.dispose();
    }
  }

  dispose(): void {
    log('Proxy: Ending session');
    this._emitter.emit(SESSION_END_EVENT)
    // TODO[jeffreytan]: hack to workaround the server framework issue per Chen Shen.
    // This should be reenabled after the service framework issue(t8244333) is fixed.
    // this._emitter.removeAllListeners(SESSION_END_EVENT)

    if (this._translator) {
      this._translator.dispose();
      this._translator = null;
    }
  }
}

module.exports = LocalHhvmDebuggerProxyService;
