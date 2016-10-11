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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _ObservableManager;

function _load_ObservableManager() {
  return _ObservableManager = require('./ObservableManager');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _ChromeMessageRemoting;

function _load_ChromeMessageRemoting() {
  return _ChromeMessageRemoting = require('./ChromeMessageRemoting');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _atom2;

function _load_atom2() {
  return _atom2 = require('atom');
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../commons-node/string');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _default = (_utils || _load_utils()).default;

var log = _default.log;
var logInfo = _default.logInfo;
var logError = _default.logError;
var setLogLevel = _default.setLogLevel;

function getConfig() {
  return (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-debugger-php');
}

var PhpDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(PhpDebuggerInstance, _DebuggerInstance);

  function PhpDebuggerInstance(processInfo, launchScriptPath) {
    _classCallCheck(this, PhpDebuggerInstance);

    _get(Object.getPrototypeOf(PhpDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    this._sessionEndCallback = null;
    this._observableManager = null;
    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
    setLogLevel(getConfig().logLevel);
  }

  // TODO: Move this to nuclide-commons.

  _createClass(PhpDebuggerInstance, [{
    key: 'getWebsocketAddress',
    value: _asyncToGenerator(function* () {
      var _this = this;

      logInfo('Connecting to: ' + this.getTargetUri());
      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PhpDebuggerService', this.getTargetUri());
      (0, (_assert || _load_assert()).default)(service);
      var proxy = new service.PhpDebuggerService();
      this._disposables.add(proxy);
      this._proxy = proxy;
      this._observableManager = new (_ObservableManager || _load_ObservableManager()).ObservableManager(proxy.getNotificationObservable().refCount(), proxy.getServerMessageObservable().refCount(), proxy.getOutputWindowObservable().refCount().map(function (message) {
        var serverMessage = (0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(_this.getTargetUri()), message);
        return JSON.parse(serverMessage);
      }), this._sendServerMessageToChromeUi.bind(this), this._endSession.bind(this));
      this._disposables.add(this._observableManager);

      var config = getConfig();
      var sessionConfig = {
        xdebugAttachPort: config.xdebugAttachPort,
        xdebugLaunchingPort: config.xdebugLaunchingPort,
        targetUri: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(this.getTargetUri()),
        logLevel: config.logLevel,
        endDebugWhenNoRequests: false,
        phpRuntimePath: config.phpRuntimePath,
        phpRuntimeArgs: config.phpRuntimeArgs,
        dummyRequestFilePath: 'php_only_xdebug_request.php',
        stopOneStopAll: config.stopOneStopAll
      };
      logInfo('Connection config: ' + JSON.stringify(config));

      if (!isValidRegex(config.scriptRegex)) {
        // TODO: User facing error message?
        (0, (_assert || _load_assert()).default)(config.scriptRegex != null);
        logError('nuclide-debugger-php config scriptRegex is not a valid regular expression: ' + config.scriptRegex);
      } else {
        sessionConfig.scriptRegex = config.scriptRegex;
      }

      if (!isValidRegex(config.idekeyRegex)) {
        // TODO: User facing error message?
        (0, (_assert || _load_assert()).default)(config.idekeyRegex != null);
        logError('nuclide-debugger-php config idekeyRegex is not a valid regular expression: ' + config.idekeyRegex);
      } else {
        sessionConfig.idekeyRegex = config.idekeyRegex;
      }

      // Set config related to script launching.
      if (this._launchScriptPath != null) {
        (0, (_assert || _load_assert()).default)(config.xdebugLaunchingPort != null);
        sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
        sessionConfig.endDebugWhenNoRequests = true;
        sessionConfig.launchScriptPath = this._launchScriptPath;
      }

      var attachResult = yield proxy.debug(sessionConfig);
      logInfo('Attached to process. Attach message: ' + attachResult);

      // setup web socket
      // TODO: Assign random port rather than using fixed port.
      var wsPort = 2000;
      var server = new (_ws || _load_ws()).default.Server({ port: wsPort });
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
      this._disposables.add(new (_atom2 || _load_atom2()).Disposable(function () {
        return _this._disposeServer();
      }));
      this._disposables.add(new (_atom2 || _load_atom2()).Disposable(function () {
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
      return new (_atom2 || _load_atom2()).Disposable(function () {
        _this2._sessionEndCallback = null;
      });
    }
  }, {
    key: '_sendServerMessageToChromeUi',
    value: function _sendServerMessageToChromeUi(message) {
      var webSocket = this._webSocket;
      if (webSocket != null) {
        webSocket.send((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(this.getTargetUri()), message));
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
        proxy.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(message));
      }
    }
  }, {
    key: '_onSocketError',
    value: function _onSocketError(error) {
      logError('webSocket error ' + (0, (_commonsNodeString || _load_commonsNodeString()).stringifyError)(error));
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

  return PhpDebuggerInstance;
})((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance);

exports.PhpDebuggerInstance = PhpDebuggerInstance;
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