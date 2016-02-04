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

var _atom = require('../../atom');

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

      var _require$getServiceByNuclideUri = require('../../../client').getServiceByNuclideUri('HhvmDebuggerProxyService', this.getTargetUri());

      var HhvmDebuggerProxyService = _require$getServiceByNuclideUri.HhvmDebuggerProxyService;

      var proxy = new HhvmDebuggerProxyService();
      this._proxy = proxy;
      this._disposables.add(proxy);
      this._disposables.add(proxy.getNotificationObservable().subscribe(this._handleNotificationMessage.bind(this), this._handleNotificationError.bind(this), this._handleNotificationEnd.bind(this)));
      this._disposables.add(proxy.getServerMessageObservable().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleServerEnd.bind(this)));

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhodm1EZWJ1Z2dlckluc3RhbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBV2tCLFNBQVM7Ozs7b0JBT0ksWUFBWTs7SUFFcEMsR0FBRyxzQkFBSCxHQUFHO0lBQUUsT0FBTyxzQkFBUCxPQUFPO0lBQUUsUUFBUSxzQkFBUixRQUFRO0lBQUUsV0FBVyxzQkFBWCxXQUFXOztBQUMxQyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7ZUFDTSxPQUFPLENBQUMseUJBQXlCLENBQUM7O0lBQTFGLDBCQUEwQixZQUExQiwwQkFBMEI7SUFBRSx3QkFBd0IsWUFBeEIsd0JBQXdCOztBQUMzRCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7Z0JBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsYUFBVixVQUFVOztBQUNqQixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDOztJQUN0QyxjQUFjLEdBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxDQUFuRCxjQUFjOztBQWVyQixTQUFTLFNBQVMsR0FBdUI7QUFDdkMsU0FBUSxhQUFhLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQU87Q0FDMUQ7O0lBRVksb0JBQW9CO1lBQXBCLG9CQUFvQjs7QUFRcEIsV0FSQSxvQkFBb0IsQ0FRbkIsV0FBZ0MsRUFBRSxnQkFBeUIsRUFBRTswQkFSOUQsb0JBQW9COztBQVM3QiwrQkFUUyxvQkFBb0IsNkNBU3ZCLFdBQVcsRUFBRTtBQUNuQixRQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7QUFDMUMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENB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QUFhLEVBQVc7QUFDNUMsTUFBSTtBQUNGLFVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNmLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiSGh2bURlYnVnZ2VySW5zdGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eSc7XG5pbXBvcnQgdHlwZSB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5cbmltcG9ydCB0eXBlIHtIaHZtRGVidWdnZXJQcm94eVNlcnZpY2UgYXMgSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlVHlwZSx9XG4gICAgZnJvbSAnLi4vLi4vLi4vZGVidWdnZXItaGh2bS1wcm94eS9saWIvSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJztcblxuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9hdG9tJztcblxuY29uc3Qge2xvZywgbG9nSW5mbywgbG9nRXJyb3IsIHNldExvZ0xldmVsfSA9IHV0aWxzO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCB7dHJhbnNsYXRlTWVzc2FnZUZyb21TZXJ2ZXIsIHRyYW5zbGF0ZU1lc3NhZ2VUb1NlcnZlcn0gPSByZXF1aXJlKCcuL0Nocm9tZU1lc3NhZ2VSZW1vdGluZycpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCB7c3RyaW5naWZ5RXJyb3J9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpLmVycm9yO1xuXG50eXBlIE5vdGlmaWNhdGlvbk1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWxFcnJvcic7XG4gIG1lc3NhZ2U6IHN0cmluZztcbn07XG5cbnR5cGUgSGh2bURlYnVnZ2VyQ29uZmlnID0ge1xuICBzY3JpcHRSZWdleDogc3RyaW5nO1xuICBpZGVrZXlSZWdleDogc3RyaW5nO1xuICB4ZGVidWdQb3J0OiBudW1iZXI7XG4gIGVuZERlYnVnV2hlbk5vUmVxdWVzdHM6IGJvb2xlYW47XG4gIGxvZ0xldmVsOiBzdHJpbmc7XG59O1xuXG5mdW5jdGlvbiBnZXRDb25maWcoKTogSGh2bURlYnVnZ2VyQ29uZmlnIHtcbiAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kZWJ1Z2dlci1oaHZtJyk6IGFueSk7XG59XG5cbmV4cG9ydCBjbGFzcyBIaHZtRGVidWdnZXJJbnN0YW5jZSBleHRlbmRzIERlYnVnZ2VySW5zdGFuY2Uge1xuICBfcHJveHk6ID9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2VUeXBlO1xuICBfc2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfd2ViU29ja2V0OiA/V2ViU29ja2V0O1xuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2xhdW5jaFNjcmlwdFBhdGg6ID9zdHJpbmc7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBsYXVuY2hTY3JpcHRQYXRoOiA/c3RyaW5nKSB7XG4gICAgc3VwZXIocHJvY2Vzc0luZm8pO1xuICAgIHRoaXMuX2xhdW5jaFNjcmlwdFBhdGggPSBsYXVuY2hTY3JpcHRQYXRoO1xuICAgIHRoaXMuX3Byb3h5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX3dlYlNvY2tldCA9IG51bGw7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgc2V0TG9nTGV2ZWwoZ2V0Q29uZmlnKCkubG9nTGV2ZWwpO1xuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxvZ0luZm8oJ0Nvbm5lY3RpbmcgdG86ICcgKyB0aGlzLmdldFRhcmdldFVyaSgpKTtcbiAgICBjb25zdCB7SGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NsaWVudCcpLlxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJywgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgY29uc3QgcHJveHkgPSBuZXcgSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlKCk7XG4gICAgdGhpcy5fcHJveHkgPSBwcm94eTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJveHkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm94eS5nZXROb3RpZmljYXRpb25PYnNlcnZhYmxlKCkuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgdGhpcy5faGFuZGxlTm90aWZpY2F0aW9uRXJyb3IuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZU5vdGlmaWNhdGlvbkVuZC5iaW5kKHRoaXMpLFxuICAgICkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm94eS5nZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlck1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2hhbmRsZVNlcnZlckVycm9yLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9oYW5kbGVTZXJ2ZXJFbmQuYmluZCh0aGlzKVxuICAgICkpO1xuXG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZzogQ29ubmVjdGlvbkNvbmZpZyA9IHtcbiAgICAgIHhkZWJ1Z1BvcnQ6IGNvbmZpZy54ZGVidWdQb3J0LFxuICAgICAgdGFyZ2V0VXJpOiByZW1vdGVVcmkuZ2V0UGF0aCh0aGlzLmdldFRhcmdldFVyaSgpKSxcbiAgICAgIGxvZ0xldmVsOiBjb25maWcubG9nTGV2ZWwsXG4gICAgfTtcbiAgICBsb2dJbmZvKCdDb25uZWN0aW9uIGNvbmZpZzogJyArIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLnNjcmlwdFJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGxvZ0Vycm9yKCdudWNsaWRlLWRlYnVnZ2VyLWhodm0gY29uZmlnIHNjcmlwdFJlZ2V4IGlzIG5vdCBhIHZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJ1xuICAgICAgICArIGNvbmZpZy5zY3JpcHRSZWdleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuc2NyaXB0UmVnZXggPSBjb25maWcuc2NyaXB0UmVnZXg7XG4gICAgfVxuXG4gICAgaWYgKCFpc1ZhbGlkUmVnZXgoY29uZmlnLmlkZWtleVJlZ2V4KSkge1xuICAgICAgLy8gVE9ETzogVXNlciBmYWNpbmcgZXJyb3IgbWVzc2FnZT9cbiAgICAgIGxvZ0Vycm9yKCdudWNsaWRlLWRlYnVnZ2VyLWhodm0gY29uZmlnIGlkZWtleVJlZ2V4IGlzIG5vdCBhIHZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJ1xuICAgICAgICArIGNvbmZpZy5pZGVrZXlSZWdleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuaWRla2V5UmVnZXggPSBjb25maWcuaWRla2V5UmVnZXg7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdW5jaFNjcmlwdFBhdGgpIHtcbiAgICAgIGNvbm5lY3Rpb25Db25maWcuZW5kRGVidWdXaGVuTm9SZXF1ZXN0cyA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgYXR0YWNoUHJvbWlzZSA9IHByb3h5LmF0dGFjaChjb25uZWN0aW9uQ29uZmlnKTtcbiAgICBpZiAodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCkge1xuICAgICAgbG9nSW5mbygnbGF1bmNoU2NyaXB0OiAnICsgdGhpcy5fbGF1bmNoU2NyaXB0UGF0aCk7XG4gICAgICBwcm94eS5sYXVuY2hTY3JpcHQodGhpcy5fbGF1bmNoU2NyaXB0UGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dGFjaFByb21pc2UudGhlbihhdHRhY2hSZXN1bHQgPT4ge1xuXG4gICAgICBsb2dJbmZvKCdBdHRhY2hlZCB0byBwcm9jZXNzLiBBdHRhY2ggbWVzc2FnZTogJyArIGF0dGFjaFJlc3VsdCk7XG5cbiAgICAgIC8vIHNldHVwIHdlYiBzb2NrZXRcbiAgICAgIC8vIFRPRE86IEFzc2lnbiByYW5kb20gcG9ydCByYXRoZXIgdGhhbiB1c2luZyBmaXhlZCBwb3J0LlxuICAgICAgY29uc3Qgd3NQb3J0ID0gMjAwMDtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgICAgdGhpcy5fc2VydmVyID0gc2VydmVyO1xuICAgICAgc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgbG9nRXJyb3IoJ1NlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignaGVhZGVycycsIGhlYWRlcnMgPT4ge1xuICAgICAgICBsb2coJ1NlcnZlciBoZWFkZXJzOiAnICsgaGVhZGVycyk7XG4gICAgICB9KTtcbiAgICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHdlYlNvY2tldCA9PiB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJTb2NrZXQpIHtcbiAgICAgICAgICBsb2coJ0FscmVhZHkgY29ubmVjdGVkIHRvIHdlYiBzb2NrZXQuIERpc2NhcmRpbmcgbmV3IGNvbm5lY3Rpb24uJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKCdDb25uZWN0aW5nIHRvIHdlYiBzb2NrZXQgY2xpZW50LicpO1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICAgIHdlYlNvY2tldC5vbignbWVzc2FnZScsIHRoaXMuX29uU29ja2V0TWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgd2ViU29ja2V0Lm9uKCdlcnJvcicsIHRoaXMuX29uU29ja2V0RXJyb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIHdlYlNvY2tldC5vbignY2xvc2UnLCB0aGlzLl9vblNvY2tldENsb3NlLmJpbmQodGhpcykpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9ICd3cz1sb2NhbGhvc3Q6JyArIFN0cmluZyh3c1BvcnQpICsgJy8nO1xuICAgICAgbG9nKCdMaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb24gYXQ6ICcgKyByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiAobmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gbnVsbCkpO1xuICB9XG5cbiAgX2hhbmRsZVNlcnZlck1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nKCdSZWNpZXZlZCBzZXJ2ZXIgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX3dlYlNvY2tldDtcbiAgICBpZiAod2ViU29ja2V0ICE9IG51bGwpIHtcbiAgICAgIHdlYlNvY2tldC5zZW5kKFxuICAgICAgICB0cmFuc2xhdGVNZXNzYWdlRnJvbVNlcnZlcihcbiAgICAgICAgICByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICAgICAgcmVtb3RlVXJpLmdldFBvcnQodGhpcy5nZXRUYXJnZXRVcmkoKSksXG4gICAgICAgICAgbWVzc2FnZSkpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ1JlY2VpdmVkIHNlcnZlciBlcnJvcjogJyArIGVycm9yKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXJ2ZXJFbmQoKTogdm9pZCB7XG4gICAgbG9nKCdTZXJ2ZXIgb2JzZXJ2ZXJhYmxlIGVuZHMuJyk7XG4gIH1cblxuICBfaGFuZGxlTm90aWZpY2F0aW9uTWVzc2FnZShtZXNzYWdlOiBOb3RpZmljYXRpb25NZXNzYWdlKTogdm9pZCB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICBsb2coJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgaW5mbzogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIHdhcm5pbmc6ICcgKyBtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBsb2dFcnJvcignTm90aWZpY2F0aW9uIG9ic2VydmVyYWJsZSBlcnJvcjogJyArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLm1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZmF0YWxFcnJvcic6XG4gICAgICAgIGxvZ0Vycm9yKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGZhdGFsIGVycm9yOiAnICsgbWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZ0Vycm9yKCdVbmtub3duIG1lc3NhZ2U6ICcgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVOb3RpZmljYXRpb25FcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nRXJyb3IoJ05vdGlmaWNhdGlvbiBvYnNlcnZlcmFibGUgZXJyb3I6ICcgKyBlcnJvcik7XG4gIH1cblxuICAvKipcbiAgICogX2VuZFNlc3Npb24oKSBtdXN0IGJlIGNhbGxlZCBmcm9tIF9oYW5kbGVOb3RpZmljYXRpb25FbmQoKVxuICAgKiBzbyB0aGF0IHdlIGNhbiBndWFyYW50ZWUgYWxsIG5vdGlmaWNhdGlvbnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgICovXG4gIF9oYW5kbGVOb3RpZmljYXRpb25FbmQoKTogdm9pZCB7XG4gICAgbG9nKCdOb3RpZmljYXRpb24gb2JzZXJ2ZXJhYmxlIGVuZHMuJyk7XG4gICAgdGhpcy5fZW5kU2Vzc2lvbigpO1xuICB9XG5cbiAgX2VuZFNlc3Npb24oKTogdm9pZCB7XG4gICAgbG9nKCdFbmRpbmcgU2Vzc2lvbicpO1xuICAgIGlmICh0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nKCdSZWNpZXZlZCB3ZWJTb2NrZXQgbWVzc2FnZTogJyArIG1lc3NhZ2UpO1xuICAgIGNvbnN0IHByb3h5ID0gdGhpcy5fcHJveHk7XG4gICAgaWYgKHByb3h5KSB7XG4gICAgICBwcm94eS5zZW5kQ29tbWFuZCh0cmFuc2xhdGVNZXNzYWdlVG9TZXJ2ZXIobWVzc2FnZSkpO1xuICAgIH1cbiAgfVxuXG4gIF9vblNvY2tldEVycm9yKGVycm9yOiBFcnJvcik6IHZvaWQge1xuICAgIGxvZ0Vycm9yKCd3ZWJTb2NrZXQgZXJyb3IgJyArIHN0cmluZ2lmeUVycm9yKGVycm9yKSk7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25Tb2NrZXRDbG9zZShjb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsb2coJ3dlYlNvY2tldCBDbG9zZWQgJyArIGNvZGUpO1xuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgY29uc3Qgd2ViU29ja2V0ID0gdGhpcy5fd2ViU29ja2V0O1xuICAgIGlmICh3ZWJTb2NrZXQpIHtcbiAgICAgIGxvZ0luZm8oJ2Nsb3Npbmcgd2ViU29ja2V0Jyk7XG4gICAgICB3ZWJTb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX3dlYlNvY2tldCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZlciA9IHRoaXMuX3NlcnZlcjtcbiAgICBpZiAoc2VydmVyKSB7XG4gICAgICBsb2dJbmZvKCdjbG9zaW5nIHNlcnZlcicpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG4vLyBUT0RPOiBNb3ZlIHRoaXMgdG8gbnVjbGlkZS1jb21tb25zLlxuZnVuY3Rpb24gaXNWYWxpZFJlZ2V4KHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICBSZWdFeHAodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=