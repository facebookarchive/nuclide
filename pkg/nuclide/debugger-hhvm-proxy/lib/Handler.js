'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log} = require('./utils');

class Handler {
  _callback: ChromeCallback;
  _domain: string;

  constructor(domain: string, callback: ChromeCallback) {
    this._domain = domain;
    this._callback = callback;
  }

  getDomain(): string {
    return this._domain;
  }

  handleMethod(id: number, method: string, params: ?Object): Promise {
    throw new Error('absrtact');
  }

  unknownMethod(id: number, method: string, params: ?Object): void {
    var message = 'Unknown chrome dev tools method: ' + this.getDomain() + '.' + method;
    log(message);
    this.replyWithError(id, message);
  }

  replyWithError(id: number, error: string): void {
    this._callback.replyWithError(id, error);
  }

  replyToCommand(id: number, result: Object, error: ?string): void {
    this._callback.replyToCommand(id, result, error);
  }

  sendMethod(method: string, params: ?Object): void {
    this._callback.sendMethod(method, params);
  }
}

module.exports = Handler;
