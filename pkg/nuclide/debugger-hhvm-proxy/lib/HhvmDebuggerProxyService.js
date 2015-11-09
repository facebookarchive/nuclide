'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {log, logInfo, setLogLevel} from './utils';
import {launchPhpScriptWithXDebugEnabled} from './helpers';
import {setRootDirectoryUri} from './ConnectionUtils';
import {Observable, Subject} from 'rx';

// Connection states
const INITIAL = 'initial';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';

var {MessageTranslator} = require('./MessageTranslator');
import type {ConnectionConfig} from './DbgpConnector';

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
export class HhvmDebuggerProxyService {
  _state: string;
  _translator: ?MessageTranslator;
  _serverMessageObservable: Subject;  // For server messages.
  _notificationObservable: Subject;   // For atom UI notifications.

  constructor() {
    this._state = INITIAL;
    this._translator = null;
    this._serverMessageObservable = new Subject();
    this._notificationObservable = new Subject();
  }

  getNotificationObservable(): Observable<NotificationMessage> {
    return this._notificationObservable;
  }

  getServerMessageObservable(): Observable<string> {
    return this._serverMessageObservable;
  }

  async attach(config: ConnectionConfig): Promise<string> {
    logInfo('Connecting config: ' + JSON.stringify(config));

    await setRootDirectoryUri(config.targetUri);
    setLogLevel(config.logLevel);
    this._setState(CONNECTING);

    this._translator = new MessageTranslator(
      config,
      message => { this._serverMessageObservable.onNext(message); },
      this._notificationObservable,
    );
    this._translator.onSessionEnd(() => { this._onEnd(); });

    this._setState(CONNECTED);

    return 'HHVM connected';
  }

  async launchScript(scriptPath: string): Promise<string> {
    log('launchScript: ' + scriptPath);
    launchPhpScriptWithXDebugEnabled(scriptPath);
    return 'Script launched';
  }

  async sendCommand(message: string): Promise<void> {
    logInfo('Recieved command: ' + message);
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

  async dispose(): Promise<void> {
    logInfo('Proxy: Ending session');
    if (this._notificationObservable) {
      this._notificationObservable.onCompleted();
      this._notificationObservable = null;
    }
    if (this._serverMessageObservable) {
      this._serverMessageObservable.onCompleted();
      this._serverMessageObservable = null;
    }
    if (this._translator) {
      this._translator.dispose();
      this._translator = null;
    }
  }
}
