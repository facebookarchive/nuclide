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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _ChromeMessageRemoting;

function _load_ChromeMessageRemoting() {
  return _ChromeMessageRemoting = require('./ChromeMessageRemoting');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _nuclideDebuggerCommonLibWebSocketServer;

function _load_nuclideDebuggerCommonLibWebSocketServer() {
  return _nuclideDebuggerCommonLibWebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../commons-node/string');
}

var _default = (_utils || _load_utils()).default;

var log = _default.log;
var logInfo = _default.logInfo;
var logError = _default.logError;

var SESSION_END_EVENT = 'session-end-event';

var NodeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(NodeDebuggerInstance, _DebuggerInstance);

  function NodeDebuggerInstance(processInfo, rpcService) {
    _classCallCheck(this, NodeDebuggerInstance);

    _get(Object.getPrototypeOf(NodeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._rpcService = rpcService;
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._disposables.add(rpcService);
    this._chromeWebSocketServer = new (_nuclideDebuggerCommonLibWebSocketServer || _load_nuclideDebuggerCommonLibWebSocketServer()).WebSocketServer();
    this._chromeWebSocket = null;
    this._emitter = new (_atom || _load_atom()).Emitter();
    this._disposables.add(this._chromeWebSocketServer);
    this._registerServerHandlers();
  }

  _createClass(NodeDebuggerInstance, [{
    key: '_registerServerHandlers',
    value: function _registerServerHandlers() {
      this._disposables.add(this._rpcService.getServerMessageObservable().refCount().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleSessionEnd.bind(this)));
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      return Promise.resolve(this._startChromeWebSocketServer());
    }
  }, {
    key: '_startChromeWebSocketServer',
    value: function _startChromeWebSocketServer() {
      // setup web socket
      var wsPort = this._getWebSocketPort();
      this._chromeWebSocketServer.start(wsPort).catch(this._handleWebSocketServerError.bind(this)).then(this._handleWebSocketServerConnection.bind(this));
      var result = 'ws=localhost:' + String(wsPort) + '/';
      logInfo('Listening for connection at: ' + result);
      return result;
    }
  }, {
    key: '_handleWebSocketServerError',
    value: function _handleWebSocketServerError(error) {
      var errorMessage = 'Server error: ' + JSON.stringify(error);
      if (error.code === 'EADDRINUSE') {
        errorMessage = 'The debug port ' + error.port + ' is in use.\n      Please choose a different port in the debugger config settings.';
      }
      atom.notifications.addError(errorMessage);
      logError(errorMessage);
      this.dispose();
    }
  }, {
    key: '_handleWebSocketServerConnection',
    value: function _handleWebSocketServerConnection(webSocket) {
      if (this._chromeWebSocket) {
        log('Already connected to Chrome WebSocket. Discarding new connection.');
        webSocket.close();
        return;
      }
      log('Connecting to Chrome WebSocket client.');
      this._chromeWebSocket = webSocket;
      // $FlowIssue.
      webSocket.on('message', this._handleChromeSocketMessage.bind(this));
      // $FlowIssue.
      webSocket.on('error', this._handleChromeSocketError.bind(this));
      // $FlowIssue.
      webSocket.on('close', this._handleChromeSocketClose.bind(this));
    }
  }, {
    key: '_getWebSocketPort',
    value: function _getWebSocketPort() {
      // Use the port from config setting if set, otherwise
      // generate a random port.
      var configPort = Number((0, (_utils2 || _load_utils2()).getConfig)().debugPort);
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
      return this._emitter.on(SESSION_END_EVENT, callback);
    }
  }, {
    key: '_translateMessageIfNeeded',
    value: function _translateMessageIfNeeded(message_) {
      var message = message_;
      // TODO: do we really need isRemote() checking?
      if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(this.getTargetUri())) {
        message = (0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(this.getTargetUri()), message);
      }
      return message;
    }
  }, {
    key: '_handleServerMessage',
    value: function _handleServerMessage(message_) {
      var message = message_;
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
    key: '_handleChromeSocketMessage',
    value: function _handleChromeSocketMessage(message) {
      log('Recieved Chrome message: ' + message);
      this._rpcService.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(message));
    }
  }, {
    key: '_handleChromeSocketError',
    value: function _handleChromeSocketError(error) {
      logError('Chrome webSocket error ' + (0, (_commonsNodeString || _load_commonsNodeString()).stringifyError)(error));
      this.dispose();
    }
  }, {
    key: '_handleChromeSocketClose',
    value: function _handleChromeSocketClose(code) {
      log('Chrome webSocket closed: ' + code);
      this.dispose();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return NodeDebuggerInstance;
})((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance);

exports.NodeDebuggerInstance = NodeDebuggerInstance;