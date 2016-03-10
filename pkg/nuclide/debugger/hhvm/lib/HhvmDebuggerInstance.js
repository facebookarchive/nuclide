Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
    value: _asyncToGenerator(function* () {
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

      var attachResult = yield proxy.attach(connectionConfig);
      logInfo('Attached to process. Attach message: ' + attachResult);

      // setup web socket
      // TODO: Assign random port rather than using fixed port.
      var wsPort = 2000;
      var server = new WebSocketServer({ port: wsPort });
      this._server = server;
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

        if (_this._launchScriptPath) {
          logInfo('launchScript: ' + _this._launchScriptPath);
          proxy.launchScript(_this._launchScriptPath);
        }
      });

      var result = 'ws=localhost:' + String(wsPort) + '/';
      log('Listening for connection at: ' + result);
      return result;
    })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhodm1EZWJ1Z2dlckluc3RhbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXa0IsU0FBUzs7OztzQkFPTCxRQUFROzs7O29CQUNDLFlBQVk7O29DQUNaLHdCQUF3Qjs7SUFFaEQsR0FBRyxzQkFBSCxHQUFHO0lBQUUsT0FBTyxzQkFBUCxPQUFPO0lBQUUsUUFBUSxzQkFBUixRQUFRO0lBQUUsV0FBVyxzQkFBWCxXQUFXOztBQUMxQyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7ZUFDTSxPQUFPLENBQUMseUJBQXlCLENBQUM7O0lBQTFGLDBCQUEwQixZQUExQiwwQkFBMEI7SUFBRSx3QkFBd0IsWUFBeEIsd0JBQXdCOztBQUMzRCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7Z0JBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsYUFBVixVQUFVOztBQUNqQixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDOztJQUN0QyxjQUFjLEdBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxDQUFuRCxjQUFjOztBQWVyQixTQUFTLFNBQVMsR0FBdUI7QUFDdkMsU0FBUSxhQUFhLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQU87Q0FDMUQ7O0lBRVksb0JBQW9CO1lBQXBCLG9CQUFvQjs7QUFRcEIsV0FSQSxvQkFBb0IsQ0FRbkIsV0FBZ0MsRUFBRSxnQkFBeUIsRUFBRTswQkFSOUQsb0JBQW9COztBQVM3QiwrQkFUUyxvQkFBb0IsNkNBU3ZCLFdBQVcsRUFBRTtBQUNuQixRQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7QUFDMUMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFD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QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiIiwiZmlsZSI6Ikhodm1EZWJ1Z2dlckluc3RhbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHR5cGUge0Nvbm5lY3Rpb25Db25maWd9IGZyb20gJy4uLy4uLy4uL2RlYnVnZ2VyLWhodm0tcHJveHknO1xuaW1wb3J0IHR5cGUge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuXG5pbXBvcnQgdHlwZSB7SGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlIGFzIEhodm1EZWJ1Z2dlclByb3h5U2VydmljZVR5cGUsfVxuICAgIGZyb20gJy4uLy4uLy4uL2RlYnVnZ2VyLWhodm0tcHJveHkvbGliL0hodm1EZWJ1Z2dlclByb3h5U2VydmljZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi4vLi4vYXRvbSc7XG5pbXBvcnQge2dldE91dHB1dFNlcnZpY2V9IGZyb20gJy4vT3V0cHV0U2VydmljZU1hbmFnZXInO1xuXG5jb25zdCB7bG9nLCBsb2dJbmZvLCBsb2dFcnJvciwgc2V0TG9nTGV2ZWx9ID0gdXRpbHM7XG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vLi4vZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IHt0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlciwgdHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyfSA9IHJlcXVpcmUoJy4vQ2hyb21lTWVzc2FnZVJlbW90aW5nJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi8uLi9yZW1vdGUtdXJpJyk7XG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXIgPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcbmNvbnN0IHtzdHJpbmdpZnlFcnJvcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJykuZXJyb3I7XG5cbnR5cGUgTm90aWZpY2F0aW9uTWVzc2FnZSA9IHtcbiAgdHlwZTogJ2luZm8nIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJyB8ICdmYXRhbEVycm9yJztcbiAgbWVzc2FnZTogc3RyaW5nO1xufTtcblxudHlwZSBIaHZtRGVidWdnZXJDb25maWcgPSB7XG4gIHNjcmlwdFJlZ2V4OiBzdHJpbmc7XG4gIGlkZWtleVJlZ2V4OiBzdHJpbmc7XG4gIHhkZWJ1Z1BvcnQ6IG51bWJlcjtcbiAgZW5kRGVidWdXaGVuTm9SZXF1ZXN0czogYm9vbGVhbjtcbiAgbG9nTGV2ZWw6IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIGdldENvbmZpZygpOiBIaHZtRGVidWdnZXJDb25maWcge1xuICByZXR1cm4gKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWRlYnVnZ2VyLWhodm0nKTogYW55KTtcbn1cblxuZXhwb3J0IGNsYXNzIEhodm1EZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9wcm94eTogP0hodm1EZWJ1Z2dlclByb3h5U2VydmljZVR5cGU7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF93ZWJTb2NrZXQ6ID9XZWJTb2NrZXQ7XG4gIF9kaXNwb3NhYmxlczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbGF1bmNoU2NyaXB0UGF0aDogP3N0cmluZztcbiAgX3Nlc3Npb25FbmRDYWxsYmFjazogPygpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8sIGxhdW5jaFNjcmlwdFBhdGg6ID9zdHJpbmcpIHtcbiAgICBzdXBlcihwcm9jZXNzSW5mbyk7XG4gICAgdGhpcy5fbGF1bmNoU2NyaXB0UGF0aCA9IGxhdW5jaFNjcmlwdFBhdGg7XG4gICAgdGhpcy5fcHJveHkgPSBudWxsO1xuICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gICAgdGhpcy5fd2ViU29ja2V0ID0gbnVsbDtcbiAgICBjb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGw7XG5cbiAgICBzZXRMb2dMZXZlbChnZXRDb25maWcoKS5sb2dMZXZlbCk7XG4gIH1cblxuICBhc3luYyBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbG9nSW5mbygnQ29ubmVjdGluZyB0bzogJyArIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NsaWVudCcpO1xuICAgIGNvbnN0IHNlcnZpY2UgPVxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJywgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IHByb3h5ID0gbmV3IHNlcnZpY2UuSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlKCk7XG4gICAgdGhpcy5fcHJveHkgPSBwcm94eTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm94eS5nZXROb3RpZmljYXRpb25PYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uRXJyb3IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbkVuZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm94eS5nZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlck1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlckVycm9yLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFbmQuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuX3JlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZyhwcm94eSk7XG5cbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgICBjb25zdCBjb25uZWN0aW9uQ29uZmlnOiBDb25uZWN0aW9uQ29uZmlnID0ge1xuICAgICAgeGRlYnVnUG9ydDogY29uZmlnLnhkZWJ1Z1BvcnQsXG4gICAgICB0YXJnZXRVcmk6IHJlbW90ZVVyaS5nZXRQYXRoKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgbG9nTGV2ZWw6IGNvbmZpZy5sb2dMZXZlbCxcbiAgICAgIGVuZERlYnVnV2hlbk5vUmVxdWVzdHM6IGNvbmZpZy5lbmREZWJ1Z1doZW5Ob1JlcXVlc3RzLFxuICAgIH07XG4gICAgbG9nSW5mbygnQ29ubmVjdGlvbiBjb25maWc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25maWcpKTtcblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5zY3JpcHRSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBzY3JpcHRSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuc2NyaXB0UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25uZWN0aW9uQ29uZmlnLnNjcmlwdFJlZ2V4ID0gY29uZmlnLnNjcmlwdFJlZ2V4O1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5pZGVrZXlSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBpZGVrZXlSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuaWRla2V5UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25uZWN0aW9uQ29uZmlnLmlkZWtleVJlZ2V4ID0gY29uZmlnLmlkZWtleVJlZ2V4O1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGFjaFJlc3VsdCA9IGF3YWl0IHByb3h5LmF0dGFjaChjb25uZWN0aW9uQ29uZmlnKTtcbiAgICBsb2dJbmZvKCdBdHRhY2hlZCB0byBwcm9jZXNzLiBBdHRhY2ggbWVzc2FnZTogJyArIGF0dGFjaFJlc3VsdCk7XG5cbiAgICAvLyBzZXR1cCB3ZWIgc29ja2V0XG4gICAgLy8gVE9ETzogQXNzaWduIHJhbmRvbSBwb3J0IHJhdGhlciB0aGFuIHVzaW5nIGZpeGVkIHBvcnQuXG4gICAgY29uc3Qgd3NQb3J0ID0gMjAwMDtcbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiB3c1BvcnR9KTtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGxvZ0Vycm9yKCdTZXJ2ZXIgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgICBzZXJ2ZXIub24oJ2hlYWRlcnMnLCBoZWFkZXJzID0+IHtcbiAgICAgIGxvZygnU2VydmVyIGhlYWRlcnM6ICcgKyBoZWFkZXJzKTtcbiAgICB9KTtcbiAgICBzZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJTb2NrZXQgPT4ge1xuICAgICAgaWYgKHRoaXMuX3dlYlNvY2tldCkge1xuICAgICAgICBsb2coJ0FscmVhZHkgY29ubmVjdGVkIHRvIHdlYiBzb2NrZXQuIERpc2NhcmRpbmcgbmV3IGNvbm5lY3Rpb24uJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9nKCdDb25uZWN0aW5nIHRvIHdlYiBzb2NrZXQgY2xpZW50LicpO1xuICAgICAgdGhpcy5fd2ViU29ja2V0ID0gd2ViU29ja2V0O1xuICAgICAgd2ViU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5fb25Tb2NrZXRNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgd2ViU29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Nsb3NlJywgdGhpcy5fb25Tb2NrZXRDbG9zZS5iaW5kKHRoaXMpKTtcblxuICAgICAgaWYgKHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpIHtcbiAgICAgICAgbG9nSW5mbygnbGF1bmNoU2NyaXB0OiAnICsgdGhpcy5fbGF1bmNoU2NyaXB0UGF0aCk7XG4gICAgICAgIHByb3h5LmxhdW5jaFNjcmlwdCh0aGlzLl9sYXVuY2hTY3JpcHRQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9ICd3cz1sb2NhbGhvc3Q6JyArIFN0cmluZyh3c1BvcnQpICsgJy8nO1xuICAgIGxvZygnTGlzdGVuaW5nIGZvciBjb25uZWN0aW9uIGF0OiAnICsgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsKSk7XG4gIH1cblxuICBfaGFuZGxlU2VydmVyTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHNlcnZlciBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fd2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQgIT0gbnVsbCkge1xuICAgICAgd2ViU29ja2V0LnNlbmQoXG4gICAgICAgIHRyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyKFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICBtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignUmVjZWl2ZWQgc2VydmVyIGVycm9yOiAnICsgZXJyb3IpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlckVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ1NlcnZlciBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgfVxuXG4gIF9oYW5kbGVOb3RpZmljYXRpb25NZXNzYWdlKG1lc3NhZ2U6IE5vdGlmaWNhdGlvbk1lc3NhZ2UpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgIGxvZygnTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBpbmZvOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgd2FybmluZzogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVycm9yOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdmYXRhbEVycm9yJzpcbiAgICAgICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZmF0YWwgZXJyb3I6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nRXJyb3IoJ1Vua25vd24gbWVzc2FnZTogJyArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVycm9yKGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBfZW5kU2Vzc2lvbigpIG11c3QgYmUgY2FsbGVkIGZyb20gX2hhbmRsZU5vdGlmaWNhdGlvbkVuZCgpXG4gICAqIHNvIHRoYXQgd2UgY2FuIGd1YXJhbnRlZSBhbGwgbm90aWZpY2F0aW9ucyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICAgKi9cbiAgX2hhbmRsZU5vdGlmaWNhdGlvbkVuZCgpOiB2b2lkIHtcbiAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZW5kcy4nKTtcbiAgICB0aGlzLl9lbmRTZXNzaW9uKCk7XG4gIH1cblxuICBfcmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nKHByb3h5OiBIaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlKTogdm9pZCB7XG4gICAgY29uc3QgYXBpID0gZ2V0T3V0cHV0U2VydmljZSgpO1xuICAgIGlmIChhcGkgIT0gbnVsbCkge1xuICAgICAgY29uc3Qgb3V0cHV0V2luZG93TWVzc2FnZSQgPSBwcm94eS5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKClcbiAgICAgICAgLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgICBjb25zdCBzZXJ2ZXJNZXNzYWdlID0gdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgICAgICByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXJ2ZXJNZXNzYWdlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcihtZXNzYWdlT2JqID0+IG1lc3NhZ2VPYmoubWV0aG9kID09PSAnQ29uc29sZS5tZXNzYWdlQWRkZWQnKVxuICAgICAgICAubWFwKG1lc3NhZ2VPYmogPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZXZlbDogbWVzc2FnZU9iai5wYXJhbXMubWVzc2FnZS5sZXZlbCxcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2VPYmoucGFyYW1zLm1lc3NhZ2UudGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICAgIHNvdXJjZTogJ2hodm0gZGVidWdnZXInLFxuICAgICAgICBtZXNzYWdlczogb3V0cHV0V2luZG93TWVzc2FnZSQsXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKCdDYW5ub3QgZ2V0IG91dHB1dCB3aW5kb3cgc2VydmljZS4nKTtcbiAgICB9XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2coJ0VuZGluZyBTZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHdlYlNvY2tldCBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgcHJveHkgPSB0aGlzLl9wcm94eTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHByb3h5LnNlbmRDb21tYW5kKHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX29uU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ3dlYlNvY2tldCBlcnJvciAnICsgc3RyaW5naWZ5RXJyb3IoZXJyb3IpKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldENsb3NlKGNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxvZygnd2ViU29ja2V0IENsb3NlZCAnICsgY29kZSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBjb25zdCB3ZWJTb2NrZXQgPSB0aGlzLl93ZWJTb2NrZXQ7XG4gICAgaWYgKHdlYlNvY2tldCkge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyB3ZWJTb2NrZXQnKTtcbiAgICAgIHdlYlNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5fd2ViU29ja2V0ID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gdGhpcy5fc2VydmVyO1xuICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3Npbmcgc2VydmVyJyk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbi8vIFRPRE86IE1vdmUgdGhpcyB0byBudWNsaWRlLWNvbW1vbnMuXG5mdW5jdGlvbiBpc1ZhbGlkUmVnZXgodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIFJlZ0V4cCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==