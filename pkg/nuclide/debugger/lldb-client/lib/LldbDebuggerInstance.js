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

  function LldbDebuggerInstance(processInfo, connection) {
    _classCallCheck(this, LldbDebuggerInstance);

    _get(Object.getPrototypeOf(LldbDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);

    this._debuggerConnection = null;
    this._attachPromise = null;
    this._chromeWebSocketServer = null;
    this._chromeWebSocket = null;

    var _require3 = require('atom');

    var CompositeDisposable = _require3.CompositeDisposable;

    this._disposables = new CompositeDisposable();
    this._emitter = new _events.EventEmitter();
    this._registerConnection(connection);
  }

  _createClass(LldbDebuggerInstance, [{
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
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      return Promise.resolve(this._startChromeWebSocketServer());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxsZGJEZWJ1Z2dlckluc3RhbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBZ0IyQixRQUFROztxQkFDakIsU0FBUzs7OztvQkFDSSxZQUFZOztJQUNwQyxHQUFHLHNCQUFILEdBQUc7SUFBRSxPQUFPLHNCQUFQLE9BQU87SUFBRSxRQUFRLHNCQUFSLFFBQVE7O2VBQ2tDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQzs7SUFBMUYsMEJBQTBCLFlBQTFCLDBCQUEwQjtJQUFFLHdCQUF3QixZQUF4Qix3QkFBd0I7O0FBQzNELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztnQkFDNUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxhQUFWLFVBQVU7O0FBQ2pCLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7O0lBQ3RDLGNBQWMsR0FBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQW5ELGNBQWM7O0FBRXJCLElBQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7O0lBRWpDLG9CQUFvQjtZQUFwQixvQkFBb0I7O0FBUXBCLFdBUkEsb0JBQW9CLENBUW5CLFdBQWdDLEVBQUUsVUFBa0MsRUFBRTswQkFSdkUsb0JBQW9COztBQVM3QiwrQkFUUyxvQkFBb0IsNkNBU3ZCLFdBQVcsRUFBRTs7QUFFbkIsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUNoQyxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O29CQUNDLE9BQU8sQ0FBQyxNQUFNLENBQUM7O1FBQXRDLG1CQUFtQixhQUFuQixtQkFBbUI7O0FBQzFCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFB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OztXQUVtQiw4QkFBQyxLQUFZLEVBQVE7QUFDdkMsY0FBUSxDQUFDLHlCQUF5QixHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzVELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRW1CLDhCQUFDLElBQVksRUFBUTtBQUN2QyxTQUFHLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2hCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hDLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDcEMsaUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQzlCO0FBQ0QsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0FBQzNDLFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDakMsY0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztPQUNwQztLQUNGOzs7U0F6SVUsb0JBQW9CIiwiZmlsZSI6IkxsZGJEZWJ1Z2dlckluc3RhbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEZWJ1Z2dlckNvbm5lY3Rpb24gYXMgRGVidWdnZXJDb25uZWN0aW9uVHlwZSxcbn0gZnJvbSAnLi4vLi4vbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5pbXBvcnQgdHlwZSB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9hdG9tJztcbmNvbnN0IHtsb2csIGxvZ0luZm8sIGxvZ0Vycm9yfSA9IHV0aWxzO1xuY29uc3Qge3RyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyLCB0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXJ9ID0gcmVxdWlyZSgnLi9DaHJvbWVNZXNzYWdlUmVtb3RpbmcnKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3Qge3N0cmluZ2lmeUVycm9yfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKS5lcnJvcjtcblxuY29uc3QgU0VTU0lPTl9FTkRfRVZFTlQgPSAnc2Vzc2lvbi1lbmQtZXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgTGxkYkRlYnVnZ2VySW5zdGFuY2UgZXh0ZW5kcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX2RlYnVnZ2VyQ29ubmVjdGlvbjogP0RlYnVnZ2VyQ29ubmVjdGlvblR5cGU7XG4gIF9hdHRhY2hQcm9taXNlOiA/UHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb25UeXBlPjtcbiAgX2Nocm9tZVdlYlNvY2tldFNlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX2Nocm9tZVdlYlNvY2tldDogP1dlYlNvY2tldDtcbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8sIGNvbm5lY3Rpb246IERlYnVnZ2VyQ29ubmVjdGlvblR5cGUpIHtcbiAgICBzdXBlcihwcm9jZXNzSW5mbyk7XG5cbiAgICB0aGlzLl9kZWJ1Z2dlckNvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX2F0dGFjaFByb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldFNlcnZlciA9IG51bGw7XG4gICAgdGhpcy5fY2hyb21lV2ViU29ja2V0ID0gbnVsbDtcbiAgICBjb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICB9XG5cbiAgX3JlZ2lzdGVyQ29ubmVjdGlvbihjb25uZWN0aW9uOiBEZWJ1Z2dlckNvbm5lY3Rpb25UeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoY29ubmVjdGlvbik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGNvbm5lY3Rpb24uZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2Vzc2lvbkVuZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHNlcnZlciBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fY2hyb21lV2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQpIHtcbiAgICAgIG1lc3NhZ2UgPSB0aGlzLl90cmFuc2xhdGVNZXNzYWdlSWZOZWVkZWQobWVzc2FnZSk7XG4gICAgICB3ZWJTb2NrZXQuc2VuZChtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nRXJyb3IoJ1doeSBpc25cXCd0IGNocm9tZSB3ZWJzb2NrZXQgYXZhaWxhYmxlPycpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ1JlY2VpdmVkIHNlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXNzaW9uRW5kKCk6IHZvaWQge1xuICAgIGxvZygnRW5kaW5nIFNlc3Npb24nKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoU0VTU0lPTl9FTkRfRVZFTlQpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fc3RhcnRDaHJvbWVXZWJTb2NrZXRTZXJ2ZXIoKSk7XG4gIH1cblxuICBfc3RhcnRDaHJvbWVXZWJTb2NrZXRTZXJ2ZXIoKTogc3RyaW5nIHtcbiAgICAvLyBzZXR1cCB3ZWIgc29ja2V0XG4gICAgLy8gVE9ETzogQXNzaWduIHJhbmRvbSBwb3J0IHJhdGhlciB0aGFuIHVzaW5nIGZpeGVkIHBvcnQuXG4gICAgY29uc3Qgd3NQb3J0ID0gMjAwMDtcbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiB3c1BvcnR9KTtcbiAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGxvZ0Vycm9yKCdTZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgICBzZXJ2ZXIub24oJ2hlYWRlcnMnLCBoZWFkZXJzID0+IHtcbiAgICAgIGxvZygnU2VydmVyIGhlYWRlcnM6ICcgKyBoZWFkZXJzKTtcbiAgICB9KTtcbiAgICBzZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJTb2NrZXQgPT4ge1xuICAgICAgaWYgKHRoaXMuX2Nocm9tZVdlYlNvY2tldCkge1xuICAgICAgICBsb2coJ0FscmVhZHkgY29ubmVjdGVkIHRvIENocm9tZSBXZWJTb2NrZXQuIERpc2NhcmRpbmcgbmV3IGNvbm5lY3Rpb24uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9nKCdDb25uZWN0aW5nIHRvIENocm9tZSBXZWJTb2NrZXQgY2xpZW50LicpO1xuICAgICAgdGhpcy5fY2hyb21lV2ViU29ja2V0ID0gd2ViU29ja2V0O1xuICAgICAgd2ViU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5fb25DaHJvbWVTb2NrZXRNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgd2ViU29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uQ2hyb21lU29ja2V0RXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Nsb3NlJywgdGhpcy5fb25DaHJvbWVTb2NrZXRDbG9zZS5iaW5kKHRoaXMpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9ICd3cz1sb2NhbGhvc3Q6JyArIFN0cmluZyh3c1BvcnQpICsgJy8nO1xuICAgIGxvZygnTGlzdGVuaW5nIGZvciBjb25uZWN0aW9uIGF0OiAnICsgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fZW1pdHRlci5vbihTRVNTSU9OX0VORF9FVkVOVCwgY2FsbGJhY2spO1xuICAgIHJldHVybiAobmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihTRVNTSU9OX0VORF9FVkVOVCwgY2FsbGJhY2spKSk7XG4gIH1cblxuICBfdHJhbnNsYXRlTWVzc2FnZUlmTmVlZGVkKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogZG8gd2UgcmVhbGx5IG5lZWQgaXNSZW1vdGUoKSBjaGVja2luZz9cbiAgICBpZiAocmVtb3RlVXJpLmlzUmVtb3RlKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpKSB7XG4gICAgICBtZXNzYWdlID0gdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgcmVtb3RlVXJpLmdldFBvcnQodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICAgIG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gIF9vbkNocm9tZVNvY2tldE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nKCdSZWNpZXZlZCBDaHJvbWUgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLl9kZWJ1Z2dlckNvbm5lY3Rpb247XG4gICAgaWYgKGNvbm5lY3Rpb24pIHtcbiAgICAgIGNvbm5lY3Rpb24uc2VuZENvbW1hbmQodHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyKG1lc3NhZ2UpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nRXJyb3IoJ1doeSBpc25cXCd0IGRlYnVnZXIgUlBDIHNlcnZpY2UgYXZhaWxhYmxlPycpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkNocm9tZVNvY2tldEVycm9yKGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdDaHJvbWUgd2ViU29ja2V0IGVycm9yICcgKyBzdHJpbmdpZnlFcnJvcihlcnJvcikpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uQ2hyb21lU29ja2V0Q2xvc2UoY29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgbG9nKCdDaHJvbWUgd2ViU29ja2V0IENsb3NlZCAnICsgY29kZSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBjb25zdCB3ZWJTb2NrZXQgPSB0aGlzLl9jaHJvbWVXZWJTb2NrZXQ7XG4gICAgaWYgKHdlYlNvY2tldCkge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBDaHJvbWUgd2ViU29ja2V0Jyk7XG4gICAgICB3ZWJTb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZlciA9IHRoaXMuX2Nocm9tZVdlYlNvY2tldFNlcnZlcjtcbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIENocm9tZSBzZXJ2ZXInKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2hyb21lV2ViU29ja2V0U2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==