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
const {DebuggerHandler} = require('./DebuggerHandler');
const PageHandler = require('./PageHandler');
const ConsoleHandler = require('./ConsoleHandler');
const {RuntimeHandler} = require('./RuntimeHandler');
const {ConnectionMultiplexer} = require('./ConnectionMultiplexer');
import {ClientCallback} from './ClientCallback';

import type {ConnectionConfig} from './HhvmDebuggerProxyService';
import type Handler from './Handler';

/**
 * Translates Chrome dev tools JSON messages to/from dbgp.
 * TODO: Should we proactively push files to the debugger?
 * Currently we reactively push files to the debuger when they appear in a stack trace.
 */
export class MessageTranslator {
  _isDisposed: boolean;
  _connectionMultiplexer: ConnectionMultiplexer;
  _clientCallback: ClientCallback;
  _debuggerHandler: DebuggerHandler;
  _handlers: Map<string, Handler>;

  constructor(
    config: ConnectionConfig,
    clientCallback: ClientCallback,
  ) {
    this._isDisposed = false;
    this._connectionMultiplexer = new ConnectionMultiplexer(config, clientCallback);
    this._handlers = new Map();
    this._clientCallback = clientCallback;
    this._debuggerHandler = new DebuggerHandler(
      clientCallback,
      this._connectionMultiplexer
    );
    this._addHandler(this._debuggerHandler);
    this._addHandler(new PageHandler(clientCallback));
    this._addHandler(new ConsoleHandler(clientCallback));
    this._addHandler(new RuntimeHandler(
      clientCallback,
      this._connectionMultiplexer
    ));
  }

  _addHandler(handler: Handler): void {
    this._handlers.set(handler.getDomain(), handler);
  }

  onSessionEnd(callback: () => void): void {
    logger.log('onSessionEnd');
    this._debuggerHandler.onSessionEnd(callback);
  }

  async handleCommand(command: string): Promise {
    logger.log('handleCommand: ' + command);
    const {id, method, params} = JSON.parse(command);

    if (!method || typeof method !== 'string') {
      this._replyWithError(id, 'Missing method: ' + command);
      return;
    }
    const methodParts = method.split('.');
    if (methodParts.length !== 2) {
      this._replyWithError(id, 'Badly formatted method: ' + command);
      return;
    }
    const [domain, methodName] = methodParts;

    if (!this._handlers.has(domain)) {
      this._replyWithError(id, 'Unknown domain: ' + command);
      return;
    }

    try {
      await this._handlers.get(domain).handleMethod(id, methodName, params);
    } catch (e) {
      logger.logError(`Exception handling command ${id}: ${e} ${e.stack}`);
      this._replyWithError(id, `Error handling command: ${e}\n ${e.stack}`);
    }
  }

  _replyWithError(id: number, error: string): void {
    logger.log(error);
    this._clientCallback.replyWithError(id, error);
  }

  dispose(): void {
    if (!this._isDisposed) {
      this._isDisposed = true;
      this._connectionMultiplexer.dispose();
    }
  }
}
