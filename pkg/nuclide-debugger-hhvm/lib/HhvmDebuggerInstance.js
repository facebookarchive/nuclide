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
        xdebugAttachPort: config.xdebugAttachPort,
        xdebugLaunchingPort: config.xdebugLaunchingPort,
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
        sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
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
//# sourceMappingURL=data:application/json;base64,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LFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDMUIsY0FBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDckI7S0FDRjs7O1NBbExVLG9CQUFvQjs7OztBQXNMakMsU0FBUyxZQUFZLENBQUMsS0FBYyxFQUFXO0FBQzdDLE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsTUFBSTtBQUNGLFVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNmLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiSGh2bURlYnVnZ2VySW5zdGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7SGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1oaHZtLXByb3h5JztcbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IHR5cGUge1xuICBIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UgYXMgSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1oaHZtLXByb3h5L2xpYi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQge09ic2VydmFibGVNYW5hZ2VyfSBmcm9tICcuL09ic2VydmFibGVNYW5hZ2VyJztcblxuY29uc3Qge2xvZywgbG9nSW5mbywgbG9nRXJyb3IsIHNldExvZ0xldmVsfSA9IHV0aWxzO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IHt0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlciwgdHJhbnNsYXRlTWVzc2FnZVRvU2VydmVyfSA9IHJlcXVpcmUoJy4vQ2hyb21lTWVzc2FnZVJlbW90aW5nJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3Qge3N0cmluZ2lmeUVycm9yfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpLmVycm9yO1xuXG5mdW5jdGlvbiBnZXRDb25maWcoKTogSGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZyB7XG4gIHJldHVybiAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZGVidWdnZXItaGh2bScpOiBhbnkpO1xufVxuXG5leHBvcnQgY2xhc3MgSGh2bURlYnVnZ2VySW5zdGFuY2UgZXh0ZW5kcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX3Byb3h5OiA/SGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZTtcbiAgX3NlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX3dlYlNvY2tldDogP1dlYlNvY2tldDtcbiAgX2xhdW5jaFNjcmlwdFBhdGg6ID9zdHJpbmc7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuICBfb2JzZXJ2YWJsZU1hbmFnZXI6ID9PYnNlcnZhYmxlTWFuYWdlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbywgbGF1bmNoU2NyaXB0UGF0aDogP3N0cmluZykge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9sYXVuY2hTY3JpcHRQYXRoID0gbGF1bmNoU2NyaXB0UGF0aDtcbiAgICB0aGlzLl9wcm94eSA9IG51bGw7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5fb2JzZXJ2YWJsZU1hbmFnZXIgPSBudWxsO1xuICAgIHNldExvZ0xldmVsKGdldENvbmZpZygpLmxvZ0xldmVsKTtcbiAgfVxuXG4gIGFzeW5jIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW5nIHRvOiAnICsgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jbGllbnQnKTtcbiAgICBjb25zdCBzZXJ2aWNlID1cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hodm1EZWJ1Z2dlclByb3h5U2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICBjb25zdCBwcm94eSA9IG5ldyBzZXJ2aWNlLkhodm1EZWJ1Z2dlclByb3h5U2VydmljZSgpO1xuICAgIHRoaXMuX3Byb3h5ID0gcHJveHk7XG4gICAgdGhpcy5fb2JzZXJ2YWJsZU1hbmFnZXIgPSBuZXcgT2JzZXJ2YWJsZU1hbmFnZXIoXG4gICAgICBwcm94eS5nZXROb3RpZmljYXRpb25PYnNlcnZhYmxlKCksXG4gICAgICBwcm94eS5nZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpLFxuICAgICAgcHJveHkuZ2V0T3V0cHV0V2luZG93T2JzZXJ2YWJsZSgpLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyTWVzc2FnZSA9IHRyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyKFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXJ2ZXJNZXNzYWdlKTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5fc2VuZFNlcnZlck1lc3NhZ2VUb0Nocm9tZVVpLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9lbmRTZXNzaW9uLmJpbmQodGhpcyksXG4gICAgKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIGNvbnN0IHNlc3Npb25Db25maWc6IEhodm1EZWJ1Z2dlclNlc3Npb25Db25maWcgPSB7XG4gICAgICB4ZGVidWdBdHRhY2hQb3J0OiBjb25maWcueGRlYnVnQXR0YWNoUG9ydCxcbiAgICAgIHhkZWJ1Z0xhdW5jaGluZ1BvcnQ6IGNvbmZpZy54ZGVidWdMYXVuY2hpbmdQb3J0LFxuICAgICAgdGFyZ2V0VXJpOiByZW1vdGVVcmkuZ2V0UGF0aCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgIGxvZ0xldmVsOiBjb25maWcubG9nTGV2ZWwsXG4gICAgICBlbmREZWJ1Z1doZW5Ob1JlcXVlc3RzOiBmYWxzZSxcbiAgICAgIHBocFJ1bnRpbWVQYXRoOiBjb25maWcucGhwUnVudGltZVBhdGgsXG4gICAgfTtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW9uIGNvbmZpZzogJyArIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLnNjcmlwdFJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGludmFyaWFudChjb25maWcuc2NyaXB0UmVnZXggIT0gbnVsbCk7XG4gICAgICBsb2dFcnJvcignbnVjbGlkZS1kZWJ1Z2dlci1oaHZtIGNvbmZpZyBzY3JpcHRSZWdleCBpcyBub3QgYSB2YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICdcbiAgICAgICAgKyBjb25maWcuc2NyaXB0UmVnZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXNzaW9uQ29uZmlnLnNjcmlwdFJlZ2V4ID0gY29uZmlnLnNjcmlwdFJlZ2V4O1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFJlZ2V4KGNvbmZpZy5pZGVrZXlSZWdleCkpIHtcbiAgICAgIC8vIFRPRE86IFVzZXIgZmFjaW5nIGVycm9yIG1lc3NhZ2U/XG4gICAgICBpbnZhcmlhbnQoY29uZmlnLmlkZWtleVJlZ2V4ICE9IG51bGwpO1xuICAgICAgbG9nRXJyb3IoJ251Y2xpZGUtZGVidWdnZXItaGh2bSBjb25maWcgaWRla2V5UmVnZXggaXMgbm90IGEgdmFsaWQgcmVndWxhciBleHByZXNzaW9uOiAnXG4gICAgICAgICsgY29uZmlnLmlkZWtleVJlZ2V4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2Vzc2lvbkNvbmZpZy5pZGVrZXlSZWdleCA9IGNvbmZpZy5pZGVrZXlSZWdleDtcbiAgICB9XG5cbiAgICAvLyBTZXQgY29uZmlnIHJlbGF0ZWQgdG8gc2NyaXB0IGxhdW5jaGluZy5cbiAgICBpZiAodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCAhPSBudWxsKSB7XG4gICAgICBpbnZhcmlhbnQoY29uZmlnLnhkZWJ1Z0xhdW5jaGluZ1BvcnQgIT0gbnVsbCk7XG4gICAgICBzZXNzaW9uQ29uZmlnLnhkZWJ1Z0F0dGFjaFBvcnQgPSBjb25maWcueGRlYnVnTGF1bmNoaW5nUG9ydDtcbiAgICAgIHNlc3Npb25Db25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cyA9IHRydWU7XG4gICAgICBzZXNzaW9uQ29uZmlnLmxhdW5jaFNjcmlwdFBhdGggPSB0aGlzLl9sYXVuY2hTY3JpcHRQYXRoO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGFjaFJlc3VsdCA9IGF3YWl0IHByb3h5LmRlYnVnKHNlc3Npb25Db25maWcpO1xuICAgIGxvZ0luZm8oJ0F0dGFjaGVkIHRvIHByb2Nlc3MuIEF0dGFjaCBtZXNzYWdlOiAnICsgYXR0YWNoUmVzdWx0KTtcblxuICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAvLyBUT0RPOiBBc3NpZ24gcmFuZG9tIHBvcnQgcmF0aGVyIHRoYW4gdXNpbmcgZml4ZWQgcG9ydC5cbiAgICBjb25zdCB3c1BvcnQgPSAyMDAwO1xuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlcjtcbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgbG9nKCdTZXJ2ZXIgaGVhZGVyczogJyArIGhlYWRlcnMpO1xuICAgIH0pO1xuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICBpZiAodGhpcy5fd2ViU29ja2V0KSB7XG4gICAgICAgIGxvZygnQWxyZWFkeSBjb25uZWN0ZWQgdG8gd2ViIHNvY2tldC4gRGlzY2FyZGluZyBuZXcgY29ubmVjdGlvbi4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2coJ0Nvbm5lY3RpbmcgdG8gd2ViIHNvY2tldCBjbGllbnQuJyk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICB3ZWJTb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9vblNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICB3ZWJTb2NrZXQub24oJ2Vycm9yJywgdGhpcy5fb25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vblNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gJ3dzPWxvY2FsaG9zdDonICsgU3RyaW5nKHdzUG9ydCkgKyAnLyc7XG4gICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGwpKTtcbiAgfVxuXG4gIF9zZW5kU2VydmVyTWVzc2FnZVRvQ2hyb21lVWkobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fd2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQgIT0gbnVsbCkge1xuICAgICAgd2ViU29ja2V0LnNlbmQoXG4gICAgICAgIHRyYW5zbGF0ZU1lc3NhZ2VGcm9tU2VydmVyKFxuICAgICAgICAgIHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0UG9ydCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfZW5kU2Vzc2lvbigpOiB2b2lkIHtcbiAgICBsb2coJ0VuZGluZyBTZXNzaW9uJyk7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2coJ1JlY2lldmVkIHdlYlNvY2tldCBtZXNzYWdlOiAnICsgbWVzc2FnZSk7XG4gICAgY29uc3QgcHJveHkgPSB0aGlzLl9wcm94eTtcbiAgICBpZiAocHJveHkpIHtcbiAgICAgIHByb3h5LnNlbmRDb21tYW5kKHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcihtZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgX29uU29ja2V0RXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ3dlYlNvY2tldCBlcnJvciAnICsgc3RyaW5naWZ5RXJyb3IoZXJyb3IpKTtcbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldENsb3NlKGNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGxvZygnd2ViU29ja2V0IENsb3NlZCAnICsgY29kZSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9wcm94eSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9wcm94eS5kaXNwb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9vYnNlcnZhYmxlTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fb2JzZXJ2YWJsZU1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgICAgIHRoaXMuX29ic2VydmFibGVNYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcm94eSA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0KSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIHdlYlNvY2tldCcpO1xuICAgICAgd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl93ZWJTb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9zZXJ2ZXI7XG4gICAgaWYgKHNlcnZlcikge1xuICAgICAgbG9nSW5mbygnY2xvc2luZyBzZXJ2ZXInKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETzogTW92ZSB0aGlzIHRvIG51Y2xpZGUtY29tbW9ucy5cbmZ1bmN0aW9uIGlzVmFsaWRSZWdleCh2YWx1ZTogP3N0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB0cnkge1xuICAgIFJlZ0V4cCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==