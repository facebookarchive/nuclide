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

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _ObservableManager = require('./ObservableManager');

var log = _utils2['default'].log;
var logInfo = _utils2['default'].logInfo;
var logError = _utils2['default'].logError;
var setLogLevel = _utils2['default'].setLogLevel;

var featureConfig = require('../../nuclide-feature-config');

var _require = require('./ChromeMessageRemoting');

var translateMessageFromServer = _require.translateMessageFromServer;
var translateMessageToServer = _require.translateMessageToServer;

var remoteUri = require('../../nuclide-remote-uri');

var _require2 = require('atom');

var Disposable = _require2.Disposable;

var WebSocketServer = require('ws').Server;

var stringifyError = require('../../nuclide-commons').error.stringifyError;

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
    this._sessionEndCallback = null;
    this._observableManager = null;
    setLogLevel(getConfig().logLevel);
  }

  // TODO: Move this to nuclide-commons.

  _createClass(HhvmDebuggerInstance, [{
    key: 'getWebsocketAddress',
    value: _asyncToGenerator(function* () {
      var _this = this;

      logInfo('Connecting to: ' + this.getTargetUri());

      var _require3 = require('../../nuclide-client');

      var getServiceByNuclideUri = _require3.getServiceByNuclideUri;

      var service = getServiceByNuclideUri('HhvmDebuggerProxyService', this.getTargetUri());
      (0, _assert2['default'])(service);
      var proxy = new service.HhvmDebuggerProxyService();
      this._proxy = proxy;
      this._observableManager = new _ObservableManager.ObservableManager(proxy.getNotificationObservable(), proxy.getServerMessageObservable(), proxy.getOutputWindowObservable().map(function (message) {
        var serverMessage = translateMessageFromServer(remoteUri.getHostname(_this.getTargetUri()), remoteUri.getPort(_this.getTargetUri()), message);
        return JSON.parse(serverMessage);
      }), this._sendServerMessageToChromeUi.bind(this), this._endSession.bind(this));

      var config = getConfig();
      var sessionConfig = {
        xdebugPort: config.xdebugPort,
        targetUri: remoteUri.getPath(this.getTargetUri()),
        logLevel: config.logLevel,
        endDebugWhenNoRequests: false,
        phpRuntimePath: config.phpRuntimePath
      };
      logInfo('Connection config: ' + JSON.stringify(config));

      if (!isValidRegex(config.scriptRegex)) {
        // TODO: User facing error message?
        (0, _assert2['default'])(config.scriptRegex != null);
        logError('nuclide-debugger-hhvm config scriptRegex is not a valid regular expression: ' + config.scriptRegex);
      } else {
        sessionConfig.scriptRegex = config.scriptRegex;
      }

      if (!isValidRegex(config.idekeyRegex)) {
        // TODO: User facing error message?
        (0, _assert2['default'])(config.idekeyRegex != null);
        logError('nuclide-debugger-hhvm config idekeyRegex is not a valid regular expression: ' + config.idekeyRegex);
      } else {
        sessionConfig.idekeyRegex = config.idekeyRegex;
      }

      // Set config related to script launching.
      if (this._launchScriptPath != null) {
        (0, _assert2['default'])(config.xdebugLaunchingPort != null);
        sessionConfig.xdebugPort = config.xdebugLaunchingPort;
        sessionConfig.endDebugWhenNoRequests = true;
        sessionConfig.launchScriptPath = this._launchScriptPath;
      }

      var attachResult = yield proxy.debug(sessionConfig);
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
    key: '_sendServerMessageToChromeUi',
    value: function _sendServerMessageToChromeUi(message) {
      var webSocket = this._webSocket;
      if (webSocket != null) {
        webSocket.send(translateMessageFromServer(remoteUri.getHostname(this.getTargetUri()), remoteUri.getPort(this.getTargetUri()), message));
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
      var _this3 = this;

      if (this._proxy != null) {
        this._proxy.dispose().then(function () {
          if (_this3._observableManager != null) {
            _this3._observableManager.dispose();
            _this3._observableManager = null;
          }
        });
        this._proxy = null;
      }
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
})(_nuclideDebuggerAtom.DebuggerInstance);

exports.HhvmDebuggerInstance = HhvmDebuggerInstance;
function isValidRegex(value) {
  if (value == null) {
    return false;
  }
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }

  return true;
}
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQztBQUMxQixjQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztPQUNyQjtLQUNGOzs7U0FqTFUsb0JBQW9COzs7O0FBcUxqQyxTQUFTLFlBQVksQ0FBQyxLQUFjLEVBQVc7QUFDN0MsTUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxNQUFJO0FBQ0YsVUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ2YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJIaHZtRGVidWdnZXJJbnN0YW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB0eXBlIHtIaHZtRGVidWdnZXJTZXNzaW9uQ29uZmlnfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWhodm0tcHJveHknO1xuaW1wb3J0IHR5cGUge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQgdHlwZSB7XG4gIEhodm1EZWJ1Z2dlclByb3h5U2VydmljZSBhcyBIaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWhodm0tcHJveHkvbGliL0hodm1EZWJ1Z2dlclByb3h5U2VydmljZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7T2JzZXJ2YWJsZU1hbmFnZXJ9IGZyb20gJy4vT2JzZXJ2YWJsZU1hbmFnZXInO1xuXG5jb25zdCB7bG9nLCBsb2dJbmZvLCBsb2dFcnJvciwgc2V0TG9nTGV2ZWx9ID0gdXRpbHM7XG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZycpO1xuY29uc3Qge3RyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyLCB0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXJ9ID0gcmVxdWlyZSgnLi9DaHJvbWVNZXNzYWdlUmVtb3RpbmcnKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCB7c3RyaW5naWZ5RXJyb3J9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJykuZXJyb3I7XG5cbmZ1bmN0aW9uIGdldENvbmZpZygpOiBIaHZtRGVidWdnZXJTZXNzaW9uQ29uZmlnIHtcbiAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kZWJ1Z2dlci1oaHZtJyk6IGFueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBIaHZtRGVidWdnZXJJbnN0YW5jZSBleHRlbmRzIERlYnVnZ2VySW5zdGFuY2Uge1xuICBfcHJveHk6ID9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlO1xuICBfc2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfd2ViU29ja2V0OiA/V2ViU29ja2V0O1xuICBfbGF1bmNoU2NyaXB0UGF0aDogP3N0cmluZztcbiAgX3Nlc3Npb25FbmRDYWxsYmFjazogPygpID0+IHZvaWQ7XG4gIF9vYnNlcnZhYmxlTWFuYWdlcjogP09ic2VydmFibGVNYW5hZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBsYXVuY2hTY3JpcHRQYXRoOiA/c3RyaW5nKSB7XG4gICAgc3VwZXIocHJvY2Vzc0luZm8pO1xuICAgIHRoaXMuX2xhdW5jaFNjcmlwdFBhdGggPSBsYXVuY2hTY3JpcHRQYXRoO1xuICAgIHRoaXMuX3Byb3h5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYlNvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9vYnNlcnZhYmxlTWFuYWdlciA9IG51bGw7XG4gICAgc2V0TG9nTGV2ZWwoZ2V0Q29uZmlnKCkubG9nTGV2ZWwpO1xuICB9XG5cbiAgYXN5bmMgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxvZ0luZm8oJ0Nvbm5lY3RpbmcgdG86ICcgKyB0aGlzLmdldFRhcmdldFVyaSgpKTtcbiAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICAgIGNvbnN0IHNlcnZpY2UgPVxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJywgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIGNvbnN0IHByb3h5ID0gbmV3IHNlcnZpY2UuSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlKCk7XG4gICAgdGhpcy5fcHJveHkgPSBwcm94eTtcbiAgICB0aGlzLl9vYnNlcnZhYmxlTWFuYWdlciA9IG5ldyBPYnNlcnZhYmxlTWFuYWdlcihcbiAgICAgIHByb3h5LmdldE5vdGlmaWNhdGlvbk9ic2VydmFibGUoKSxcbiAgICAgIHByb3h5LmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCksXG4gICAgICBwcm94eS5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCkubWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICBjb25zdCBzZXJ2ZXJNZXNzYWdlID0gdHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIoXG4gICAgICAgICAgcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRQb3J0KHRoaXMuZ2V0VGFyZ2V0VXJpKCkpLFxuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHNlcnZlck1lc3NhZ2UpO1xuICAgICAgfSksXG4gICAgICB0aGlzLl9zZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWkuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2VuZFNlc3Npb24uYmluZCh0aGlzKSxcbiAgICApO1xuXG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3Qgc2Vzc2lvbkNvbmZpZzogSGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZyA9IHtcbiAgICAgIHhkZWJ1Z1BvcnQ6IGNvbmZpZy54ZGVidWdQb3J0LFxuICAgICAgdGFyZ2V0VXJpOiByZW1vdGVVcmkuZ2V0UGF0aCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgIGxvZ0xldmVsOiBjb25maWcubG9nTGV2ZWwsXG4gICAgICBlbmREZWJ1Z1doZW5Ob1JlcXVlc3RzOiBmYWxzZSxcbiAgICAgIHBocFJ1bnRpbWVQYXRoOiBjb25maWcucGhwUnVudGltZVBhdGgsXG4gICAgfTtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW9uIGNvbmZpZzogJyArIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLnNjcmlwdFJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGludmFyaWFudChjb25maWcuc2NyaXB0UmVnZXggIT0gbnVsbCk7XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBzY3JpcHRSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuc2NyaXB0UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXNzaW9uQ29uZmlnLnNjcmlwdFJlZ2V4ID0gY29uZmlnLnNjcmlwdFJlZ2V4O1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5pZGVrZXlSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBpbnZhcmlhbnQoY29uZmlnLmlkZWtleVJlZ2V4ICE9IG51bGwpO1xuICAgICAgbG9nRXJyb3IoJ251Y2xpZGUtZGVidWdnZXItaGh2bSBjb25maWcgaWRla2V5UmVnZXggaXMgbm90IGEgdmFsaWQgcmVndWxhciBleHByZXNzaW9uOiAnXG4gICAgICAgICsgY29uZmlnLmlkZWtleVJlZ2V4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2Vzc2lvbkNvbmZpZy5pZGVrZXlSZWdleCA9IGNvbmZpZy5pZGVrZXlSZWdleDtcbiAgICB9XG5cbiAgICAvLyBTZXQgY29uZmlnIHJlbGF0ZWQgdG8gc2NyaXB0IGxhdW5jaGluZy5cbiAgICBpZiAodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCAhPSBudWxsKSB7XG4gICAgICBpbnZhcmlhbnQoY29uZmlnLnhkZWJ1Z0xhdW5jaGluZ1BvcnQgIT0gbnVsbCk7XG4gICAgICBzZXNzaW9uQ29uZmlnLnhkZWJ1Z1BvcnQgPSBjb25maWcueGRlYnVnTGF1bmNoaW5nUG9ydDtcbiAgICAgIHNlc3Npb25Db25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cyA9IHRydWU7XG4gICAgICBzZXNzaW9uQ29uZmlnLmxhdW5jaFNjcmlwdFBhdGggPSB0aGlzLl9sYXVuY2hTY3JpcHRQYXRoO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGFjaFJlc3VsdCA9IGF3YWl0IHByb3h5LmRlYnVnKHNlc3Npb25Db25maWcpO1xuICAgIGxvZ0luZm8oJ0F0dGFjaGVkIHRvIHByb2Nlc3MuIEF0dGFjaCBtZXNzYWdlOiAnICsgYXR0YWNoUmVzdWx0KTtcblxuICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAvLyBUT0RPOiBBc3NpZ24gcmFuZG9tIHBvcnQgcmF0aGVyIHRoYW4gdXNpbmcgZml4ZWQgcG9ydC5cbiAgICBjb25zdCB3c1BvcnQgPSAyMDAwO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlcjtcbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgbG9nKCdTZXJ2ZXIgaGVhZGVyczogJyArIGhlYWRlcnMpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICBpZiAodGhpcy5fd2ViU29ja2V0KSB7XG4gICAgICAgIGxvZygnQWxyZWFkeSBjb25uZWN0ZWQgdG8gd2ViIHNvY2tldC4gRGlzY2FyZGluZyBuZXcgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2coJ0Nvbm5lY3RpbmcgdG8gd2ViIHNvY2tldCBjbGllbnQuJyk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICB3ZWJTb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9vblNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vblNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gJ3dzPWxvY2FsaG9zdDonICsgU3RyaW5nKHdzUG9ydCkgKyAnLyc7XG4gICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGwpKTtcbiAgfVxuXG4gIF9zZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWkobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fd2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQgIT0gbnVsbCkge1xuICAgICAgd2ViU29ja2V0LnNlbmQoXG4gICAgICAgIHRyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyKFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2coJ0VuZGluZyBTZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHdlYlNvY2tldCBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgcHJveHkgPSB0aGlzLl9wcm94eTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHByb3h5LnNlbmRDb21tYW5kKHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX29uU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ3dlYlNvY2tldCBlcnJvciAnICsgc3RyaW5naWZ5RXJyb3IoZXJyb3IpKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldENsb3NlKGNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxvZygnd2ViU29ja2V0IENsb3NlZCAnICsgY29kZSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9wcm94eSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9wcm94eS5kaXNwb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9vYnNlcnZhYmxlTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fb2JzZXJ2YWJsZU1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgICAgIHRoaXMuX29ic2VydmFibGVNYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcm94eSA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIHdlYlNvY2tldCcpO1xuICAgICAgd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9zZXJ2ZXI7XG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBzZXJ2ZXInKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETzogTW92ZSB0aGlzIHRvIG51Y2xpZGUtY29tbW9ucy5cbmZ1bmN0aW9uIGlzVmFsaWRSZWdleCh2YWx1ZTogP3N0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB0cnkge1xuICAgIFJlZ0V4cCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==