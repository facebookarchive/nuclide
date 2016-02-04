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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _events = require('events');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _atom = require('../../atom');

var log = _utils2['default'].log;
var logInfo = _utils2['default'].logInfo;
var logError = _utils2['default'].logError;

var _require = require('./ChromeMessageRemoting');

var translateMessageFromServer = _require.translateMessageFromServer;
var translateMessageToServer = _require.translateMessageToServer;

var remoteUri = require('../../../remote-uri');

var _require2 = require('atom');

var Disposable = _require2.Disposable;

var WebSocketServer = require('ws').Server;

var stringifyError = require('../../../commons').error.stringifyError;

var SESSION_END_EVENT = 'session-end-event';

var LldbDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(LldbDebuggerInstance, _DebuggerInstance);

  function LldbDebuggerInstance(processInfo, targetInfo) {
    _classCallCheck(this, LldbDebuggerInstance);

    _get(Object.getPrototypeOf(LldbDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._targetInfo = targetInfo;
    this._rpcService = null;
    this._debuggerConnection = null;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;

    var _require3 = require('atom');

    var CompositeDisposable = _require3.CompositeDisposable;

    this._disposables = new CompositeDisposable();
    this._emitter = new _events.EventEmitter();
  }

  _createClass(LldbDebuggerInstance, [{
    key: 'attach',
    value: function attach() {
      var rpcService = this._getRpcService();
      this._attachPromise = rpcService.attach(this._targetInfo.pid);
    }
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      if (!this._rpcService) {
        var _require$getServiceByNuclideUri = require('../../../client').getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());

        var DebuggerRpcService = _require$getServiceByNuclideUri.DebuggerRpcService;

        var rpcService = new DebuggerRpcService();
        this._rpcService = rpcService;
        this._disposables.add(rpcService);
      }
      (0, _assert2['default'])(this._rpcService);
      return this._rpcService;
    }
  }, {
    key: 'getWebsocketAddress',
    value: _asyncToGenerator(function* () {
      // Start websocket server with Chrome after attach completed.
      (0, _assert2['default'])(this._attachPromise);
      var connection = yield this._attachPromise;
      this._registerConnection(connection);
      return Promise.resolve(this._startChromeWebSocketServer());
    })
  }, {
    key: '_registerConnection',
    value: function _registerConnection(connection) {
      this._debuggerConnection = connection;
      this._disposables.add(connection);
      this._disposables.add(connection.getServerMessageObservable().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleSessionEnd.bind(this)));
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
    key: '_startChromeWebSocketServer',
    value: function _startChromeWebSocketServer() {
      var _this = this;

      // setup web socket
      // TODO: Assign random port rather than using fixed port.
      var wsPort = 2000;
      var server = new WebSocketServer({ port: wsPort });
      this._chromeWebSocketServer = server;
      server.on('error', function (error) {
        logError('Server error: ' + error);
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
      log('Listening for connection at: ' + result);
      return result;
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
})(_atom.DebuggerInstance);

exports.LldbDebuggerInstance = LldbDebuggerInstance;
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDaEI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDeEMsVUFBSSxTQUFTLEVBQUU7QUFDYixlQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUNwQyxpQkFBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7T0FDOUI7QUFDRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7QUFDM0MsVUFBSSxNQUFNLEVBQUU7QUFDVixlQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNqQyxjQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0tBQ0Y7OztTQWhLVSxvQkFBb0IiLCJmaWxlIjoiTGxkYkRlYnVnZ2VySW5zdGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERlYnVnZ2VyUnBjU2VydmljZSBhcyBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlLFxuICBEZWJ1Z2dlckNvbm5lY3Rpb24gYXMgRGVidWdnZXJDb25uZWN0aW9uVHlwZSxcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbn0gZnJvbSAnLi4vLi4vbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5pbXBvcnQgdHlwZSB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9hdG9tJztcbmNvbnN0IHtsb2csIGxvZ0luZm8sIGxvZ0Vycm9yfSA9IHV0aWxzO1xuY29uc3Qge3RyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyLCB0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXJ9ID0gcmVxdWlyZSgnLi9DaHJvbWVNZXNzYWdlUmVtb3RpbmcnKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3Qge3N0cmluZ2lmeUVycm9yfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKS5lcnJvcjtcblxuY29uc3QgU0VTU0lPTl9FTkRfRVZFTlQgPSAnc2Vzc2lvbi1lbmQtZXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgTGxkYkRlYnVnZ2VySW5zdGFuY2UgZXh0ZW5kcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX3RhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm87XG4gIF9ycGNTZXJ2aWNlOiA/RGVidWdnZXJScGNTZXJ2aWNlVHlwZTtcbiAgX2RlYnVnZ2VyQ29ubmVjdGlvbjogP0RlYnVnZ2VyQ29ubmVjdGlvblR5cGU7XG4gIF9hdHRhY2hQcm9taXNlOiA/UHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb25UeXBlPjtcbiAgX2Nocm9tZVdlYlNvY2tldFNlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX2Nocm9tZVdlYlNvY2tldDogP1dlYlNvY2tldDtcbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8sIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcihwcm9jZXNzSW5mbyk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gICAgdGhpcy5fcnBjU2VydmljZSA9IG51bGw7XG4gICAgdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9hdHRhY2hQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cbiAgYXR0YWNoKCk6IHZvaWQge1xuICAgIGNvbnN0IHJwY1NlcnZpY2UgPSB0aGlzLl9nZXRScGNTZXJ2aWNlKCk7XG4gICAgdGhpcy5fYXR0YWNoUHJvbWlzZSA9IHJwY1NlcnZpY2UuYXR0YWNoKHRoaXMuX3RhcmdldEluZm8ucGlkKTtcbiAgfVxuXG4gIF9nZXRScGNTZXJ2aWNlKCk6IERlYnVnZ2VyUnBjU2VydmljZVR5cGUge1xuICAgIGlmICghdGhpcy5fcnBjU2VydmljZSkge1xuICAgICAgY29uc3Qge0RlYnVnZ2VyUnBjU2VydmljZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQnKS5cbiAgICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgICAgY29uc3QgcnBjU2VydmljZSA9IG5ldyBEZWJ1Z2dlclJwY1NlcnZpY2UoKTtcbiAgICAgIHRoaXMuX3JwY1NlcnZpY2UgPSBycGNTZXJ2aWNlO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHJwY1NlcnZpY2UpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fcnBjU2VydmljZSk7XG4gICAgcmV0dXJuIHRoaXMuX3JwY1NlcnZpY2U7XG4gIH1cblxuICBhc3luYyBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gU3RhcnQgd2Vic29ja2V0IHNlcnZlciB3aXRoIENocm9tZSBhZnRlciBhdHRhY2ggY29tcGxldGVkLlxuICAgIGludmFyaWFudCh0aGlzLl9hdHRhY2hQcm9taXNlKTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5fYXR0YWNoUHJvbWlzZTtcbiAgICB0aGlzLl9yZWdpc3RlckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9zdGFydENocm9tZVdlYlNvY2tldFNlcnZlcigpKTtcbiAgfVxuXG4gIF9yZWdpc3RlckNvbm5lY3Rpb24oY29ubmVjdGlvbjogRGVidWdnZXJDb25uZWN0aW9uVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX2RlYnVnZ2VyQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGNvbm5lY3Rpb24pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChjb25uZWN0aW9uLmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRXJyb3IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZVNlc3Npb25FbmQuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlck1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nKCdSZWNpZXZlZCBzZXJ2ZXIgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX2Nocm9tZVdlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBtZXNzYWdlID0gdGhpcy5fdHJhbnNsYXRlTWVzc2FnZUlmTmVlZGVkKG1lc3NhZ2UpO1xuICAgICAgd2ViU29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKCdXaHkgaXNuXFwndCBjaHJvbWUgd2Vic29ja2V0IGF2YWlsYWJsZT8nKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdSZWNlaXZlZCBzZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ0VuZGluZyBTZXNzaW9uJyk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFNFU1NJT05fRU5EX0VWRU5UKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9zdGFydENocm9tZVdlYlNvY2tldFNlcnZlcigpOiBzdHJpbmcge1xuICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAvLyBUT0RPOiBBc3NpZ24gcmFuZG9tIHBvcnQgcmF0aGVyIHRoYW4gdXNpbmcgZml4ZWQgcG9ydC5cbiAgICBjb25zdCB3c1BvcnQgPSAyMDAwO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldFNlcnZlciA9IHNlcnZlcjtcbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgbG9nKCdTZXJ2ZXIgaGVhZGVyczogJyArIGhlYWRlcnMpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICBpZiAodGhpcy5fY2hyb21lV2ViU29ja2V0KSB7XG4gICAgICAgIGxvZygnQWxyZWFkeSBjb25uZWN0ZWQgdG8gQ2hyb21lIFdlYlNvY2tldC4gRGlzY2FyZGluZyBuZXcgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2coJ0Nvbm5lY3RpbmcgdG8gQ2hyb21lIFdlYlNvY2tldCBjbGllbnQuJyk7XG4gICAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICB3ZWJTb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9vbkNocm9tZVNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25DaHJvbWVTb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vbkNocm9tZVNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gJ3dzPWxvY2FsaG9zdDonICsgU3RyaW5nKHdzUG9ydCkgKyAnLyc7XG4gICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKFNFU1NJT05fRU5EX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKFNFU1NJT05fRU5EX0VWRU5ULCBjYWxsYmFjaykpKTtcbiAgfVxuXG4gIF90cmFuc2xhdGVNZXNzYWdlSWZOZWVkZWQobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBkbyB3ZSByZWFsbHkgbmVlZCBpc1JlbW90ZSgpIGNoZWNraW5nP1xuICAgIGlmIChyZW1vdGVVcmkuaXNSZW1vdGUodGhpcy5nZXRUYXJnZXRVcmkoKSkpIHtcbiAgICAgIG1lc3NhZ2UgPSB0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlcihcbiAgICAgICAgcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgbWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgX29uQ2hyb21lU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIENocm9tZSBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IHRoaXMuX2RlYnVnZ2VyQ29ubmVjdGlvbjtcbiAgICBpZiAoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5zZW5kQ29tbWFuZCh0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXIobWVzc2FnZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcignV2h5IGlzblxcJ3QgZGVidWdlciBSUEMgc2VydmljZSBhdmFpbGFibGU/Jyk7XG4gICAgfVxuICB9XG5cbiAgX29uQ2hyb21lU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ0Nocm9tZSB3ZWJTb2NrZXQgZXJyb3IgJyArIHN0cmluZ2lmeUVycm9yKGVycm9yKSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25DaHJvbWVTb2NrZXRDbG9zZShjb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsb2coJ0Nocm9tZSB3ZWJTb2NrZXQgQ2xvc2VkICcgKyBjb2RlKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX2Nocm9tZVdlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIENocm9tZSB3ZWJTb2NrZXQnKTtcbiAgICAgIHdlYlNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2hyb21lV2ViU29ja2V0ID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gdGhpcy5fY2hyb21lV2ViU29ja2V0U2VydmVyO1xuICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3NpbmcgQ2hyb21lIHNlcnZlcicpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19