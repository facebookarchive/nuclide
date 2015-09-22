'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {
  log,
  parseDbgpMessages,
  uriToPath,
} = require('./utils');

var {Emitter} = require('event-kit');

import type {Socket, Server} from 'net';

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
export type ConnectionConfig = {
  xdebugPort: number;
  pid?: number;
  scriptRegex?: string;
  idekeyRegex?: string;
};

var ATTACH_EVENT = 'dbgp-attach-event';
var CLOSE_EVENT = 'dbgp-close-event';

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

  constructor(config: ConnectionConfig) {
    this._config = config;
    this._server = null;
    this._emitter = new Emitter();
  }

  onAttach(callback: (socket: Socket) => void): Disposable {
    return this._emitter.on(ATTACH_EVENT, callback);
  }

  onClose(callback: () => void): Disposable {
    return this._emitter.on(CLOSE_EVENT, callback);
  }

  listen(): void {
    var port = this._config.xdebugPort;

    log('Creating debug server on port ' + port);

    var server = require('net').createServer();

    server.on('close', socket => log('Closing port ' + port));
    server.listen(port, () => log('Listening on port ' + port));

    server.on('error', error => this._onServerError(error));
    server.on('connection', socket => this._onSocketConnection(socket));
    server.on('close', () => { log('DBGP Server closed.'); });

    this._server = server;
  }

  _onSocketConnection(socket: Socket) {
    var port = this._config.xdebugPort;

    log('Connection on port ' + port);
    if (!this._checkListening(socket, 'Connection')) {
      return;
    }
    socket.once('data', data => this._onSocketData(socket, data));
  }

  _onServerError(error: Object): void {
    var port = this._config.xdebugPort;

    if (error.code === 'EADDRINUSE') {
      log('Port in use ' + port);
    } else {
      log('Unknown socket error ' + error.code);
    }

    this.dispose();
  }

  _onSocketData(socket: Socket, data: Buffer | string): void {
    if (!this._checkListening(socket, 'Data')) {
      return;
    }

    function failConnection(errorMessage: string): void {
      log(errorMessage);
      socket.end();
      socket.destroy();
    }

    var messages;
    try {
      messages = parseDbgpMessages(data.toString());
    } catch (error) {
      failConnection('Non XML connection string: ' + data.toString() + '. Discarding connection.');
      return;
    }

    if (messages.length !== 1) {
      failConnection('Expected a single connection message. Got ' + messages.length);
      return;
    }

    var message = messages[0];
    if (this._isCorrectConnection(message)) {
      this._emitter.emit(ATTACH_EVENT, socket);
    } else {
      failConnection('Discarding connection ' + JSON.stringify(message));
    }
  }

  /**
   * Checks if listening for connections. If not then close the new socket.
   */
  _checkListening(socket: Socket, message: string): boolean {
    if (!this.isListening()) {
      var port = this._config.xdebugPort;
      log('Ignoring ' + message + ' on port ' + port + ' after stopped connection.');
      return false;
    }
    return true;
  }

  _isCorrectConnection(message: Object): boolean {
    var {pid, idekeyRegex, scriptRegex} = this._config;

    if (!message || !message.init || !message.init.$) {
      log('Incorrect init');
      return false;
    }

    var init = message.init;
    if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._ !== 'xdebug') {
      log('Incorrect engine');
      return false;
    }

    var attributes = init.$;
    if (attributes.xmlns !== 'urn:debugger_protocol_v1'
      || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug'
      || attributes.language !== 'PHP') {
        log('Incorrect attributes');
        return false;
    }

    return (!pid || attributes.appid === String(pid)) &&
      (!idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) &&
      (!scriptRegex || new RegExp(scriptRegex).test(uriToPath(attributes.fileuri)));
  }

  isListening(): boolean {
    return !!this._server;
  }

  dispose() {
    if (this._server) {
      this._server.close();
      this._emitter.emit(CLOSE_EVENT);
      this._server = null;
    }
  }
}
