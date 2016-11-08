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
exports.ClientCallback = undefined;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMessage(method, params) {
  const result = { method: method };
  if (params) {
    result.params = params;
  }
  return result;
}

/**
 * This class provides a central callback channel to communicate with debugger client.
 * Currently it provides four callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 * 4. Output window messages.
 */
let ClientCallback = exports.ClientCallback = class ClientCallback {
  // For output window messages.

  // For server messages.
  constructor() {
    this._serverMessageObservable = new _rxjsBundlesRxMinJs.Subject();
    this._notificationObservable = new _rxjsBundlesRxMinJs.Subject();
    this._outputWindowObservable = new _rxjsBundlesRxMinJs.Subject();
  } // For atom UI notifications.


  getNotificationObservable() {
    return this._notificationObservable;
  }

  getServerMessageObservable() {
    return this._serverMessageObservable;
  }

  getOutputWindowObservable() {
    return this._outputWindowObservable;
  }

  sendUserMessage(type, message) {
    (_utils || _load_utils()).default.log(`sendUserMessage(${ type }): ${ JSON.stringify(message) }`);
    switch (type) {
      case 'notification':
        this._notificationObservable.next({
          type: message.type,
          message: message.message
        });
        break;
      case 'console':
        this.sendMethod(this._serverMessageObservable, 'Console.messageAdded', {
          message: message
        });
        break;
      case 'outputWindow':
        this.sendMethod(this._outputWindowObservable, 'Console.messageAdded', {
          message: message
        });
        break;
      default:
        (_utils || _load_utils()).default.logError(`Unknown UserMessageType: ${ type }`);
    }
  }

  unknownMethod(id, domain, method, params) {
    const message = 'Unknown chrome dev tools method: ' + domain + '.' + method;
    (_utils || _load_utils()).default.log(message);
    this.replyWithError(id, message);
  }

  replyWithError(id, error) {
    this.replyToCommand(id, {}, error);
  }

  replyToCommand(id, result, error) {
    const value = { id: id, result: result };
    if (error != null) {
      value.error = error;
    } else if (result.error != null) {
      value.error = result.error;
    }
    this._sendJsonObject(this._serverMessageObservable, value);
  }

  sendMethod(observable, method, params) {
    this._sendJsonObject(observable, createMessage(method, params));
  }

  _sendJsonObject(observable, value) {
    const message = JSON.stringify(value);
    (_utils || _load_utils()).default.log('Sending JSON: ' + message);
    observable.next(message);
  }

  dispose() {
    (_utils || _load_utils()).default.log('Called ClientCallback dispose method.');
    this._notificationObservable.complete();
    this._serverMessageObservable.complete();
    this._outputWindowObservable.complete();
  }
};