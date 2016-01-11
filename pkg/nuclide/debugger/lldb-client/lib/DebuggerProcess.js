var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var log = _utils2['default'].log;
var logInfo = _utils2['default'].logInfo;
var logError = _utils2['default'].logError;
var setLogLevel = _utils2['default'].setLogLevel;

var featureConfig = require('../../../feature-config');

var _require = require('./ChromeMessageRemoting');

var translateMessageFromServer = _require.translateMessageFromServer;
var translateMessageToServer = _require.translateMessageToServer;

var remoteUri = require('../../../remote-uri');

var _require2 = require('atom');

var Disposable = _require2.Disposable;

var WebSocketServer = require('ws').Server;

var stringifyError = require('../../../commons').error.stringifyError;

function getConfig() {
  return featureConfig.get('nuclide-debugger-hhvm');
}

var DebuggerProcess = (function () {
  function DebuggerProcess(remoteDirectoryUri, launchScriptPath) {
    _classCallCheck(this, DebuggerProcess);

    this._remoteDirectoryUri = remoteDirectoryUri;
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;

    var _require3 = require('atom');

    var CompositeDisposable = _require3.CompositeDisposable;

    this._disposables = new CompositeDisposable();
    this._sessionEndCallback = null;

    setLogLevel(getConfig().logLevel);
  }

  // TODO: Move this to nuclide-commons.

  _createClass(DebuggerProcess, [{
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      var _this = this;

      logInfo('Connecting to: ' + this._remoteDirectoryUri);

      var _require$getServiceByNuclideUri = require('../../../client').getServiceByNuclideUri('HhvmDebuggerProxyService', this._remoteDirectoryUri);

      var HhvmDebuggerProxyService = _require$getServiceByNuclideUri.HhvmDebuggerProxyService;

      var proxy = new HhvmDebuggerProxyService();
      this._proxy = proxy;
      this._disposables.add(proxy);
      this._disposables.add(proxy.getNotificationObservable().subscribe(this._handleNotificationMessage.bind(this), this._handleNotificationError.bind(this), this._handleNotificationEnd.bind(this)));
      this._disposables.add(proxy.getServerMessageObservable().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleServerEnd.bind(this)));

      var config = getConfig();
      var connectionConfig = {
        xdebugPort: config.xdebugPort,
        targetUri: remoteUri.getPath(this._remoteDirectoryUri),
        logLevel: config.logLevel
      };
      logInfo('Connection config: ' + JSON.stringify(config));

      if (!isValidRegex(config.scriptRegex)) {
        // TODO: User facing error message?
        logError('nuclide-debugger-hhvm config scriptRegex is not a valid regular expression: ' + config.scriptRegex);
      } else {
        connectionConfig.scriptRegex = config.scriptRegex;
      }

      if (!isValidRegex(config.idekeyRegex)) {
        // TODO: User facing error message?
        logError('nuclide-debugger-hhvm config idekeyRegex is not a valid regular expression: ' + config.idekeyRegex);
      } else {
        connectionConfig.idekeyRegex = config.idekeyRegex;
      }

      if (this._launchScriptPath) {
        connectionConfig.endDebugWhenNoRequests = true;
      }

      var attachPromise = proxy.attach(connectionConfig);
      if (this._launchScriptPath) {
        logInfo('launchScript: ' + this._launchScriptPath);
        proxy.launchScript(this._launchScriptPath);
      }

      return attachPromise.then(function (attachResult) {

        logInfo('Attached to process. Attach message: ' + attachResult);

        // setup web socket
        // TODO: Assign random port rather than using fixed port.
        var wsPort = 2000;
        var server = new WebSocketServer({ port: wsPort });
        _this._server = server;
        server.on('error', function (error) {
          logError('Server error: ' + error);
          _this.dispose();
        });
        server.on('headers', function (headers) {
          log('Server headers: ' + headers);
        });
        server.on('connection', function (webSocket) {
          if (_this._webSocket) {
            log('Already connected to web socket. Discarding new connection.');
            return;
          }

          log('Connecting to web socket client.');
          _this._webSocket = webSocket;
          webSocket.on('message', _this._onSocketMessage.bind(_this));
          webSocket.on('error', _this._onSocketError.bind(_this));
          webSocket.on('close', _this._onSocketClose.bind(_this));
        });

        var result = 'ws=localhost:' + String(wsPort) + '/';
        log('Listening for connection at: ' + result);
        return result;
      });
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      var _this2 = this;

      this._sessionEndCallback = callback;
      return new Disposable(function () {
        return _this2._sessionEndCallback = null;
      });
    }
  }, {
    key: '_handleServerMessage',
    value: function _handleServerMessage(message) {
      log('Recieved server message: ' + message);
      var webSocket = this._webSocket;
      if (webSocket != null) {
        webSocket.send(translateMessageFromServer(remoteUri.getHostname(this._remoteDirectoryUri), remoteUri.getPort(this._remoteDirectoryUri), message));
      }
    }
  }, {
    key: '_handleServerError',
    value: function _handleServerError(error) {
      logError('Received server error: ' + error);
    }
  }, {
    key: '_handleServerEnd',
    value: function _handleServerEnd() {
      log('Server observerable ends.');
    }
  }, {
    key: '_handleNotificationMessage',
    value: function _handleNotificationMessage(message) {
      switch (message.type) {
        case 'info':
          log('Notification observerable info: ' + message.message);
          atom.notifications.addInfo(message.message);
          break;

        case 'warning':
          log('Notification observerable warning: ' + message.message);
          atom.notifications.addWarning(message.message);
          break;

        case 'error':
          logError('Notification observerable error: ' + message.message);
          atom.notifications.addError(message.message);
          break;

        case 'fatalError':
          logError('Notification observerable fatal error: ' + message.message);
          atom.notifications.addFatalError(message.message);
          break;

        default:
          logError('Unknown message: ' + JSON.stringify(message));
          break;
      }
    }
  }, {
    key: '_handleNotificationError',
    value: function _handleNotificationError(error) {
      logError('Notification observerable error: ' + error);
    }

    /**
     * _endSession() must be called from _handleNotificationEnd()
     * so that we can guarantee all notifications have been processed.
     */
  }, {
    key: '_handleNotificationEnd',
    value: function _handleNotificationEnd() {
      log('Notification observerable ends.');
      this._endSession();
    }
  }, {
    key: '_endSession',
    value: function _endSession() {
      log('Ending Session');
      if (this._sessionEndCallback) {
        this._sessionEndCallback();
      }
      this.dispose();
    }
  }, {
    key: '_onSocketMessage',
    value: function _onSocketMessage(message) {
      log('Recieved webSocket message: ' + message);
      var proxy = this._proxy;
      if (proxy) {
        proxy.sendCommand(translateMessageToServer(message));
      }
    }
  }, {
    key: '_onSocketError',
    value: function _onSocketError(error) {
      logError('webSocket error ' + stringifyError(error));
      this.dispose();
    }
  }, {
    key: '_onSocketClose',
    value: function _onSocketClose(code) {
      log('webSocket Closed ' + code);
      this.dispose();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      var webSocket = this._webSocket;
      if (webSocket) {
        logInfo('closing webSocket');
        webSocket.close();
        this._webSocket = null;
      }
      var server = this._server;
      if (server) {
        logInfo('closing server');
        server.close();
        this._server = null;
      }
    }
  }]);

  return DebuggerProcess;
})();

function isValidRegex(value) {
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }

  return true;
}

module.exports = DebuggerProcess;
//# sourceMappingURL=data:application/json;base64,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QUFPLENBQUMsRUFBRTtBQUNWLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlclByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eSc7XG5cbmltcG9ydCB0eXBlIHtIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UgYXMgSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZSx9XG4gICAgZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eS9saWIvSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJztcblxuY29uc3Qge2xvZywgbG9nSW5mbywgbG9nRXJyb3IsIHNldExvZ0xldmVsfSA9IHV0aWxzO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCB7dHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIsIHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcn0gPSByZXF1aXJlKCcuL0Nocm9tZU1lc3NhZ2VSZW1vdGluZycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCB7c3RyaW5naWZ5RXJyb3J9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpLmVycm9yO1xuXG50eXBlIE5vdGlmaWNhdGlvbk1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWxFcnJvcic7XG4gIG1lc3NhZ2U6IHN0cmluZztcbn07XG5cbnR5cGUgSGh2bURlYnVnZ2VyQ29uZmlnID0ge1xuICBzY3JpcHRSZWdleDogc3RyaW5nO1xuICBpZGVrZXlSZWdleDogc3RyaW5nO1xuICB4ZGVidWdQb3J0OiBudW1iZXI7XG4gIGVuZERlYnVnV2hlbk5vUmVxdWVzdHM6IGJvb2xlYW47XG4gIGxvZ0xldmVsOiBzdHJpbmc7XG59O1xuXG5mdW5jdGlvbiBnZXRDb25maWcoKTogSGh2bURlYnVnZ2VyQ29uZmlnIHtcbiAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kZWJ1Z2dlci1oaHZtJyk6IGFueSk7XG59XG5cbmNsYXNzIERlYnVnZ2VyUHJvY2VzcyB7XG4gIF9yZW1vdGVEaXJlY3RvcnlVcmk6IE51Y2xpZGVVcmk7XG4gIF9wcm94eTogP0hodm1EZWJ1Z2dlclByb3h5U2VydmljZVR5cGU7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF93ZWJTb2NrZXQ6ID9XZWJTb2NrZXQ7XG4gIF9kaXNwb3NhYmxlczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbGF1bmNoU2NyaXB0UGF0aDogP3N0cmluZztcbiAgX3Nlc3Npb25FbmRDYWxsYmFjazogPygpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocmVtb3RlRGlyZWN0b3J5VXJpOiBOdWNsaWRlVXJpLCBsYXVuY2hTY3JpcHRQYXRoOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fcmVtb3RlRGlyZWN0b3J5VXJpID0gcmVtb3RlRGlyZWN0b3J5VXJpO1xuICAgIHRoaXMuX2xhdW5jaFNjcmlwdFBhdGggPSBsYXVuY2hTY3JpcHRQYXRoO1xuICAgIHRoaXMuX3Byb3h5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgc2V0TG9nTGV2ZWwoZ2V0Q29uZmlnKCkubG9nTGV2ZWwpO1xuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxvZ0luZm8oJ0Nvbm5lY3RpbmcgdG86ICcgKyB0aGlzLl9yZW1vdGVEaXJlY3RvcnlVcmkpO1xuICAgIGNvbnN0IHtIaHZtRGVidWdnZXJQcm94eVNlcnZpY2V9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY2xpZW50JykuXG4gICAgICBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnLCB0aGlzLl9yZW1vdGVEaXJlY3RvcnlVcmkpO1xuICAgIGNvbnN0IHByb3h5ID0gbmV3IEhodm1EZWJ1Z2dlclByb3h5U2VydmljZSgpO1xuICAgIHRoaXMuX3Byb3h5ID0gcHJveHk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb3h5KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkuZ2V0Tm90aWZpY2F0aW9uT2JzZXJ2YWJsZSgpLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25FbmQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkuZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRW5kLmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Db25maWc6IENvbm5lY3Rpb25Db25maWcgPSB7XG4gICAgICB4ZGVidWdQb3J0OiBjb25maWcueGRlYnVnUG9ydCxcbiAgICAgIHRhcmdldFVyaTogcmVtb3RlVXJpLmdldFBhdGgodGhpcy5fcmVtb3RlRGlyZWN0b3J5VXJpKSxcbiAgICAgIGxvZ0xldmVsOiBjb25maWcubG9nTGV2ZWwsXG4gICAgfTtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW9uIGNvbmZpZzogJyArIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLnNjcmlwdFJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGxvZ0Vycm9yKCdudWNsaWRlLWRlYnVnZ2VyLWhodm0gY29uZmlnIHNjcmlwdFJlZ2V4IGlzIG5vdCBhIHZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJ1xuICAgICAgICArIGNvbmZpZy5zY3JpcHRSZWdleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuc2NyaXB0UmVnZXggPSBjb25maWcuc2NyaXB0UmVnZXg7XG4gICAgfVxuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLmlkZWtleVJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGxvZ0Vycm9yKCdudWNsaWRlLWRlYnVnZ2VyLWhodm0gY29uZmlnIGlkZWtleVJlZ2V4IGlzIG5vdCBhIHZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJ1xuICAgICAgICArIGNvbmZpZy5pZGVrZXlSZWdleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuaWRla2V5UmVnZXggPSBjb25maWcuaWRla2V5UmVnZXg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cyA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgYXR0YWNoUHJvbWlzZSA9IHByb3h5LmF0dGFjaChjb25uZWN0aW9uQ29uZmlnKTtcbiAgICBpZiAodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCkge1xuICAgICAgbG9nSW5mbygnbGF1bmNoU2NyaXB0OiAnICsgdGhpcy5fbGF1bmNoU2NyaXB0UGF0aCk7XG4gICAgICBwcm94eS5sYXVuY2hTY3JpcHQodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dGFjaFByb21pc2UudGhlbihhdHRhY2hSZXN1bHQgPT4ge1xuXG4gICAgICBsb2dJbmZvKCdBdHRhY2hlZCB0byBwcm9jZXNzLiBBdHRhY2ggbWVzc2FnZTogJyArIGF0dGFjaFJlc3VsdCk7XG5cbiAgICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAgIC8vIFRPRE86IEFzc2lnbiByYW5kb20gcG9ydCByYXRoZXIgdGhhbiB1c2luZyBmaXhlZCBwb3J0LlxuICAgICAgY29uc3Qgd3NQb3J0ID0gMjAwMDtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgICAgdGhpcy5fc2VydmVyID0gc2VydmVyO1xuICAgICAgc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgICBsb2coJ1NlcnZlciBoZWFkZXJzOiAnICsgaGVhZGVycyk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJTb2NrZXQpIHtcbiAgICAgICAgICBsb2coJ0FscmVhZHkgY29ubmVjdGVkIHRvIHdlYiBzb2NrZXQuIERpc2NhcmRpbmcgbmV3IGNvbm5lY3Rpb24uJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKCdDb25uZWN0aW5nIHRvIHdlYiBzb2NrZXQgY2xpZW50LicpO1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICAgIHdlYlNvY2tldC5vbignbWVzc2FnZScsIHRoaXMuX29uU29ja2V0TWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgd2ViU29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vblNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9ICd3cz1sb2NhbGhvc3Q6JyArIFN0cmluZyh3c1BvcnQpICsgJy8nO1xuICAgICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiAobmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gbnVsbCkpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlck1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nKCdSZWNpZXZlZCBzZXJ2ZXIgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0ICE9IG51bGwpIHtcbiAgICAgIHdlYlNvY2tldC5zZW5kKFxuICAgICAgICB0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlcihcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGhpcy5fcmVtb3RlRGlyZWN0b3J5VXJpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLl9yZW1vdGVEaXJlY3RvcnlVcmkpLFxuICAgICAgICAgIG1lc3NhZ2UpKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdSZWNlaXZlZCBzZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRW5kKCk6IHZvaWQge1xuICAgIGxvZygnU2VydmVyIG9ic2VydmVyYWJsZSBlbmRzLicpO1xuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UobWVzc2FnZTogTm90aWZpY2F0aW9uTWVzc2FnZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGluZm86ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSB3YXJuaW5nOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZhdGFsRXJyb3InOlxuICAgICAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBmYXRhbCBlcnJvcjogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dFcnJvcignVW5rbm93biBtZXNzYWdlOiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlTm90aWZpY2F0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIF9lbmRTZXNzaW9uKCkgbXVzdCBiZSBjYWxsZWQgZnJvbSBfaGFuZGxlTm90aWZpY2F0aW9uRW5kKClcbiAgICogc28gdGhhdCB3ZSBjYW4gZ3VhcmFudGVlIGFsbCBub3RpZmljYXRpb25zIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gICAqL1xuICBfaGFuZGxlTm90aWZpY2F0aW9uRW5kKCk6IHZvaWQge1xuICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlbmRzLicpO1xuICAgIHRoaXMuX2VuZFNlc3Npb24oKTtcbiAgfVxuXG4gIF9lbmRTZXNzaW9uKCk6IHZvaWQge1xuICAgIGxvZygnRW5kaW5nIFNlc3Npb24nKTtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgd2ViU29ja2V0IG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCBwcm94eSA9IHRoaXMuX3Byb3h5O1xuICAgIGlmIChwcm94eSkge1xuICAgICAgcHJveHkuc2VuZENvbW1hbmQodHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyKG1lc3NhZ2UpKTtcbiAgICB9XG4gIH1cblxuICBfb25Tb2NrZXRFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignd2ViU29ja2V0IGVycm9yICcgKyBzdHJpbmdpZnlFcnJvcihlcnJvcikpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0Q2xvc2UoY29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgbG9nKCd3ZWJTb2NrZXQgQ2xvc2VkICcgKyBjb2RlKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIHdlYlNvY2tldCcpO1xuICAgICAgd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9zZXJ2ZXI7XG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBzZXJ2ZXInKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETzogTW92ZSB0aGlzIHRvIG51Y2xpZGUtY29tbW9ucy5cbmZ1bmN0aW9uIGlzVmFsaWRSZWdleCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgUmVnRXhwKHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyUHJvY2VzcztcbiJdfQ==