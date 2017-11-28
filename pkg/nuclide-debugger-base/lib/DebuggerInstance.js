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
    this._newProtocolMessageChecker = new (_NewProtocolMessageChecker || _load_NewProtocolMessageChecker()).default();
    this._emitter = new _atom.Emitter();
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
    const processedMessage = this.preProcessServerMessage(message);
    message = this._translateMessageIfNeeded(processedMessage);
    this.receiveNuclideMessage(message);
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
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const processedMessage = yield _this.preProcessClientMessage(message);
      _this._rpcService.sendCommand((0, (_ChromeMessageRemoting || _load_ChromeMessageRemoting()).translateMessageToServer)(processedMessage));
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

  // Preprocessing hook for client messages before sending to server.
  preProcessClientMessage(message) {
    return Promise.resolve(message);
  }

  // Preprocessing hook for server messages before sending to client UI.
  preProcessServerMessage(message) {
    return message;
  }

  dispose() {
    this._disposables.dispose();
  }
}

exports.DebuggerInstance = DebuggerInstance;
function rpcServiceSupportsAtomNotifications(service) {
  return typeof service.getAtomNotificationObservable === 'function';
}