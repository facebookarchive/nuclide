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

var _atom = require('atom');

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
    this._disposables = new _atom.CompositeDisposable();
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
      this._disposables.add(proxy);
      this._proxy = proxy;
      this._observableManager = new _ObservableManager.ObservableManager(proxy.getNotificationObservable(), proxy.getServerMessageObservable(), proxy.getOutputWindowObservable().map(function (message) {
        var serverMessage = translateMessageFromServer(remoteUri.getHostname(_this.getTargetUri()), remoteUri.getPort(_this.getTargetUri()), message);
        return JSON.parse(serverMessage);
      }), this._sendServerMessageToChromeUi.bind(this), this._endSession.bind(this));
      this._disposables.add(this._observableManager);

      var config = getConfig();
      var sessionConfig = {
        xdebugAttachPort: config.xdebugAttachPort,
        xdebugLaunchingPort: config.xdebugLaunchingPort,
        targetUri: remoteUri.getPath(this.getTargetUri()),
        logLevel: config.logLevel,
        endDebugWhenNoRequests: false,
        phpRuntimePath: config.phpRuntimePath,
        dummyRequestFilePath: 'php_only_xdebug_request.php'
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
      this._disposables.add(new Disposable(function () {
        return _this._disposeServer();
      }));
      this._disposables.add(new Disposable(function () {
        return _this._disposeWebSocket();
      }));

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
    }
  }, {
    key: '_disposeWebSocket',
    value: function _disposeWebSocket() {
      var webSocket = this._webSocket;
      if (webSocket) {
        this._webSocket = null;
        logInfo('closing webSocket');
        webSocket.close();
      }
    }
  }, {
    key: '_disposeServer',
    value: function _disposeServer() {
      var server = this._server;
      if (server) {
        this._server = null;
        logInfo('closing server');
        server.close();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
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