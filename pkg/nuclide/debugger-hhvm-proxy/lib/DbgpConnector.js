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
import {Emitter} from 'event-kit';
import {DbgpMessageHandler, getDbgpMessageHandlerInstance} from './DbgpMessageHandler';
import {failConnection} from './ConnectionUtils';

import type {Socket, Server} from 'net';
import type {ConnectionConfig} from './HhvmDebuggerProxyService';
/**
 * xdebugPort is the port to listen for dbgp connections on.
 *
 * If present scriptRegex must be a valid RegExp. Only dbgp connections whose script
 * path matches scriptRegex will be accepted. Dbgp connections which do not match
 * the scriptRegex will be ignored.
 *
 * Similarly, the idekeyRegex filters incoming dbgp connections by idekey,
 * and pid filters connections by process id (appid in the dbgp terminology).
 * Note that 0 pid also does not filter on process id.
 */

const DBGP_ATTACH_EVENT = 'dbgp-attach-event';
const DBGP_CLOSE_EVENT = 'dbgp-close-event';
const DBGP_ERROR_EVENT = 'dbgp-error-event';

/**
 * Connect to requested dbgp debuggee on given port.
 *
 * Starts listening for socket connections on the given port.
 * Waits for dbgp init connection message for each connection.
 * If the connection matches the given pid/ideky/path then
 * resolve with the connection and stop listening for new
 * connections.
 * If the connection does not match the given pid/idekey/path
 * then close the connection and continue waiting for a match.
 */
export class DbgpConnector {
  _config: ConnectionConfig;
  _server: ?Server;
  _emitter: Emitter;
  _messageHandler: DbgpMessageHandler;

  constructor(config: ConnectionConfig) {
    this._config = config;
    this._server = null;
    this._emitter = new Emitter();
    this._messageHandler = getDbgpMessageHandlerInstance();
  }

  onAttach(callback: (params: {socket: Socket; message: Object}) => Promise): IDisposable {
    return this._emitter.on(DBGP_ATTACH_EVENT, callback);
  }

  onClose(callback: () => void): IDisposable {
    return this._emitter.on(DBGP_CLOSE_EVENT, callback);
  }

  onError(callback: (error: string) => void): IDisposable {
    return this._emitter.on(DBGP_ERROR_EVENT, callback);
  }

  listen(): void {
    const port = this._config.xdebugPort;

    logger.log('Creating debug server on port ' + port);

    const server = require('net').createServer();

    server.on('close', socket => logger.log('Closing port ' + port));
    server.listen(port, undefined, undefined, () => logger.log('Listening on port ' + port));

    server.on('error', error => this._onServerError(error));
    server.on('connection', socket => this._onSocketConnection(socket));
    server.on('close', () => { logger.log('DBGP Server closed.'); });

    this._server = server;
  }

  _onSocketConnection(socket: Socket) {
    const port = this._config.xdebugPort;

    logger.log('Connection on port ' + port);
    if (!this._checkListening(socket, 'Connection')) {
      return;
    }
    socket.once('data', data => this._onSocketData(socket, data));
  }

  _onServerError(error: Object): void {
    const port = this._config.xdebugPort;

    let errorMessage;
    if (error.code === 'EADDRINUSE') {
      errorMessage = `Can't start debugging because port ${port} is being used by another process. `
        + `Try running 'killall node' on your devserver and then restarting Nuclide.`;
    } else {
      errorMessage = `Unknown debugger socket error: ${error.code}.`;
    }

    logger.logError(errorMessage);
    this._emitter.emit(DBGP_ERROR_EVENT, errorMessage);

    this.dispose();
  }

  _onSocketData(socket: Socket, data: Buffer | string): void {
    if (!this._checkListening(socket, 'Data')) {
      return;
    }

    let messages;
    try {
      messages = this._messageHandler.parseMessages(data.toString());
    } catch (error) {
      failConnection(
        socket,
        'Non XML connection string: ' + data.toString() + '. Discarding connection.');
      return;
    }

    if (messages.length !== 1) {
      failConnection(socket, 'Expected a single connection message. Got ' + messages.length);
      return;
    }

    const message = messages[0];
    this._emitter.emit(DBGP_ATTACH_EVENT, {socket, message});
  }

  /**
   * Checks if listening for connections. If not then close the new socket.
   */
  _checkListening(socket: Socket, message: string): boolean {
    if (!this.isListening()) {
      const port = this._config.xdebugPort;
      logger.log('Ignoring ' + message + ' on port ' + port + ' after stopped connection.');
      return false;
    }
    return true;
  }

  isListening(): boolean {
    return !!this._server;
  }

  dispose() {
    if (this._server) {
      this._server.close();
      this._emitter.emit(DBGP_CLOSE_EVENT);
      this._server = null;
    }
  }
}
