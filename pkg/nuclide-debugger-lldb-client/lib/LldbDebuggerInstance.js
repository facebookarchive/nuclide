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
})(_nuclideDebuggerAtom.DebuggerInstance);

exports.LldbDebuggerInstance = LldbDebuggerInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxsZGJEZWJ1Z2dlckluc3RhbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBZ0IyQixRQUFROztxQkFDakIsU0FBUzs7OzttQ0FDSSw2QkFBNkI7O29CQUMxQixNQUFNOzs4QkFPSCx1QkFBdUI7O0lBTnJELEdBQUcsc0JBQUgsR0FBRztJQUFFLE9BQU8sc0JBQVAsT0FBTztJQUFFLFFBQVEsc0JBQVIsUUFBUTs7ZUFDa0MsT0FBTyxDQUFDLHlCQUF5QixDQUFDOztJQUExRiwwQkFBMEIsWUFBMUIsMEJBQTBCO0lBQUUsd0JBQXdCLFlBQXhCLHdCQUF3Qjs7QUFDM0QsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7O2dCQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLGFBQVYsVUFBVTs7QUFDakIsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7SUFDdEMsY0FBYyxHQUFJLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEtBQUssQ0FBeEQsY0FBYzs7QUFHckIsSUFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQzs7SUFFakMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7QUFRcEIsV0FSQSxvQkFBb0IsQ0FTN0IsV0FBZ0MsRUFDaEMsVUFBa0MsRUFDbEMsZ0JBQThCLEVBQzlCOzBCQVpTLG9CQUFvQjs7QUFhN0IsK0JBYlMsb0JBQW9CLDZDQWF2QixXQUFXLEVBQUU7O0FBRW5CLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDaEMsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztBQUNuQyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFB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LENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUMzRCxNQUFNO0FBQ0wsZ0JBQVEsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO09BQ3ZEO0tBQ0Y7OztXQUVtQiw4QkFBQyxLQUFZLEVBQVE7QUFDdkMsY0FBUSxDQUFDLHlCQUF5QixHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzVELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRW1CLDhCQUFDLElBQVksRUFBUTtBQUN2QyxTQUFHLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2hCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hDLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDcEMsaUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsQixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQzlCO0FBQ0QsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0FBQzNDLFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDakMsY0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztPQUNwQztLQUNGOzs7U0FoSlUsb0JBQW9CIiwiZmlsZSI6IkxsZGJEZWJ1Z2dlckluc3RhbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEZWJ1Z2dlckNvbm5lY3Rpb24gYXMgRGVidWdnZXJDb25uZWN0aW9uVHlwZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5jb25zdCB7bG9nLCBsb2dJbmZvLCBsb2dFcnJvcn0gPSB1dGlscztcbmNvbnN0IHt0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlciwgdHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyfSA9IHJlcXVpcmUoJy4vQ2hyb21lTWVzc2FnZVJlbW90aW5nJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3Qge3N0cmluZ2lmeUVycm9yfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpLmVycm9yO1xuaW1wb3J0IHtEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5jb25zdCBTRVNTSU9OX0VORF9FVkVOVCA9ICdzZXNzaW9uLWVuZC1ldmVudCc7XG5cbmV4cG9ydCBjbGFzcyBMbGRiRGVidWdnZXJJbnN0YW5jZSBleHRlbmRzIERlYnVnZ2VySW5zdGFuY2Uge1xuICBfZGVidWdnZXJDb25uZWN0aW9uOiA/RGVidWdnZXJDb25uZWN0aW9uVHlwZTtcbiAgX2F0dGFjaFByb21pc2U6ID9Qcm9taXNlPERlYnVnZ2VyQ29ubmVjdGlvblR5cGU+O1xuICBfY2hyb21lV2ViU29ja2V0U2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfY2hyb21lV2ViU29ja2V0OiA/V2ViU29ja2V0O1xuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbyxcbiAgICBjb25uZWN0aW9uOiBEZWJ1Z2dlckNvbm5lY3Rpb25UeXBlLFxuICAgIG91dHB1dERpc3Bvc2FibGU6ID9JRGlzcG9zYWJsZSxcbiAgKSB7XG4gICAgc3VwZXIocHJvY2Vzc0luZm8pO1xuXG4gICAgdGhpcy5fZGVidWdnZXJDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9hdHRhY2hQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGlmIChvdXRwdXREaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvdXRwdXREaXNwb3NhYmxlKTtcbiAgICB9XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9yZWdpc3RlckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gIH1cblxuICBfcmVnaXN0ZXJDb25uZWN0aW9uKGNvbm5lY3Rpb246IERlYnVnZ2VyQ29ubmVjdGlvblR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJ1Z2dlckNvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChjb25uZWN0aW9uKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICBjb25uZWN0aW9uLmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICAgIHRoaXMuX2hhbmRsZVNlcnZlckVycm9yLmJpbmQodGhpcyksXG4gICAgICAgIHRoaXMuX2hhbmRsZVNlc3Npb25FbmQuYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgc2VydmVyIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCB3ZWJTb2NrZXQgPSB0aGlzLl9jaHJvbWVXZWJTb2NrZXQ7XG4gICAgaWYgKHdlYlNvY2tldCkge1xuICAgICAgbWVzc2FnZSA9IHRoaXMuX3RyYW5zbGF0ZU1lc3NhZ2VJZk5lZWRlZChtZXNzYWdlKTtcbiAgICAgIHdlYlNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcignV2h5IGlzblxcJ3QgY2hyb21lIHdlYnNvY2tldCBhdmFpbGFibGU/Jyk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignUmVjZWl2ZWQgc2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgbG9nKCdFbmRpbmcgU2Vzc2lvbicpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChTRVNTSU9OX0VORF9FVkVOVCk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9zdGFydENocm9tZVdlYlNvY2tldFNlcnZlcigpKTtcbiAgfVxuXG4gIF9zdGFydENocm9tZVdlYlNvY2tldFNlcnZlcigpOiBzdHJpbmcge1xuICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAvLyBUT0RPOiBBc3NpZ24gcmFuZG9tIHBvcnQgcmF0aGVyIHRoYW4gdXNpbmcgZml4ZWQgcG9ydC5cbiAgICBjb25zdCB3c1BvcnQgPSAyMDAwO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgIHRoaXMuX2Nocm9tZVdlYlNvY2tldFNlcnZlciA9IHNlcnZlcjtcbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgbG9nKCdTZXJ2ZXIgaGVhZGVyczogJyArIGhlYWRlcnMpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICBpZiAodGhpcy5fY2hyb21lV2ViU29ja2V0KSB7XG4gICAgICAgIGxvZygnQWxyZWFkeSBjb25uZWN0ZWQgdG8gQ2hyb21lIFdlYlNvY2tldC4gRGlzY2FyZGluZyBuZXcgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2coJ0Nvbm5lY3RpbmcgdG8gQ2hyb21lIFdlYlNvY2tldCBjbGllbnQuJyk7XG4gICAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICB3ZWJTb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9vbkNocm9tZVNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25DaHJvbWVTb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vbkNocm9tZVNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gJ3dzPWxvY2FsaG9zdDonICsgU3RyaW5nKHdzUG9ydCkgKyAnLyc7XG4gICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKFNFU1NJT05fRU5EX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKFNFU1NJT05fRU5EX0VWRU5ULCBjYWxsYmFjaykpKTtcbiAgfVxuXG4gIF90cmFuc2xhdGVNZXNzYWdlSWZOZWVkZWQobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiBkbyB3ZSByZWFsbHkgbmVlZCBpc1JlbW90ZSgpIGNoZWNraW5nP1xuICAgIGlmIChyZW1vdGVVcmkuaXNSZW1vdGUodGhpcy5nZXRUYXJnZXRVcmkoKSkpIHtcbiAgICAgIG1lc3NhZ2UgPSB0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlcihcbiAgICAgICAgcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgbWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgX29uQ2hyb21lU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIENocm9tZSBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IHRoaXMuX2RlYnVnZ2VyQ29ubmVjdGlvbjtcbiAgICBpZiAoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5zZW5kQ29tbWFuZCh0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXIobWVzc2FnZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcignV2h5IGlzblxcJ3QgZGVidWdlciBSUEMgc2VydmljZSBhdmFpbGFibGU/Jyk7XG4gICAgfVxuICB9XG5cbiAgX29uQ2hyb21lU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ0Nocm9tZSB3ZWJTb2NrZXQgZXJyb3IgJyArIHN0cmluZ2lmeUVycm9yKGVycm9yKSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25DaHJvbWVTb2NrZXRDbG9zZShjb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsb2coJ0Nocm9tZSB3ZWJTb2NrZXQgQ2xvc2VkICcgKyBjb2RlKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX2Nocm9tZVdlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIENocm9tZSB3ZWJTb2NrZXQnKTtcbiAgICAgIHdlYlNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2hyb21lV2ViU29ja2V0ID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gdGhpcy5fY2hyb21lV2ViU29ja2V0U2VydmVyO1xuICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3NpbmcgQ2hyb21lIHNlcnZlcicpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICB0aGlzLl9jaHJvbWVXZWJTb2NrZXRTZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19