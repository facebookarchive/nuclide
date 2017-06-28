'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbgpConnector = undefined;

var _net = _interopRequireDefault(require('net'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _DbgpMessageHandler;

function _load_DbgpMessageHandler() {
  return _DbgpMessageHandler = require('./DbgpMessageHandler');
}

var _ConnectionUtils;

function _load_ConnectionUtils() {
  return _ConnectionUtils = require('./ConnectionUtils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * xdebugAttachPort is the port to listen for dbgp connections on.
 *
 * If present scriptRegex must be a valid RegExp. Only dbgp connections whose script
 * path matches scriptRegex will be accepted. Dbgp connections which do not match
 * the scriptRegex will be ignored.
 *
 * Similarly, the idekeyRegex filters incoming dbgp connections by idekey,
 * and pid filters connections by process id (appid in the dbgp terminology).
 * Note that 0 pid also does not filter on process id.
 */

const DBGP_ATTACH_EVENT = 'dbgp-attach-event'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */

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
class DbgpConnector {

  constructor(port) {
    this._server = null;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._messageHandler = new (_DbgpMessageHandler || _load_DbgpMessageHandler()).DbgpMessageHandler();
    this._port = port;
  }

  onAttach(callback) {
    return this._emitter.on(DBGP_ATTACH_EVENT, callback);
  }

  onClose(callback) {
    return this._emitter.on(DBGP_CLOSE_EVENT, callback);
  }

  onError(callback) {
    return this._emitter.on(DBGP_ERROR_EVENT, callback);
  }

  listen() {
    (_utils || _load_utils()).default.debug('Creating debug server on port ' + this._port);

    const server = _net.default.createServer();

    server.on('close', socket => (_utils || _load_utils()).default.debug('Closing port ' + this._port));
    server.listen(this._port, undefined, // Hostname.
    undefined, // Backlog -- the maximum length of the queue of pending connections.
    () => (_utils || _load_utils()).default.debug('Listening on port ' + this._port));

    server.on('error', error => this._onServerError(error));
    server.on('connection', socket => this._onSocketConnection(socket));
    server.on('close', () => {
      (_utils || _load_utils()).default.debug('DBGP Server closed.');
    });

    this._server = server;
  }

  _onSocketConnection(socket) {
    // Xdebug encodes XML messages as iso-8859-1, which is the same as 'latin1'.
    socket.setEncoding('latin1');
    (_utils || _load_utils()).default.debug('Connection on port ' + this._port);
    if (!this._checkListening(socket, 'Connection')) {
      return;
    }
    socket.once('data', data => this._onSocketData(socket, data));
  }

  _onServerError(error) {
    let errorMessage;
    if (error.code === 'EADDRINUSE') {
      errorMessage = `Can't start debugging because port ${this._port} is being used by another process. ` + "Try running 'killall node' on your devserver and then restarting Nuclide.";
    } else {
      errorMessage = `Unknown debugger socket error: ${error.code}.`;
    }

    (_utils || _load_utils()).default.error(errorMessage);
    this._emitter.emit(DBGP_ERROR_EVENT, errorMessage);

    this.dispose();
  }

  _onSocketData(socket, data) {
    if (!this._checkListening(socket, 'Data')) {
      return;
    }

    let messages;
    try {
      messages = this._messageHandler.parseMessages(data.toString());
    } catch (error) {
      this._failConnection(socket, 'Non XML connection string: ' + data.toString() + '. Discarding connection.', 'PHP sent a malformed request, please file a bug to the Nuclide developers.<br />' + 'Restarting the Nuclide Server may fix the issue.<br />' + 'Error: Non XML connection string.');
      return;
    }

    if (messages.length !== 1) {
      this._failConnection(socket, 'Expected a single connection message. Got ' + messages.length, 'PHP sent a malformed request, please file a bug to the Nuclide developers.<br />' + 'Error: Expected a single connection message.');
      return;
    }

    const message = messages[0];
    this._emitter.emit(DBGP_ATTACH_EVENT, { socket, message });
  }

  _failConnection(socket, logMessage, userMessage) {
    (0, (_ConnectionUtils || _load_ConnectionUtils()).failConnection)(socket, logMessage);
    this._emitter.emit(DBGP_ERROR_EVENT, userMessage);
  }

  /**
   * Checks if listening for connections. If not then close the new socket.
   */
  _checkListening(socket, message) {
    if (!this.isListening()) {
      (_utils || _load_utils()).default.debug('Ignoring ' + message + ' on port ' + this._port + ' after stopped connection.');
      return false;
    }
    return true;
  }

  isListening() {
    return Boolean(this._server);
  }

  dispose() {
    if (this._server) {
      this._server.close();
      this._emitter.emit(DBGP_CLOSE_EVENT);
      this._server = null;
    }
  }
}
exports.DbgpConnector = DbgpConnector;