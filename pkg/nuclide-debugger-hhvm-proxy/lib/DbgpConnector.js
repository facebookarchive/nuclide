Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _net2;

function _net() {
  return _net2 = _interopRequireDefault(require('net'));
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _DbgpMessageHandler2;

function _DbgpMessageHandler() {
  return _DbgpMessageHandler2 = require('./DbgpMessageHandler');
}

var _ConnectionUtils2;

function _ConnectionUtils() {
  return _ConnectionUtils2 = require('./ConnectionUtils');
}

var DBGP_ATTACH_EVENT = 'dbgp-attach-event';
var DBGP_CLOSE_EVENT = 'dbgp-close-event';
var DBGP_ERROR_EVENT = 'dbgp-error-event';

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

var DbgpConnector = (function () {
  function DbgpConnector(port) {
    _classCallCheck(this, DbgpConnector);

    this._server = null;
    this._emitter = new (_eventKit2 || _eventKit()).Emitter();
    this._messageHandler = (0, (_DbgpMessageHandler2 || _DbgpMessageHandler()).getDbgpMessageHandlerInstance)();
    this._port = port;
  }

  _createClass(DbgpConnector, [{
    key: 'onAttach',
    value: function onAttach(callback) {
      return this._emitter.on(DBGP_ATTACH_EVENT, callback);
    }
  }, {
    key: 'onClose',
    value: function onClose(callback) {
      return this._emitter.on(DBGP_CLOSE_EVENT, callback);
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      return this._emitter.on(DBGP_ERROR_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

      (_utils2 || _utils()).default.log('Creating debug server on port ' + this._port);

      var server = (_net2 || _net()).default.createServer();

      server.on('close', function (socket) {
        return (_utils2 || _utils()).default.log('Closing port ' + _this._port);
      });
      server.listen(this._port, undefined, // Hostname.
      undefined, // Backlog -- the maximum length of the queue of pending connections.
      function () {
        return (_utils2 || _utils()).default.log('Listening on port ' + _this._port);
      });

      server.on('error', function (error) {
        return _this._onServerError(error);
      });
      server.on('connection', function (socket) {
        return _this._onSocketConnection(socket);
      });
      server.on('close', function () {
        (_utils2 || _utils()).default.log('DBGP Server closed.');
      });

      this._server = server;
    }
  }, {
    key: '_onSocketConnection',
    value: function _onSocketConnection(socket) {
      var _this2 = this;

      (_utils2 || _utils()).default.log('Connection on port ' + this._port);
      if (!this._checkListening(socket, 'Connection')) {
        return;
      }
      socket.once('data', function (data) {
        return _this2._onSocketData(socket, data);
      });
    }
  }, {
    key: '_onServerError',
    value: function _onServerError(error) {
      var errorMessage = undefined;
      if (error.code === 'EADDRINUSE') {
        errorMessage = 'Can\'t start debugging because port ' + this._port + ' is being used by another process. ' + "Try running 'killall node' on your devserver and then restarting Nuclide.";
      } else {
        errorMessage = 'Unknown debugger socket error: ' + error.code + '.';
      }

      (_utils2 || _utils()).default.logError(errorMessage);
      this._emitter.emit(DBGP_ERROR_EVENT, errorMessage);

      this.dispose();
    }
  }, {
    key: '_onSocketData',
    value: function _onSocketData(socket, data) {
      if (!this._checkListening(socket, 'Data')) {
        return;
      }

      var messages = undefined;
      try {
        messages = this._messageHandler.parseMessages(data.toString());
      } catch (error) {
        this._failConnection(socket, 'Non XML connection string: ' + data.toString() + '. Discarding connection.', 'PHP sent a malformed request, please file a bug to the Nuclide developers.<br />' + 'Error: Non XML connection string.');
        return;
      }

      if (messages.length !== 1) {
        this._failConnection(socket, 'Expected a single connection message. Got ' + messages.length, 'PHP sent a malformed request, please file a bug to the Nuclide developers.<br />' + 'Error: Expected a single connection message.');
        return;
      }

      var message = messages[0];
      this._emitter.emit(DBGP_ATTACH_EVENT, { socket: socket, message: message });
    }
  }, {
    key: '_failConnection',
    value: function _failConnection(socket, logMessage, userMessage) {
      (0, (_ConnectionUtils2 || _ConnectionUtils()).failConnection)(socket, logMessage);
      this._emitter.emit(DBGP_ERROR_EVENT, userMessage);
    }

    /**
     * Checks if listening for connections. If not then close the new socket.
     */
  }, {
    key: '_checkListening',
    value: function _checkListening(socket, message) {
      if (!this.isListening()) {
        (_utils2 || _utils()).default.log('Ignoring ' + message + ' on port ' + this._port + ' after stopped connection.');
        return false;
      }
      return true;
    }
  }, {
    key: 'isListening',
    value: function isListening() {
      return Boolean(this._server);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._server) {
        this._server.close();
        this._emitter.emit(DBGP_CLOSE_EVENT);
        this._server = null;
      }
    }
  }]);

  return DbgpConnector;
})();

exports.DbgpConnector = DbgpConnector;