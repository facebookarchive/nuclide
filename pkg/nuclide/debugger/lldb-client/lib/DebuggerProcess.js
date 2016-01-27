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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _events = require('events');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

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

var DebuggerProcess = (function () {
  function DebuggerProcess(targetUri, targetInfo) {
    _classCallCheck(this, DebuggerProcess);

    this._targetUri = targetUri;
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

  _createClass(DebuggerProcess, [{
    key: 'attach',
    value: function attach() {
      var rpcService = this._getRpcService();
      this._attachPromise = rpcService.attach(this._targetInfo.pid);
    }
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      if (!this._rpcService) {
        var _require$getServiceByNuclideUri = require('../../../client').getServiceByNuclideUri('LLDBDebuggerRpcService', this._targetUri);

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
      if (remoteUri.isRemote(this._targetUri)) {
        message = translateMessageFromServer(remoteUri.getHostname(this._targetUri), remoteUri.getPort(this._targetUri), message);
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

  return DebuggerProcess;
})();

exports.DebuggerProcess = DebuggerProcess;
//# sourceMappingURL=data:application/json;base64,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QUFDNUIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hDLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDcEMsaUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQzlCO0FBQ0QsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0FBQzNDLFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDakMsY0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztPQUNwQztLQUNGOzs7U0FqS1UsZUFBZSIsImZpbGUiOiJEZWJ1Z2dlclByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7XG4gIERlYnVnZ2VyUnBjU2VydmljZSBhcyBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlLFxuICBEZWJ1Z2dlckNvbm5lY3Rpb24gYXMgRGVidWdnZXJDb25uZWN0aW9uVHlwZSxcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbn0gZnJvbSAnLi4vLi4vbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge2xvZywgbG9nSW5mbywgbG9nRXJyb3J9ID0gdXRpbHM7XG5jb25zdCB7dHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIsIHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcn0gPSByZXF1aXJlKCcuL0Nocm9tZU1lc3NhZ2VSZW1vdGluZycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCB7c3RyaW5naWZ5RXJyb3J9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpLmVycm9yO1xuXG5jb25zdCBTRVNTSU9OX0VORF9FVkVOVCA9ICdzZXNzaW9uLWVuZC1ldmVudCc7XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlclByb2Nlc3Mge1xuICBfdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xuICBfdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbztcbiAgX3JwY1NlcnZpY2U6ID9EZWJ1Z2dlclJwY1NlcnZpY2VUeXBlO1xuICBfZGVidWdnZXJDb25uZWN0aW9uOiA/RGVidWdnZXJDb25uZWN0aW9uVHlwZTtcbiAgX2F0dGFjaFByb21pc2U6ID9Qcm9taXNlPERlYnVnZ2VyQ29ubmVjdGlvblR5cGU+O1xuICBfY2hyb21lV2ViU29ja2V0U2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfY2hyb21lV2ViU29ja2V0OiA/V2ViU29ja2V0O1xuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICB0aGlzLl90YXJnZXRVcmkgPSB0YXJnZXRVcmk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gICAgdGhpcy5fcnBjU2VydmljZSA9IG51bGw7XG4gICAgdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9hdHRhY2hQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cbiAgYXR0YWNoKCk6IHZvaWQge1xuICAgIGNvbnN0IHJwY1NlcnZpY2UgPSB0aGlzLl9nZXRScGNTZXJ2aWNlKCk7XG4gICAgdGhpcy5fYXR0YWNoUHJvbWlzZSA9IHJwY1NlcnZpY2UuYXR0YWNoKHRoaXMuX3RhcmdldEluZm8ucGlkKTtcbiAgfVxuXG4gIF9nZXRScGNTZXJ2aWNlKCk6IERlYnVnZ2VyUnBjU2VydmljZVR5cGUge1xuICAgIGlmICghdGhpcy5fcnBjU2VydmljZSkge1xuICAgICAgY29uc3Qge0RlYnVnZ2VyUnBjU2VydmljZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQnKS5cbiAgICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuX3RhcmdldFVyaSk7XG4gICAgICBjb25zdCBycGNTZXJ2aWNlID0gbmV3IERlYnVnZ2VyUnBjU2VydmljZSgpO1xuICAgICAgdGhpcy5fcnBjU2VydmljZSA9IHJwY1NlcnZpY2U7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocnBjU2VydmljZSk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9ycGNTZXJ2aWNlKTtcbiAgICByZXR1cm4gdGhpcy5fcnBjU2VydmljZTtcbiAgfVxuXG4gIGFzeW5jIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBTdGFydCB3ZWJzb2NrZXQgc2VydmVyIHdpdGggQ2hyb21lIGFmdGVyIGF0dGFjaCBjb21wbGV0ZWQuXG4gICAgaW52YXJpYW50KHRoaXMuX2F0dGFjaFByb21pc2UpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLl9hdHRhY2hQcm9taXNlO1xuICAgIHRoaXMuX3JlZ2lzdGVyQ29ubmVjdGlvbihjb25uZWN0aW9uKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3N0YXJ0Q2hyb21lV2ViU29ja2V0U2VydmVyKCkpO1xuICB9XG5cbiAgX3JlZ2lzdGVyQ29ubmVjdGlvbihjb25uZWN0aW9uOiBEZWJ1Z2dlckNvbm5lY3Rpb25UeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoY29ubmVjdGlvbik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGNvbm5lY3Rpb24uZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2Vzc2lvbkVuZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHNlcnZlciBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fY2hyb21lV2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQpIHtcbiAgICAgIG1lc3NhZ2UgPSB0aGlzLl90cmFuc2xhdGVNZXNzYWdlSWZOZWVkZWQobWVzc2FnZSk7XG4gICAgICB3ZWJTb2NrZXQuc2VuZChtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nRXJyb3IoJ1doeSBpc25cXCd0IGNocm9tZSB3ZWJzb2NrZXQgYXZhaWxhYmxlPycpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ1JlY2VpdmVkIHNlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXNzaW9uRW5kKCk6IHZvaWQge1xuICAgIGxvZygnRW5kaW5nIFNlc3Npb24nKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoU0VTU0lPTl9FTkRfRVZFTlQpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3N0YXJ0Q2hyb21lV2ViU29ja2V0U2VydmVyKCk6IHN0cmluZyB7XG4gICAgLy8gc2V0dXAgd2ViIHNvY2tldFxuICAgIC8vIFRPRE86IEFzc2lnbiByYW5kb20gcG9ydCByYXRoZXIgdGhhbiB1c2luZyBmaXhlZCBwb3J0LlxuICAgIGNvbnN0IHdzUG9ydCA9IDIwMDA7XG4gICAgY29uc3Qgc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgdGhpcy5fY2hyb21lV2ViU29ja2V0U2VydmVyID0gc2VydmVyO1xuICAgIHNlcnZlci5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICBsb2dFcnJvcignU2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgc2VydmVyLm9uKCdoZWFkZXJzJywgaGVhZGVycyA9PiB7XG4gICAgICBsb2coJ1NlcnZlciBoZWFkZXJzOiAnICsgaGVhZGVycyk7XG4gICAgfSk7XG4gICAgc2VydmVyLm9uKCdjb25uZWN0aW9uJywgd2ViU29ja2V0ID0+IHtcbiAgICAgIGlmICh0aGlzLl9jaHJvbWVXZWJTb2NrZXQpIHtcbiAgICAgICAgbG9nKCdBbHJlYWR5IGNvbm5lY3RlZCB0byBDaHJvbWUgV2ViU29ja2V0LiBEaXNjYXJkaW5nIG5ldyBjb25uZWN0aW9uLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxvZygnQ29ubmVjdGluZyB0byBDaHJvbWUgV2ViU29ja2V0IGNsaWVudC4nKTtcbiAgICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldCA9IHdlYlNvY2tldDtcbiAgICAgIHdlYlNvY2tldC5vbignbWVzc2FnZScsIHRoaXMuX29uQ2hyb21lU29ja2V0TWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgIHdlYlNvY2tldC5vbignZXJyb3InLCB0aGlzLl9vbkNocm9tZVNvY2tldEVycm9yLmJpbmQodGhpcykpO1xuICAgICAgd2ViU29ja2V0Lm9uKCdjbG9zZScsIHRoaXMuX29uQ2hyb21lU29ja2V0Q2xvc2UuYmluZCh0aGlzKSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSAnd3M9bG9jYWxob3N0OicgKyBTdHJpbmcod3NQb3J0KSArICcvJztcbiAgICBsb2coJ0xpc3RlbmluZyBmb3IgY29ubmVjdGlvbiBhdDogJyArIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuX2VtaXR0ZXIub24oU0VTU0lPTl9FTkRfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoU0VTU0lPTl9FTkRfRVZFTlQsIGNhbGxiYWNrKSkpO1xuICB9XG5cbiAgX3RyYW5zbGF0ZU1lc3NhZ2VJZk5lZWRlZChtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IGRvIHdlIHJlYWxseSBuZWVkIGlzUmVtb3RlKCkgY2hlY2tpbmc/XG4gICAgaWYgKHJlbW90ZVVyaS5pc1JlbW90ZSh0aGlzLl90YXJnZXRVcmkpKSB7XG4gICAgICBtZXNzYWdlID0gdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLl90YXJnZXRVcmkpLFxuICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLl90YXJnZXRVcmkpLFxuICAgICAgICBtZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cblxuICBfb25DaHJvbWVTb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgQ2hyb21lIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uO1xuICAgIGlmIChjb25uZWN0aW9uKSB7XG4gICAgICBjb25uZWN0aW9uLnNlbmRDb21tYW5kKHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKCdXaHkgaXNuXFwndCBkZWJ1Z2VyIFJQQyBzZXJ2aWNlIGF2YWlsYWJsZT8nKTtcbiAgICB9XG4gIH1cblxuICBfb25DaHJvbWVTb2NrZXRFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignQ2hyb21lIHdlYlNvY2tldCBlcnJvciAnICsgc3RyaW5naWZ5RXJyb3IoZXJyb3IpKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vbkNocm9tZVNvY2tldENsb3NlKGNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxvZygnQ2hyb21lIHdlYlNvY2tldCBDbG9zZWQgJyArIGNvZGUpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fY2hyb21lV2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3NpbmcgQ2hyb21lIHdlYlNvY2tldCcpO1xuICAgICAgd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXI7XG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBDaHJvbWUgc2VydmVyJyk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldFNlcnZlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=