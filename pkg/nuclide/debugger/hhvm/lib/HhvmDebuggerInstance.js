Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('../../atom');

var _OutputServiceManager = require('./OutputServiceManager');

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

var HhvmDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(HhvmDebuggerInstance, _DebuggerInstance);

  function HhvmDebuggerInstance(processInfo, launchScriptPath) {
    _classCallCheck(this, HhvmDebuggerInstance);

    _get(Object.getPrototypeOf(HhvmDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
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

  _createClass(HhvmDebuggerInstance, [{
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      var _this = this;

      logInfo('Connecting to: ' + this.getTargetUri());

      var _require4 = require('../../../client');

      var getServiceByNuclideUri = _require4.getServiceByNuclideUri;

      var service = getServiceByNuclideUri('HhvmDebuggerProxyService', this.getTargetUri());
      (0, _assert2['default'])(service);
      var proxy = new service.HhvmDebuggerProxyService();
      this._proxy = proxy;
      this._disposables.add(proxy);
      this._disposables.add(proxy.getNotificationObservable().subscribe(this._handleNotificationMessage.bind(this), this._handleNotificationError.bind(this), this._handleNotificationEnd.bind(this)));
      this._disposables.add(proxy.getServerMessageObservable().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleServerEnd.bind(this)));
      this._registerOutputWindowLogging(proxy);

      var config = getConfig();
      var connectionConfig = {
        xdebugPort: config.xdebugPort,
        targetUri: remoteUri.getPath(this.getTargetUri()),
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
        webSocket.send(translateMessageFromServer(remoteUri.getHostname(this.getTargetUri()), remoteUri.getPort(this.getTargetUri()), message));
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
    key: '_registerOutputWindowLogging',
    value: function _registerOutputWindowLogging(proxy) {
      var _this3 = this;

      var api = (0, _OutputServiceManager.getOutputService)();
      if (api != null) {
        var outputWindowMessage$ = proxy.getOutputWindowObservable().map(function (message) {
          var serverMessage = translateMessageFromServer(remoteUri.getHostname(_this3.getTargetUri()), remoteUri.getPort(_this3.getTargetUri()), message);
          return JSON.parse(serverMessage);
        }).filter(function (messageObj) {
          return messageObj.method === 'Console.messageAdded';
        }).map(function (messageObj) {
          return {
            level: messageObj.params.message.level,
            text: messageObj.params.message.text
          };
        });
        this._disposables.add(api.registerOutputProvider({
          source: 'hhvm debugger',
          messages: outputWindowMessage$
        }));
      } else {
        logError('Cannot get output window service.');
      }
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

  return HhvmDebuggerInstance;
})(_atom.DebuggerInstance);

exports.HhvmDebuggerInstance = HhvmDebuggerInstance;
function isValidRegex(value) {
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }

  return true;
}
//# sourceMappingURL=data:application/json;base64,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QVksQ0FBQyxLQUFhLEVBQVc7QUFDNUMsTUFBSTtBQUNGLFVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNmLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiSGh2bURlYnVnZ2VySW5zdGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eSc7XG5pbXBvcnQgdHlwZSB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5cbmltcG9ydCB0eXBlIHtIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UgYXMgSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZSx9XG4gICAgZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eS9saWIvSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9hdG9tJztcbmltcG9ydCB7Z2V0T3V0cHV0U2VydmljZX0gZnJvbSAnLi9PdXRwdXRTZXJ2aWNlTWFuYWdlcic7XG5cbmNvbnN0IHtsb2csIGxvZ0luZm8sIGxvZ0Vycm9yLCBzZXRMb2dMZXZlbH0gPSB1dGlscztcbmNvbnN0IGZlYXR1cmVDb25maWcgPSByZXF1aXJlKCcuLi8uLi8uLi9mZWF0dXJlLWNvbmZpZycpO1xuY29uc3Qge3RyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyLCB0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXJ9ID0gcmVxdWlyZSgnLi9DaHJvbWVNZXNzYWdlUmVtb3RpbmcnKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3Qge3N0cmluZ2lmeUVycm9yfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKS5lcnJvcjtcblxudHlwZSBOb3RpZmljYXRpb25NZXNzYWdlID0ge1xuICB0eXBlOiAnaW5mbycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2ZhdGFsRXJyb3InO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuXG50eXBlIEhodm1EZWJ1Z2dlckNvbmZpZyA9IHtcbiAgc2NyaXB0UmVnZXg6IHN0cmluZztcbiAgaWRla2V5UmVnZXg6IHN0cmluZztcbiAgeGRlYnVnUG9ydDogbnVtYmVyO1xuICBlbmREZWJ1Z1doZW5Ob1JlcXVlc3RzOiBib29sZWFuO1xuICBsb2dMZXZlbDogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IEhodm1EZWJ1Z2dlckNvbmZpZyB7XG4gIHJldHVybiAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZGVidWdnZXItaGh2bScpOiBhbnkpO1xufVxuXG5leHBvcnQgY2xhc3MgSGh2bURlYnVnZ2VySW5zdGFuY2UgZXh0ZW5kcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX3Byb3h5OiA/SGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZTtcbiAgX3NlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX3dlYlNvY2tldDogP1dlYlNvY2tldDtcbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9sYXVuY2hTY3JpcHRQYXRoOiA/c3RyaW5nO1xuICBfc2Vzc2lvbkVuZENhbGxiYWNrOiA/KCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbywgbGF1bmNoU2NyaXB0UGF0aDogP3N0cmluZykge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9sYXVuY2hTY3JpcHRQYXRoID0gbGF1bmNoU2NyaXB0UGF0aDtcbiAgICB0aGlzLl9wcm94eSA9IG51bGw7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIGNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gbnVsbDtcblxuICAgIHNldExvZ0xldmVsKGdldENvbmZpZygpLmxvZ0xldmVsKTtcbiAgfVxuXG4gIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW5nIHRvOiAnICsgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY2xpZW50Jyk7XG4gICAgY29uc3Qgc2VydmljZSA9XG4gICAgICBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnLCB0aGlzLmdldFRhcmdldFVyaSgpKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZSk7XG4gICAgY29uc3QgcHJveHkgPSBuZXcgc2VydmljZS5IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UoKTtcbiAgICB0aGlzLl9wcm94eSA9IHByb3h5O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm94eSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb3h5LmdldE5vdGlmaWNhdGlvbk9ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25FcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uRW5kLmJpbmQodGhpcyksXG4gICAgKSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb3h5LmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRXJyb3IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlckVuZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5fcmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nKHByb3h5KTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Db25maWc6IENvbm5lY3Rpb25Db25maWcgPSB7XG4gICAgICB4ZGVidWdQb3J0OiBjb25maWcueGRlYnVnUG9ydCxcbiAgICAgIHRhcmdldFVyaTogcmVtb3RlVXJpLmdldFBhdGgodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICBsb2dMZXZlbDogY29uZmlnLmxvZ0xldmVsLFxuICAgIH07XG4gICAgbG9nSW5mbygnQ29ubmVjdGlvbiBjb25maWc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25maWcpKTtcblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5zY3JpcHRSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBzY3JpcHRSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuc2NyaXB0UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25uZWN0aW9uQ29uZmlnLnNjcmlwdFJlZ2V4ID0gY29uZmlnLnNjcmlwdFJlZ2V4O1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5pZGVrZXlSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBpZGVrZXlSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuaWRla2V5UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25uZWN0aW9uQ29uZmlnLmlkZWtleVJlZ2V4ID0gY29uZmlnLmlkZWtleVJlZ2V4O1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9sYXVuY2hTY3JpcHRQYXRoKSB7XG4gICAgICBjb25uZWN0aW9uQ29uZmlnLmVuZERlYnVnV2hlbk5vUmVxdWVzdHMgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGFjaFByb21pc2UgPSBwcm94eS5hdHRhY2goY29ubmVjdGlvbkNvbmZpZyk7XG4gICAgaWYgKHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpIHtcbiAgICAgIGxvZ0luZm8oJ2xhdW5jaFNjcmlwdDogJyArIHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpO1xuICAgICAgcHJveHkubGF1bmNoU2NyaXB0KHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRhY2hQcm9taXNlLnRoZW4oYXR0YWNoUmVzdWx0ID0+IHtcblxuICAgICAgbG9nSW5mbygnQXR0YWNoZWQgdG8gcHJvY2Vzcy4gQXR0YWNoIG1lc3NhZ2U6ICcgKyBhdHRhY2hSZXN1bHQpO1xuXG4gICAgICAvLyBzZXR1cCB3ZWIgc29ja2V0XG4gICAgICAvLyBUT0RPOiBBc3NpZ24gcmFuZG9tIHBvcnQgcmF0aGVyIHRoYW4gdXNpbmcgZml4ZWQgcG9ydC5cbiAgICAgIGNvbnN0IHdzUG9ydCA9IDIwMDA7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiB3c1BvcnR9KTtcbiAgICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlcjtcbiAgICAgIHNlcnZlci5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIGxvZ0Vycm9yKCdTZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2hlYWRlcnMnLCBoZWFkZXJzID0+IHtcbiAgICAgICAgbG9nKCdTZXJ2ZXIgaGVhZGVyczogJyArIGhlYWRlcnMpO1xuICAgICAgfSk7XG4gICAgICBzZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJTb2NrZXQgPT4ge1xuICAgICAgICBpZiAodGhpcy5fd2ViU29ja2V0KSB7XG4gICAgICAgICAgbG9nKCdBbHJlYWR5IGNvbm5lY3RlZCB0byB3ZWIgc29ja2V0LiBEaXNjYXJkaW5nIG5ldyBjb25uZWN0aW9uLicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZygnQ29ubmVjdGluZyB0byB3ZWIgc29ja2V0IGNsaWVudC4nKTtcbiAgICAgICAgdGhpcy5fd2ViU29ja2V0ID0gd2ViU29ja2V0O1xuICAgICAgICB3ZWJTb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9vblNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHdlYlNvY2tldC5vbignZXJyb3InLCB0aGlzLl9vblNvY2tldEVycm9yLmJpbmQodGhpcykpO1xuICAgICAgICB3ZWJTb2NrZXQub24oJ2Nsb3NlJywgdGhpcy5fb25Tb2NrZXRDbG9zZS5iaW5kKHRoaXMpKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSAnd3M9bG9jYWxob3N0OicgKyBTdHJpbmcod3NQb3J0KSArICcvJztcbiAgICAgIGxvZygnTGlzdGVuaW5nIGZvciBjb25uZWN0aW9uIGF0OiAnICsgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGwpKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgc2VydmVyIG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCB3ZWJTb2NrZXQgPSB0aGlzLl93ZWJTb2NrZXQ7XG4gICAgaWYgKHdlYlNvY2tldCAhPSBudWxsKSB7XG4gICAgICB3ZWJTb2NrZXQuc2VuZChcbiAgICAgICAgdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgICAgcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRQb3J0KHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICAgIG1lc3NhZ2UpKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdSZWNlaXZlZCBzZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyRW5kKCk6IHZvaWQge1xuICAgIGxvZygnU2VydmVyIG9ic2VydmVyYWJsZSBlbmRzLicpO1xuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UobWVzc2FnZTogTm90aWZpY2F0aW9uTWVzc2FnZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGluZm86ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSB3YXJuaW5nOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZhdGFsRXJyb3InOlxuICAgICAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBmYXRhbCBlcnJvcjogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2dFcnJvcignVW5rbm93biBtZXNzYWdlOiAnICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlTm90aWZpY2F0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIF9lbmRTZXNzaW9uKCkgbXVzdCBiZSBjYWxsZWQgZnJvbSBfaGFuZGxlTm90aWZpY2F0aW9uRW5kKClcbiAgICogc28gdGhhdCB3ZSBjYW4gZ3VhcmFudGVlIGFsbCBub3RpZmljYXRpb25zIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gICAqL1xuICBfaGFuZGxlTm90aWZpY2F0aW9uRW5kKCk6IHZvaWQge1xuICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlbmRzLicpO1xuICAgIHRoaXMuX2VuZFNlc3Npb24oKTtcbiAgfVxuXG4gIF9yZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmcocHJveHk6IEhodm1EZWJ1Z2dlclByb3h5U2VydmljZVR5cGUpOiB2b2lkIHtcbiAgICBjb25zdCBhcGkgPSBnZXRPdXRwdXRTZXJ2aWNlKCk7XG4gICAgaWYgKGFwaSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBvdXRwdXRXaW5kb3dNZXNzYWdlJCA9IHByb3h5LmdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKVxuICAgICAgICAubWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgIGNvbnN0IHNlcnZlck1lc3NhZ2UgPSB0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlcihcbiAgICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICAgIHJlbW90ZVVyaS5nZXRQb3J0KHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHNlcnZlck1lc3NhZ2UpO1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKG1lc3NhZ2VPYmogPT4gbWVzc2FnZU9iai5tZXRob2QgPT09ICdDb25zb2xlLm1lc3NhZ2VBZGRlZCcpXG4gICAgICAgIC5tYXAobWVzc2FnZU9iaiA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxldmVsOiBtZXNzYWdlT2JqLnBhcmFtcy5tZXNzYWdlLmxldmVsLFxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZU9iai5wYXJhbXMubWVzc2FnZS50ZXh0LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGFwaS5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKHtcbiAgICAgICAgc291cmNlOiAnaGh2bSBkZWJ1Z2dlcicsXG4gICAgICAgIG1lc3NhZ2VzOiBvdXRwdXRXaW5kb3dNZXNzYWdlJCxcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nRXJyb3IoJ0Nhbm5vdCBnZXQgb3V0cHV0IHdpbmRvdyBzZXJ2aWNlLicpO1xuICAgIH1cbiAgfVxuXG4gIF9lbmRTZXNzaW9uKCk6IHZvaWQge1xuICAgIGxvZygnRW5kaW5nIFNlc3Npb24nKTtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZygnUmVjaWV2ZWQgd2ViU29ja2V0IG1lc3NhZ2U6ICcgKyBtZXNzYWdlKTtcbiAgICBjb25zdCBwcm94eSA9IHRoaXMuX3Byb3h5O1xuICAgIGlmIChwcm94eSkge1xuICAgICAgcHJveHkuc2VuZENvbW1hbmQodHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyKG1lc3NhZ2UpKTtcbiAgICB9XG4gIH1cblxuICBfb25Tb2NrZXRFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignd2ViU29ja2V0IGVycm9yICcgKyBzdHJpbmdpZnlFcnJvcihlcnJvcikpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0Q2xvc2UoY29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgbG9nKCd3ZWJTb2NrZXQgQ2xvc2VkICcgKyBjb2RlKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIHdlYlNvY2tldCcpO1xuICAgICAgd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9zZXJ2ZXI7XG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBzZXJ2ZXInKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETzogTW92ZSB0aGlzIHRvIG51Y2xpZGUtY29tbW9ucy5cbmZ1bmN0aW9uIGlzVmFsaWRSZWdleCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgUmVnRXhwKHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19