'use strict';

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function createMessage(method, params) {
  const result = { method };
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
class ClientCallback {
  // For output window messages.

  // For server messages.
  constructor() {
    this._serverMessages = new _rxjsBundlesRxMinJs.Subject();
    this._outputWindowMessages = new _rxjsBundlesRxMinJs.Subject();
    // We use a `ReplaySubject` here because we want to allow notifications to be emitted possibly
    // before the client subscribes.  This is justified because:
    // 1. we only ever expect one subscriber on the client, and
    // 2. we expect the number of notifications to be small, so storage in memory is not an issue.
    this._notifications = new _rxjsBundlesRxMinJs.ReplaySubject();
  } // For atom UI notifications.


  getNotificationObservable() {
    return this._notifications.asObservable();
  }

  getServerMessageObservable() {
    return this._serverMessages.asObservable();
  }

  getOutputWindowObservable() {
    return this._outputWindowMessages.asObservable();
  }

  sendUserMessage(type, message) {
    (_utils || _load_utils()).default.log(`sendUserMessage(${type}): ${JSON.stringify(message)}`);
    switch (type) {
      case 'notification':
        this._notifications.next({
          type: message.type,
          message: message.message
        });
        break;
      case 'console':
        this.sendServerMethod('Console.messageAdded', {
          message
        });
        break;
      case 'outputWindow':
        this.sendOutputWindowMethod('Console.messageAdded', {
          message
        });
        break;
      default:
        (_utils || _load_utils()).default.logError(`Unknown UserMessageType: ${type}`);
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
    const value = { id, result };
    if (error != null) {
      value.error = error;
    } else if (result.error != null) {
      value.error = result.error;
    }
    sendJsonObject(this._serverMessages, value);
  }

  sendServerMethod(method, params) {
    sendJsonObject(this._serverMessages, createMessage(method, params));
  }

  sendOutputWindowMethod(method, params) {
    sendJsonObject(this._outputWindowMessages, createMessage(method, params));
  }

  dispose() {
    (_utils || _load_utils()).default.log('Called ClientCallback dispose method.');
    this._notifications.complete();
    this._serverMessages.complete();
    this._outputWindowMessages.complete();
  }
}

exports.ClientCallback = ClientCallback;
function sendJsonObject(subject, value) {
  const message = JSON.stringify(value);
  (_utils || _load_utils()).default.log(`Sending JSON: ${message}`);
  subject.next(message);
}