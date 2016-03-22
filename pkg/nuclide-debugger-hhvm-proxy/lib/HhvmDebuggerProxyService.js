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
import {clearConfig, setConfig} from './config';
import {setRootDirectoryUri} from './ConnectionUtils';
import {MessageTranslator} from './MessageTranslator';

import type {Observable} from 'rx';

export type HhvmDebuggerSessionConfig = {
  xdebugPort: number;
  xdebugLaunchingPort?: number;
  launchScriptPath?: string;
  pid?: number;
  scriptRegex?: string;
  idekeyRegex?: string;
  endDebugWhenNoRequests?: boolean;
  logLevel: string;
  targetUri: string;
  phpRuntimePath: string;
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
 *    Call debug(config) to attach to the dbgp debuggee, or launch a script specified in the config.
 *    After the promise returned by debug() is resolved, call sendCommand() to send Chrome Commands,
 *    and be prepared to receive notifications via the server notifications observable.
 */
import {ClientCallback} from './ClientCallback';

export class HhvmDebuggerProxyService {
  _state: string;
  _translator: ?MessageTranslator;
  _clientCallback: ClientCallback;

  constructor() {
    this._state = INITIAL;
    this._translator = null;
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

  async debug(config: HhvmDebuggerSessionConfig): Promise<string> {
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
    if (this._translator) {
      await this._translator.dispose();
      this._translator = null;
    }
    // We dispose the ClientCallback last so that messages triggered by the disposal of other
    // objects won't be lost.
    this._clientCallback.dispose();
  }
}
