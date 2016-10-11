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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../commons-node/string');
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _nuclideDebuggerCommonLibWebSocketServer;

function _load_nuclideDebuggerCommonLibWebSocketServer() {
  return _nuclideDebuggerCommonLibWebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _logger2 = (_logger || _load_logger()).logger;

var log = _logger2.log;
var logError = _logger2.logError;
var logInfo = _logger2.logInfo;

var IwdpDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(IwdpDebuggerInstance, _DebuggerInstance);

  function IwdpDebuggerInstance(processInfo, rpcService) {
    _classCallCheck(this, IwdpDebuggerInstance);

    _get(Object.getPrototypeOf(IwdpDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._server = new (_nuclideDebuggerCommonLibWebSocketServer || _load_nuclideDebuggerCommonLibWebSocketServer()).WebSocketServer();
    this._webSocket = null;
    this._rpcService = rpcService;
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._server, rpcService.getServerMessageObservable().refCount().subscribe(this._sendServerMessageToChromeUi.bind(this), this._onServerError.bind(this), this._onServerEnd.bind(this)), rpcService);
  }

  _createClass(IwdpDebuggerInstance, [{
    key: 'getWebsocketAddress',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var wsPort = 2000;
      this._server.start(wsPort).then(function (webSocket) {
        return _this._handleWebSocketServerConnection(webSocket);
      }).catch(function (error) {
        return logError('Server encountered error: ' + error);
      });
      var result = 'ws=localhost:' + String(wsPort) + '/';
      log('Listening for connection at: ' + result);
      return result;
    })
  }, {
    key: '_handleWebSocketServerConnection',
    value: function _handleWebSocketServerConnection(webSocket) {
      this._webSocket = webSocket;
      webSocket.on('message', this._onSocketMessage.bind(this));
      webSocket.on('error', this._onSocketError.bind(this));
      webSocket.on('close', this._onSocketClose.bind(this));
      this._disposables.add(this._disposeWebSocket.bind(this));
    }
  }, {
    key: '_onSocketMessage',
    value: function _onSocketMessage(message) {
      log('Received webSocket message: ' + message);
      var rpcService = this._rpcService;
      if (rpcService != null) {
        rpcService.sendCommand(message);
      }
    }
  }, {
    key: '_onSocketError',
    value: function _onSocketError(error) {
      logError('webSocket error ' + (0, (_commonsNodeString || _load_commonsNodeString()).stringifyError)(error));
      this.dispose();
    }
  }, {
    key: '_onSocketClose',
    value: function _onSocketClose(code) {
      log('webSocket Closed ' + code);
    }
  }, {
    key: '_sendServerMessageToChromeUi',
    value: function _sendServerMessageToChromeUi(message) {
      // Some messages are so big they aren't helpful to log, such as the source map URL, which can
      // be many thousands of bytes.  So we substring for logs, since most messages smaller than 5000.
      log('Sending message to client: ' + message.substring(0, 5000));
      var webSocket = this._webSocket;
      if (webSocket != null) {
        webSocket.send(message);
      }
    }
  }, {
    key: '_onServerError',
    value: function _onServerError(error) {
      logError('RPC service error: ' + error);
    }
  }, {
    key: '_onServerEnd',
    value: function _onServerEnd() {
      logError('RPC service server messages completed.');
    }
  }, {
    key: '_disposeWebSocket',
    value: function _disposeWebSocket() {
      var webSocket = this._webSocket;
      if (webSocket) {
        this._webSocket = null;
        logInfo('closing webSocket');
        webSocket.close();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return IwdpDebuggerInstance;
})((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance);

exports.IwdpDebuggerInstance = IwdpDebuggerInstance;