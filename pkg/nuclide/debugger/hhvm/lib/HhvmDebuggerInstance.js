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
        logLevel: config.logLevel,
        endDebugWhenNoRequests: config.endDebugWhenNoRequests
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
//# sourceMappingURL=data:application/json;base64,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Q0Y7OztTQXRQVSxvQkFBb0I7Ozs7QUEwUGpDLFNBQVMsWUFBWSxDQUFDLEtBQWEsRUFBVztBQUM1QyxNQUFJO0FBQ0YsVUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ2YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJIaHZtRGVidWdnZXJJbnN0YW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB0eXBlIHtDb25uZWN0aW9uQ29uZmlnfSBmcm9tICcuLi8uLi8uLi9kZWJ1Z2dlci1oaHZtLXByb3h5JztcbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9hdG9tJztcblxuaW1wb3J0IHR5cGUge0hodm1EZWJ1Z2dlclByb3h5U2VydmljZSBhcyBIaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlLH1cbiAgICBmcm9tICcuLi8uLi8uLi9kZWJ1Z2dlci1oaHZtLXByb3h5L2xpYi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHtnZXRPdXRwdXRTZXJ2aWNlfSBmcm9tICcuL091dHB1dFNlcnZpY2VNYW5hZ2VyJztcblxuY29uc3Qge2xvZywgbG9nSW5mbywgbG9nRXJyb3IsIHNldExvZ0xldmVsfSA9IHV0aWxzO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCB7dHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIsIHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcn0gPSByZXF1aXJlKCcuL0Nocm9tZU1lc3NhZ2VSZW1vdGluZycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCB7c3RyaW5naWZ5RXJyb3J9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpLmVycm9yO1xuXG50eXBlIE5vdGlmaWNhdGlvbk1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWxFcnJvcic7XG4gIG1lc3NhZ2U6IHN0cmluZztcbn07XG5cbnR5cGUgSGh2bURlYnVnZ2VyQ29uZmlnID0ge1xuICBzY3JpcHRSZWdleDogc3RyaW5nO1xuICBpZGVrZXlSZWdleDogc3RyaW5nO1xuICB4ZGVidWdQb3J0OiBudW1iZXI7XG4gIGVuZERlYnVnV2hlbk5vUmVxdWVzdHM6IGJvb2xlYW47XG4gIGxvZ0xldmVsOiBzdHJpbmc7XG59O1xuXG5mdW5jdGlvbiBnZXRDb25maWcoKTogSGh2bURlYnVnZ2VyQ29uZmlnIHtcbiAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kZWJ1Z2dlci1oaHZtJyk6IGFueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBIaHZtRGVidWdnZXJJbnN0YW5jZSBleHRlbmRzIERlYnVnZ2VySW5zdGFuY2Uge1xuICBfcHJveHk6ID9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlO1xuICBfc2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfd2ViU29ja2V0OiA/V2ViU29ja2V0O1xuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2xhdW5jaFNjcmlwdFBhdGg6ID9zdHJpbmc7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBsYXVuY2hTY3JpcHRQYXRoOiA/c3RyaW5nKSB7XG4gICAgc3VwZXIocHJvY2Vzc0luZm8pO1xuICAgIHRoaXMuX2xhdW5jaFNjcmlwdFBhdGggPSBsYXVuY2hTY3JpcHRQYXRoO1xuICAgIHRoaXMuX3Byb3h5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgc2V0TG9nTGV2ZWwoZ2V0Q29uZmlnKCkubG9nTGV2ZWwpO1xuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxvZ0luZm8oJ0Nvbm5lY3RpbmcgdG86ICcgKyB0aGlzLmdldFRhcmdldFVyaSgpKTtcbiAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQnKTtcbiAgICBjb25zdCBzZXJ2aWNlID1cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hodm1EZWJ1Z2dlclByb3h5U2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICBjb25zdCBwcm94eSA9IG5ldyBzZXJ2aWNlLkhodm1EZWJ1Z2dlclByb3h5U2VydmljZSgpO1xuICAgIHRoaXMuX3Byb3h5ID0gcHJveHk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb3h5KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkuZ2V0Tm90aWZpY2F0aW9uT2JzZXJ2YWJsZSgpLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbk1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVOb3RpZmljYXRpb25FbmQuYmluZCh0aGlzKSxcbiAgICApKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkuZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKS5zdWJzY3JpYmUoXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFcnJvci5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlU2VydmVyRW5kLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLl9yZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmcocHJveHkpO1xuXG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZzogQ29ubmVjdGlvbkNvbmZpZyA9IHtcbiAgICAgIHhkZWJ1Z1BvcnQ6IGNvbmZpZy54ZGVidWdQb3J0LFxuICAgICAgdGFyZ2V0VXJpOiByZW1vdGVVcmkuZ2V0UGF0aCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgIGxvZ0xldmVsOiBjb25maWcubG9nTGV2ZWwsXG4gICAgICBlbmREZWJ1Z1doZW5Ob1JlcXVlc3RzOiBjb25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cyxcbiAgICB9O1xuICAgIGxvZ0luZm8oJ0Nvbm5lY3Rpb24gY29uZmlnOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XG5cbiAgICBpZiAoIWlzVmFsaWRSZWdleChjb25maWcuc2NyaXB0UmVnZXgpKSB7XG4gICAgICAvLyBUT0RPOiBVc2VyIGZhY2luZyBlcnJvciBtZXNzYWdlP1xuICAgICAgbG9nRXJyb3IoJ251Y2xpZGUtZGVidWdnZXItaGh2bSBjb25maWcgc2NyaXB0UmVnZXggaXMgbm90IGEgdmFsaWQgcmVndWxhciBleHByZXNzaW9uOiAnXG4gICAgICAgICsgY29uZmlnLnNjcmlwdFJlZ2V4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29ubmVjdGlvbkNvbmZpZy5zY3JpcHRSZWdleCA9IGNvbmZpZy5zY3JpcHRSZWdleDtcbiAgICB9XG5cbiAgICBpZiAoIWlzVmFsaWRSZWdleChjb25maWcuaWRla2V5UmVnZXgpKSB7XG4gICAgICAvLyBUT0RPOiBVc2VyIGZhY2luZyBlcnJvciBtZXNzYWdlP1xuICAgICAgbG9nRXJyb3IoJ251Y2xpZGUtZGVidWdnZXItaGh2bSBjb25maWcgaWRla2V5UmVnZXggaXMgbm90IGEgdmFsaWQgcmVndWxhciBleHByZXNzaW9uOiAnXG4gICAgICAgICsgY29uZmlnLmlkZWtleVJlZ2V4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29ubmVjdGlvbkNvbmZpZy5pZGVrZXlSZWdleCA9IGNvbmZpZy5pZGVrZXlSZWdleDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCkge1xuICAgICAgY29ubmVjdGlvbkNvbmZpZy5lbmREZWJ1Z1doZW5Ob1JlcXVlc3RzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBhdHRhY2hQcm9taXNlID0gcHJveHkuYXR0YWNoKGNvbm5lY3Rpb25Db25maWcpO1xuICAgIGlmICh0aGlzLl9sYXVuY2hTY3JpcHRQYXRoKSB7XG4gICAgICBsb2dJbmZvKCdsYXVuY2hTY3JpcHQ6ICcgKyB0aGlzLl9sYXVuY2hTY3JpcHRQYXRoKTtcbiAgICAgIHByb3h5LmxhdW5jaFNjcmlwdCh0aGlzLl9sYXVuY2hTY3JpcHRQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0YWNoUHJvbWlzZS50aGVuKGF0dGFjaFJlc3VsdCA9PiB7XG5cbiAgICAgIGxvZ0luZm8oJ0F0dGFjaGVkIHRvIHByb2Nlc3MuIEF0dGFjaCBtZXNzYWdlOiAnICsgYXR0YWNoUmVzdWx0KTtcblxuICAgICAgLy8gc2V0dXAgd2ViIHNvY2tldFxuICAgICAgLy8gVE9ETzogQXNzaWduIHJhbmRvbSBwb3J0IHJhdGhlciB0aGFuIHVzaW5nIGZpeGVkIHBvcnQuXG4gICAgICBjb25zdCB3c1BvcnQgPSAyMDAwO1xuICAgICAgY29uc3Qgc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICBsb2dFcnJvcignU2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgc2VydmVyLm9uKCdoZWFkZXJzJywgaGVhZGVycyA9PiB7XG4gICAgICAgIGxvZygnU2VydmVyIGhlYWRlcnM6ICcgKyBoZWFkZXJzKTtcbiAgICAgIH0pO1xuICAgICAgc2VydmVyLm9uKCdjb25uZWN0aW9uJywgd2ViU29ja2V0ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3dlYlNvY2tldCkge1xuICAgICAgICAgIGxvZygnQWxyZWFkeSBjb25uZWN0ZWQgdG8gd2ViIHNvY2tldC4gRGlzY2FyZGluZyBuZXcgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsb2coJ0Nvbm5lY3RpbmcgdG8gd2ViIHNvY2tldCBjbGllbnQuJyk7XG4gICAgICAgIHRoaXMuX3dlYlNvY2tldCA9IHdlYlNvY2tldDtcbiAgICAgICAgd2ViU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5fb25Tb2NrZXRNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB3ZWJTb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgd2ViU29ja2V0Lm9uKCdjbG9zZScsIHRoaXMuX29uU29ja2V0Q2xvc2UuYmluZCh0aGlzKSk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gJ3dzPWxvY2FsaG9zdDonICsgU3RyaW5nKHdzUG9ydCkgKyAnLyc7XG4gICAgICBsb2coJ0xpc3RlbmluZyBmb3IgY29ubmVjdGlvbiBhdDogJyArIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsKSk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHNlcnZlciBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fd2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQgIT0gbnVsbCkge1xuICAgICAgd2ViU29ja2V0LnNlbmQoXG4gICAgICAgIHRyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyKFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICBtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignUmVjZWl2ZWQgc2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ1NlcnZlciBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgfVxuXG4gIF9oYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlKG1lc3NhZ2U6IE5vdGlmaWNhdGlvbk1lc3NhZ2UpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBpbmZvOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgd2FybmluZzogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdmYXRhbEVycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZmF0YWwgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nRXJyb3IoJ1Vua25vd24gbWVzc2FnZTogJyArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBfZW5kU2Vzc2lvbigpIG11c3QgYmUgY2FsbGVkIGZyb20gX2hhbmRsZU5vdGlmaWNhdGlvbkVuZCgpXG4gICAqIHNvIHRoYXQgd2UgY2FuIGd1YXJhbnRlZSBhbGwgbm90aWZpY2F0aW9ucyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICAgKi9cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgICB0aGlzLl9lbmRTZXNzaW9uKCk7XG4gIH1cblxuICBfcmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nKHByb3h5OiBIaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlKTogdm9pZCB7XG4gICAgY29uc3QgYXBpID0gZ2V0T3V0cHV0U2VydmljZSgpO1xuICAgIGlmIChhcGkgIT0gbnVsbCkge1xuICAgICAgY29uc3Qgb3V0cHV0V2luZG93TWVzc2FnZSQgPSBwcm94eS5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKClcbiAgICAgICAgLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICBjb25zdCBzZXJ2ZXJNZXNzYWdlID0gdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgICAgICByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXJ2ZXJNZXNzYWdlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcihtZXNzYWdlT2JqID0+IG1lc3NhZ2VPYmoubWV0aG9kID09PSAnQ29uc29sZS5tZXNzYWdlQWRkZWQnKVxuICAgICAgICAubWFwKG1lc3NhZ2VPYmogPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZXZlbDogbWVzc2FnZU9iai5wYXJhbXMubWVzc2FnZS5sZXZlbCxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2VPYmoucGFyYW1zLm1lc3NhZ2UudGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICAgIHNvdXJjZTogJ2hodm0gZGVidWdnZXInLFxuICAgICAgICBtZXNzYWdlczogb3V0cHV0V2luZG93TWVzc2FnZSQsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKCdDYW5ub3QgZ2V0IG91dHB1dCB3aW5kb3cgc2VydmljZS4nKTtcbiAgICB9XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2coJ0VuZGluZyBTZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHdlYlNvY2tldCBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgcHJveHkgPSB0aGlzLl9wcm94eTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHByb3h5LnNlbmRDb21tYW5kKHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX29uU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ3dlYlNvY2tldCBlcnJvciAnICsgc3RyaW5naWZ5RXJyb3IoZXJyb3IpKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldENsb3NlKGNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxvZygnd2ViU29ja2V0IENsb3NlZCAnICsgY29kZSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBjb25zdCB3ZWJTb2NrZXQgPSB0aGlzLl93ZWJTb2NrZXQ7XG4gICAgaWYgKHdlYlNvY2tldCkge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyB3ZWJTb2NrZXQnKTtcbiAgICAgIHdlYlNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5fd2ViU29ja2V0ID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gdGhpcy5fc2VydmVyO1xuICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3Npbmcgc2VydmVyJyk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbi8vIFRPRE86IE1vdmUgdGhpcyB0byBudWNsaWRlLWNvbW1vbnMuXG5mdW5jdGlvbiBpc1ZhbGlkUmVnZXgodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIFJlZ0V4cCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==