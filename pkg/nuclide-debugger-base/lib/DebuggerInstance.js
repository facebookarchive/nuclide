'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerInstance = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ChromeMessageRemoting;

function _load_ChromeMessageRemoting() {
  return _ChromeMessageRemoting = require('./ChromeMessageRemoting');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _WebSocketServer;

function _load_WebSocketServer() {
  return _WebSocketServer = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _NewProtocolChannelChecker;

function _load_NewProtocolChannelChecker() {
  return _NewProtocolChannelChecker = require('../../nuclide-debugger-common/lib/NewProtocolChannelChecker');
}

var _NewProtocolMessageChecker;

function _load_NewProtocolMessageChecker() {
  return _NewProtocolMessageChecker = _interopRequireDefault(require('./NewProtocolMessageChecker'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SESSION_END_EVENT = 'session-end-event'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */

const RECEIVED_MESSAGE_EVENT = 'received-message-event';

class DebuggerInstanceBase {

  constructor(processInfo) {
    this._processInfo = processInfo;
  }

  getDebuggerProcessInfo() {
    return this._processInfo;
  }

  getProviderName() {
    return this._processInfo.getServiceName();
  }

  getTargetUri() {
    return this._processInfo.getTargetUri();
  }

  dispose() {
    throw new Error('abstract method');
  }

  getWebsocketAddress() {
    throw new Error('abstract method');
  }
}

exports.default = DebuggerInstanceBase;
class DebuggerInstance extends DebuggerInstanceBase {

  constructor(processInfo, rpcService, subscriptions) {
    super(processInfo);
    this._rpcService = rpcService;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    if (subscriptions != null) {
      this._disposables.add(subscriptions);
    }
    this._disposables.add(rpcService);
    this._logger = (0, (_log4js || _load_log4js()).getLogger)(`nuclide-debugger-${this.getProviderName()}`);
    this._chromeWebSocketServer = new (_WebSocketServer || _load_WebSocketServer()).WebSocketServer();
    this._chromeWebSocket = null;
    this._useNewChannel = false;
    this._newProtocolMessageChecker = new (_NewProtocolMessageChecker || _load_NewProtocolMessageChecker()).default();
    this._emitter = new _atom.Emitter();
    this._disposables.add(this._chromeWebSocketServer);
    this._registerServerHandlers();
  }

  getLogger() {
    return this._logger;
  }

  _registerServerHandlers() {
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._rpcService.getServerMessageObservable().refCount().subscribe(this._handleServerMessage.bind(this), this._handleServerError.bind(this), this._handleSessionEnd.bind(this)));
    if (rpcServiceSupportsAtomNotifications(this._rpcService)) {
      disposables.add(this._rpcService.getAtomNotificationObservable().refCount().subscribe(this._handleAtomNotification.bind(this)));
    }
    this._disposables.add(disposables);
  }

  _handleAtomNotification(notification) {
    const { type, message } = notification;
    atom.notifications.add(type, message);
  }

  getWebsocketAddress() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._useNewChannel = yield (0, (_NewProtocolChannelChecker || _load_NewProtocolChannelChecker()).isNewProtocolChannelEnabled)(_this.getProviderName());
      return Promise.resolve(_this._startChromeWebSocketServer());
    })();
  }

  _startChromeWebSocketServer() {
    // setup web socket
    const wsPort = this._getWebSocketPort();
    this._chromeWebSocketServer.start(wsPort).catch(this._handleWebSocketServerError.bind(this)).then(this._handleWebSocketServerConnection.bind(this));
    const result = 'ws=localhost:' + String(wsPort) + '/';
    this.getLogger().info('Listening for connection at: ' + result);
    return result;
  }

  _handleWebSocketServerError(error) {
    let errorMessage = `Server error: ${JSON.stringify(error)}`;
    if (error.code === 'EADDRINUSE') {
      errorMessage = `The debug port ${error.port} is in use.
      Please choose a different port in the debugger config settings.`;
    }
    atom.notifications.addError(errorMessage);
    this.getLogger().error(errorMessage);
    this.dispose();
  }

  _handleWebSocketServerConnection(webSocket) {
    if (webSocket == null) {
      // This means there was an error, which was already handled by _handleWebSocketServerError
      return;
    }
    if (this._chromeWebSocket) {
      this.getLogger().debug('Already connected to Chrome WebSocket. Discarding new connection.');
      webSocket.close();
      return;
    }
    this.getLogger().debug('Connecting to Chrome WebSocket client.');
    this._chromeWebSocket = webSocket;
    webSocket.on('message', this._handleChromeSocketMessage.bind(this));
    webSocket.on('error', this._handleChromeSocketError.bind(this));
    webSocket.on('close', this._handleChromeSocketClose.bind(this));
  }

  _getWebSocketPort() {
    // Generate a random port.
    return this._generateRandomInteger(2000, 65535);
  }

  _generateRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  onSessionEnd(callback) {
    return this._emitter.on(SESSION_END_EVENT, callback);
  }

  _translateMessageIfNeeded(message_) {
    let message = message_;
    // TODO: do we really need isRemote() checking?
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(this.getTargetUri())) {
      message = (0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageFromServer)((_nuclideUri || _load_nuclideUri()).default.getHostname(this.getTargetUri()), message);
    }
    return message;
  }

  _handleServerMessage(message_) {
    let message = message_;
    this.getLogger().debug('Recieved server message: ' + message);
    const processedMessage = this.preProcessServerMessage(message);
    const webSocket = this._chromeWebSocket;
    message = this._translateMessageIfNeeded(processedMessage);
    if (this._useNewChannel) {
      this.receiveNuclideMessage(message);
    } else {
      if (webSocket != null) {
        webSocket.send(message);
      } else {
        this.getLogger().error("Why isn't chrome websocket available?");
      }
    }
  }

  _handleServerError(error) {
    this.getLogger().error('Received server error: ' + error);
  }

  _handleSessionEnd() {
    this.getLogger().debug('Ending Session');
    this._emitter.emit(SESSION_END_EVENT);
    this.dispose();
  }

  _handleChromeSocketMessage(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2.getLogger().debug('Recieved Chrome message: ' + message);
      const processedMessage = yield _this2.preProcessClientMessage(message);
      _this2._rpcService.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(processedMessage));
    })();
  }

  /**
   * The following three methods are used by new Nuclide channel.
   */
  sendNuclideMessage(message) {
    this._newProtocolMessageChecker.registerSentMessage(message);
    return this._handleChromeSocketMessage(message);
  }

  registerNuclideNotificationHandler(callback) {
    return this._emitter.on(RECEIVED_MESSAGE_EVENT, callback);
  }

  receiveNuclideMessage(message) {
    this._emitter.emit(RECEIVED_MESSAGE_EVENT, message);
  }

  // Preprocessing hook for client messsages before sending to server.
  preProcessClientMessage(message) {
    return Promise.resolve(message);
  }

  // Preprocessing hook for server messages before sending to client UI.
  preProcessServerMessage(message) {
    return message;
  }

  _handleChromeSocketError(error) {
    this.getLogger().error('Chrome webSocket error ' + (0, (_string || _load_string()).stringifyError)(error));
    this.dispose();
  }

  _handleChromeSocketClose(code) {
    this.getLogger().debug(`Chrome webSocket closed: ${code}`);
    this.dispose();
  }

  dispose() {
    this._disposables.dispose();
  }
}

exports.DebuggerInstance = DebuggerInstance;
function rpcServiceSupportsAtomNotifications(service) {
  return typeof service.getAtomNotificationObservable === 'function';
}