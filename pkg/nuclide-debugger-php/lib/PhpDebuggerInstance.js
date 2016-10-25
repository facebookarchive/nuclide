'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpDebuggerInstance = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _ObservableManager;

function _load_ObservableManager() {
  return _ObservableManager = require('./ObservableManager');
}

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _ChromeMessageRemoting;

function _load_ChromeMessageRemoting() {
  return _ChromeMessageRemoting = require('./ChromeMessageRemoting');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_utils || _load_utils()).default.log;

const logInfo = (_utils || _load_utils()).default.logInfo;

const logError = (_utils || _load_utils()).default.logError;

const setLogLevel = (_utils || _load_utils()).default.setLogLevel;

function getConfig() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-php');
}

let PhpDebuggerInstance = exports.PhpDebuggerInstance = class PhpDebuggerInstance extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance {

  constructor(processInfo, launchScriptPath) {
    super(processInfo);
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    this._sessionEndCallback = null;
    this._observableManager = null;
    this._disposables = new _atom.CompositeDisposable();
    setLogLevel(getConfig().logLevel);
  }

  getWebsocketAddress() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      logInfo('Connecting to: ' + _this.getTargetUri());
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PhpDebuggerService', _this.getTargetUri());

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      const proxy = new service.PhpDebuggerService();
      _this._disposables.add(proxy);
      _this._proxy = proxy;
      _this._observableManager = new (_ObservableManager || _load_ObservableManager()).ObservableManager(proxy.getNotificationObservable().refCount(), proxy.getServerMessageObservable().refCount(), proxy.getOutputWindowObservable().refCount().map(function (message) {
        const serverMessage = (0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_nuclideUri || _load_nuclideUri()).default.getHostname(_this.getTargetUri()), message);
        return JSON.parse(serverMessage);
      }), _this._sendServerMessageToChromeUi.bind(_this), _this._endSession.bind(_this));
      _this._disposables.add(_this._observableManager);

      const config = getConfig();
      const sessionConfig = {
        xdebugAttachPort: config.xdebugAttachPort,
        xdebugLaunchingPort: config.xdebugLaunchingPort,
        targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(_this.getTargetUri()),
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
        if (!(config.scriptRegex != null)) {
          throw new Error('Invariant violation: "config.scriptRegex != null"');
        }

        logError('nuclide-debugger-php config scriptRegex is not a valid regular expression: ' + config.scriptRegex);
      } else {
        sessionConfig.scriptRegex = config.scriptRegex;
      }

      if (!isValidRegex(config.idekeyRegex)) {
        // TODO: User facing error message?
        if (!(config.idekeyRegex != null)) {
          throw new Error('Invariant violation: "config.idekeyRegex != null"');
        }

        logError('nuclide-debugger-php config idekeyRegex is not a valid regular expression: ' + config.idekeyRegex);
      } else {
        sessionConfig.idekeyRegex = config.idekeyRegex;
      }

      // Set config related to script launching.
      if (_this._launchScriptPath != null) {
        if (!(config.xdebugLaunchingPort != null)) {
          throw new Error('Invariant violation: "config.xdebugLaunchingPort != null"');
        }

        sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
        sessionConfig.endDebugWhenNoRequests = true;
        sessionConfig.launchScriptPath = _this._launchScriptPath;
      }

      const attachResult = yield proxy.debug(sessionConfig);
      logInfo('Attached to process. Attach message: ' + attachResult);

      // setup web socket
      // TODO: Assign random port rather than using fixed port.
      const wsPort = 2000;
      const server = new (_ws || _load_ws()).default.Server({ port: wsPort });
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
      _this._disposables.add(new _atom.Disposable(function () {
        return _this._disposeServer();
      }));
      _this._disposables.add(new _atom.Disposable(function () {
        return _this._disposeWebSocket();
      }));

      const result = 'ws=localhost:' + String(wsPort) + '/';
      log('Listening for connection at: ' + result);
      return result;
    })();
  }

  onSessionEnd(callback) {
    this._sessionEndCallback = callback;
    return new _atom.Disposable(() => {
      this._sessionEndCallback = null;
    });
  }

  _sendServerMessageToChromeUi(message) {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_nuclideUri || _load_nuclideUri()).default.getHostname(this.getTargetUri()), message));
    }
  }

  _endSession() {
    log('Ending Session');
    if (this._sessionEndCallback) {
      this._sessionEndCallback();
    }
    this.dispose();
  }

  _onSocketMessage(message) {
    log('Recieved webSocket message: ' + message);
    const proxy = this._proxy;
    if (proxy) {
      proxy.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(message));
    }
  }

  _onSocketError(error) {
    logError('webSocket error ' + (0, (_string || _load_string()).stringifyError)(error));
    this.dispose();
  }

  _onSocketClose(code) {
    log('webSocket Closed ' + code);
  }

  _disposeWebSocket() {
    const webSocket = this._webSocket;
    if (webSocket) {
      this._webSocket = null;
      logInfo('closing webSocket');
      webSocket.close();
    }
  }

  _disposeServer() {
    const server = this._server;
    if (server) {
      this._server = null;
      logInfo('closing server');
      server.close();
    }
  }

  dispose() {
    this._disposables.dispose();
  }
};

// TODO: Move this to nuclide-commons.

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