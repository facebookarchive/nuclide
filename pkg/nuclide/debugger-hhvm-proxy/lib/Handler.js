'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {log} from './utils';
import ChromeCallback from './ChromeCallback';
import {NotificationCallback} from './NotificationCallback';
import type {NotificationType} from './NotificationCallback';

class Handler {
  _domain: string;
  _chromeCallback: ChromeCallback;
  _notificationCallback: NotificationCallback;

  constructor(
    domain: string,
    chromeCallback: ChromeCallback,
    notificationCallback: NotificationCallback,
  ) {
    this._domain = domain;
    this._chromeCallback = chromeCallback;
    this._notificationCallback = notificationCallback;
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
    this._chromeCallback.replyWithError(id, error);
  }

  replyToCommand(id: number, result: Object, error: ?string): void {
    this._chromeCallback.replyToCommand(id, result, error);
  }

  sendMethod(method: string, params: ?Object): void {
    this._chromeCallback.sendMethod(method, params);
  }

  sendNotification(type: NotificationType, message: string): void {
    this._notificationCallback.sendMessage(type, message);
  }
}

module.exports = Handler;
