Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var log = _utils2['default'].log;
var logInfo = _utils2['default'].logInfo;
var logError = _utils2['default'].logError;

var _require = require('./ChromeMessageRemoting');

var translateMessageFromServer = _require.translateMessageFromServer;
var translateMessageToServer = _require.translateMessageToServer;

var remoteUri = require('../../nuclide-remote-uri');

var _require2 = require('atom');

var Disposable = _require2.Disposable;

var WebSocketServer = require('ws').Server;

var stringifyError = require('../../nuclide-commons').error.stringifyError;

var SESSION_END_EVENT = 'session-end-event';

var LldbDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(LldbDebuggerInstance, _DebuggerInstance);

  function LldbDebuggerInstance(processInfo, connection, outputDisposable) {
    _classCallCheck(this, LldbDebuggerInstance);

    _get(Object.getPrototypeOf(LldbDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);

    this._debuggerConnection = null;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;
    this._disposables = new _atom.CompositeDisposable();
    if (outputDisposable != null) {
      this._disposables.add(outputDisposable);
    }
    this._emitter = new _events.EventEmitter();
    this._registerConnection(connection);
  }

  _createClass(LldbDebuggerInstance, [{
    key: '_registerConnection',
    value: function _registerConnection(connection) {
      this._debuggerConnection = connection;
      this._disposables.add(connection);
      this._disposables.add(new _nuclideCommons.DisposableSubscription(connection.getServerMessageObservable().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleSessionEnd.bind(this))));
    }
  }, {
    key: '_handleServerMessage',
    value: function _handleServerMessage(message) {
      log('Recieved server message: ' + message);
      var webSocket = this._chromeWebSocket;
      if (webSocket) {
        message = this._translateMessageIfNeeded(message);
        webSocket.send(message);
      } else {
        logError('Why isn\'t chrome websocket available?');
      }
    }
  }, {
    key: '_handleServerError',
    value: function _handleServerError(error) {
      logError('Received server error: ' + error);
    }
  }, {
    key: '_handleSessionEnd',
    value: function _handleSessionEnd() {
      log('Ending Session');
      this._emitter.emit(SESSION_END_EVENT);
      this.dispose();
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      return Promise.resolve(this._startChromeWebSocketServer());
    }
  }, {
    key: '_startChromeWebSocketServer',
    value: function _startChromeWebSocketServer() {
      var _this = this;

      // setup web socket
      var wsPort = this._getWebSocketPort();
      var server = new WebSocketServer({ port: wsPort });
      this._chromeWebSocketServer = server;
      server.on('error', function (error) {
        var errorMessage = 'Server error: ' + error;
        if (error.code === 'EADDRINUSE') {
          errorMessage = 'The debug port ' + error.port + ' is in use.\n        Please choose a different port in the debugger config settings.';
        }
        atom.notifications.addError(errorMessage);
        logError(errorMessage);
        _this.dispose();
      });
      server.on('headers', function (headers) {
        log('Server headers: ' + headers);
      });
      server.on('connection', function (webSocket) {
        if (_this._chromeWebSocket) {
          log('Already connected to Chrome WebSocket. Discarding new connection.');
          return;
        }

        log('Connecting to Chrome WebSocket client.');
        _this._chromeWebSocket = webSocket;
        webSocket.on('message', _this._onChromeSocketMessage.bind(_this));
        webSocket.on('error', _this._onChromeSocketError.bind(_this));
        webSocket.on('close', _this._onChromeSocketClose.bind(_this));
      });

      var result = 'ws=localhost:' + String(wsPort) + '/';
      logInfo('Listening for connection at: ' + result);
      return result;
    }
  }, {
    key: '_getWebSocketPort',
    value: function _getWebSocketPort() {
      // Use the port from config setting if set, otherwise
      // generate a random port.
      var configPort = Number((0, _utils.getConfig)().debugPort);
      return Number.isInteger(configPort) && configPort > 0 ? configPort : this._generateRandomInteger(2000, 65535);
    }
  }, {
    key: '_generateRandomInteger',
    value: function _generateRandomInteger(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      var _this2 = this;

      this._emitter.on(SESSION_END_EVENT, callback);
      return new Disposable(function () {
        return _this2._emitter.removeListener(SESSION_END_EVENT, callback);
      });
    }
  }, {
    key: '_translateMessageIfNeeded',
    value: function _translateMessageIfNeeded(message) {
      // TODO: do we really need isRemote() checking?
      if (remoteUri.isRemote(this.getTargetUri())) {
        message = translateMessageFromServer(remoteUri.getHostname(this.getTargetUri()), remoteUri.getPort(this.getTargetUri()), message);
      }
      return message;
    }
  }, {
    key: '_onChromeSocketMessage',
    value: function _onChromeSocketMessage(message) {
      log('Recieved Chrome message: ' + message);
      var connection = this._debuggerConnection;
      if (connection) {
        connection.sendCommand(translateMessageToServer(message));
      } else {
        logError('Why isn\'t debuger RPC service available?');
      }
    }
  }, {
    key: '_onChromeSocketError',
    value: function _onChromeSocketError(error) {
      logError('Chrome webSocket error ' + stringifyError(error));
      this.dispose();
    }
  }, {
    key: '_onChromeSocketClose',
    value: function _onChromeSocketClose(code) {
      log('Chrome webSocket Closed ' + code);
      this.dispose();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      var webSocket = this._chromeWebSocket;
      if (webSocket) {
        logInfo('closing Chrome webSocket');
        webSocket.close();
        this._chromeWebSocket = null;
      }
      var server = this._chromeWebSocketServer;
      if (server) {
        logInfo('closing Chrome server');
        server.close();
        this._chromeWebSocketServer = null;
      }
    }
  }]);

  return LldbDebuggerInstance;
})(_nuclideDebuggerAtom.DebuggerInstance);

exports.LldbDebuggerInstance = LldbDebuggerInstance;