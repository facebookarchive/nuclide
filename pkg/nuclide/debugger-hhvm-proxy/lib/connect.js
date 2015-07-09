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
  parseDbgpMessage,
  uriToPath,
} = require('./utils');

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
type ConnectionConfig = {
  xdebugPort: number;
  pid?: number;
  scriptRegex?: string;
  idekeyRegex?: string;
};

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
 *
 * TODO: Add timeout or cancel callback.
 */
class DbgpConnector {
  _config: ConnectionConfig;
  _server: ?Server;
  _connected: boolean;

  constructor(config: ConnectionConfig) {
    this._config = config;
    this._server = null;
    this._connected = false;
  }

  attach(): Promise<Socket> {
    var port = this._config.xdebugPort;

    log('Creating debug server on port ' + port);

    var server = require('net').createServer();
    this._server = server;
    server.on('close', socket => log('Closing port ' + port));
    server.listen(port, () => log('Listening on port ' + port));

    return new Promise((resolve, reject) => {
      server.on('error', error => this._onServerError(error, reject));
      server.on('connection', socket => this._onSocketConnection(socket, resolve));
      server.on('close', () => {reject('Connection aborted.')});
    });
  }

  _onSocketConnection(socket: Socket, accept: (socket: Socket) => void) {
    var port = this._config.xdebugPort;

    log('Connection on port ' + port);
    if (this._checkForExistingConnection(socket, 'Connection')) {
      return;
    }
    socket.once('data', data => this._onSocketData(socket, data, accept));
  }

  _onServerError(error: Object, reject: (reason: Object) => void): void {
    var port = this._config.xdebugPort;

    if (error.code === 'EADDRINUSE') {
      log('Port in use ' + port);
    } else {
      log('Unknown socket error ' + error.code);
    }
    this._server.close();
    reject(error);
  }

  _onSocketData(socket: Socket, data: Buffer | string, accept: (socket: Socket) => void): void {
    if (this._checkForExistingConnection(socket, 'Data')) {
      return;
    }

    var message;
    try {
      message = parseDbgpMessage(data.toString());
    } catch (error) {
      log('Non XML connection string: ' + data.toString() + '. Discarding connection.');
      socket.end();
      socket.destroy();
      return;
    }

    if (this._isCorrectConnection(message)) {
      this._connected = true;
      accept(socket);

      this._server.close();
      this._server = null;
    } else {
      log('Discarding connection ' + JSON.stringify(message));
      socket.end();
      socket.destroy();
    }
  }

  /**
   * Checks if a connection already exists. If it does, then close the new socket.
   */
  _checkForExistingConnection(socket: Socket, message: string): void {
    var port = this._config.xdebugPort;

    if (this._connected) {
      log('Ignoring ' + message + ' on port ' + port + ' after successful connection.');
      socket.end();
      socket.destroy();
    }
    return this._connected;
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

  dispose() {
    if (this._server) {
      this._server.close();
    }
  }
}

module.exports = {DbgpConnector};
