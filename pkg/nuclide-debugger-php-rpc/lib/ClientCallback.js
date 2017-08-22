'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientCallback = undefined;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = _interopRequireDefault(require('../../nuclide-debugger-common/lib/ClientCallback'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class ClientCallback extends (_ClientCallback || _load_ClientCallback()).default {
  sendUserMessage(type, message) {
    (_utils || _load_utils()).default.debug(`sendUserMessage(${type}): ${JSON.stringify(message)}`);
    switch (type) {
      case 'notification':
        this._atomNotificationObservable.next({
          type: message.type,
          message: message.message
        });
        break;
      case 'console':
      case 'outputWindow':
        this.sendUserOutputMessage(JSON.stringify(message));
        break;
      default:
        (_utils || _load_utils()).default.error(`Unknown UserMessageType: ${type}`);
    }
  }

  replyWithError(id, error) {
    this.replyToCommand(id, {}, error);
  }

  replyToCommand(id, result, error) {
    const value = { id, result };
    if (error != null) {
      value.error = error;
    }
    sendJsonObject(this._serverMessageObservable, value);
  }

  sendServerMethod(method, params) {
    sendJsonObject(this._serverMessageObservable, createMessage(method, params));
  }
}

exports.ClientCallback = ClientCallback;
function sendJsonObject(subject, value) {
  const message = JSON.stringify(value);
  (_utils || _load_utils()).default.debug(`Sending JSON: ${message}`);
  subject.next(message);
}