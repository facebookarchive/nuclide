'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import logger from './utils';
import {launchScriptToDebug} from './helpers';
import {clearConfig, setConfig} from './config';
import {setRootDirectoryUri} from './ConnectionUtils';
import {MessageTranslator} from './MessageTranslator';

import type {Observable} from 'rx';

export type HhvmDebuggerConfig = {
  xdebugPort: number;
  pid?: number;
  scriptRegex?: string;
  idekeyRegex?: string;
  endDebugWhenNoRequests?: boolean;
  logLevel: string;
  targetUri: string;
  hhvmBinaryPath: string;
};

export type NotificationMessage = {
  type: string;
  message: string;
};

// Connection states
const INITIAL = 'initial';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';


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
import {ClientCallback} from './ClientCallback';

export class HhvmDebuggerProxyService {
  _state: string;
  _launchedScriptProcess: ?Promise<void>;
  _translator: ?MessageTranslator;
  _clientCallback: ClientCallback;

  constructor() {
    this._state = INITIAL;
    this._translator = null;
    this._launchedScriptProcess = null;
    this._clientCallback = new ClientCallback();
  }

  getNotificationObservable(): Observable<NotificationMessage> {
    return this._clientCallback.getNotificationObservable();
  }

  getServerMessageObservable(): Observable<string> {
    return this._clientCallback.getServerMessageObservable();
  }

  getOutputWindowObservable(): Observable<string> {
    return this._clientCallback.getOutputWindowObservable();
  }

  async attach(config: HhvmDebuggerConfig): Promise<string> {
    logger.logInfo('Connecting config: ' + JSON.stringify(config));

    setConfig(config);
    await setRootDirectoryUri(config.targetUri);
    logger.setLogLevel(config.logLevel);
    this._setState(CONNECTING);

    this._translator = new MessageTranslator(this._clientCallback);
    this._translator.onSessionEnd(() => { this._onEnd(); });

    this._setState(CONNECTED);

    return 'HHVM connected';
  }

  async launchScript(scriptPath: string): Promise<string> {
    logger.log('launchScript: ' + scriptPath);
    this._launchedScriptProcess = launchScriptToDebug(
      scriptPath,
      text => this._clientCallback.sendUserMessage('outputWindow', {level: 'info', text}),
    );
    return 'Script launched';
  }

  async sendCommand(message: string): Promise<void> {
    logger.logInfo('Recieved command: ' + message);
    if (this._translator) {
      this._translator.handleCommand(message);
    }
  }

  _onEnd(): void {
    this._setState(CLOSED);
  }

  _setState(newState: string): void {
    logger.log('state change from ' + this._state + ' to ' + newState);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._state === CLOSED) {
      this.dispose();
    }
  }

  async dispose(): Promise<void> {
    logger.logInfo('Proxy: Ending session');
    clearConfig();
    // We may want to wait for a launched script to exit for its exit code.
    if (this._launchedScriptProcess != null && this._state === CLOSED) {
      await this._launchedScriptProcess;
    }
    this._launchedScriptProcess = null;
    this._clientCallback.dispose();
    if (this._translator) {
      this._translator.dispose();
      this._translator = null;
    }
  }
}
