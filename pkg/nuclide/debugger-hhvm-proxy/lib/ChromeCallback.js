'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log, logError} = require('./utils');

// Sends chrome dev tools JSON messages to a callback.
// The Chrome dev tools protocol is detailed at:
//   https://developer.chrome.com/devtools/docs/protocol/1.1/index
class ChromeCallback {
  _callback: ?(message: string) => void;

  constructor(callback: (message: string) => void) {
    this._callback = callback;
  }

  replyWithError(id: number, error: string): void {
    this.replyToCommand(id, {}, error);
  }

  replyToCommand(id: number, result: Object, error: ?string): void {
    var value = {id, result};
    if (error) {
      value.error = error;
    }
    this._sendJsonObject(value);
  }

  sendMethod(method: string, params: ?Object) {
    this._sendJsonObject(createMessage(method, params));
  }

  _sendJsonObject(value: Object): void {
    var message = JSON.stringify(value);
    if (this._callback) {
      log('Sending JSON: ' + message);
      this._callback(message);
    } else {
      logError('Attempt to send json after dispose: ' + message);
    }
  }

  dispose(): void {
    this._callback = null;
  }
}

function createMessage(method: string, params: ?Object): Object {
  var result = {method};
  if (params) {
    result.params = params;
  }
  return result;
}

module.exports = ChromeCallback;
