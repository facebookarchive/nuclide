'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import logger from './utils';
import {Observable, Subject} from 'rxjs';

import type {NotificationMessage} from '..';

export type UserMessageType = 'notification' | 'console' | 'outputWindow';
export type NotificationType = 'info' | 'warning' | 'error' | 'fatalError';

function createMessage(method: string, params: ?Object): Object {
  const result: Object = {method};
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
export class ClientCallback {
  _serverMessageObservable: Subject<any>;  // For server messages.
  _notificationObservable: Subject<any>;   // For atom UI notifications.
  _outputWindowObservable: Subject<any>;   // For output window messages.

  constructor() {
    this._serverMessageObservable = new Subject();
    this._notificationObservable = new Subject();
    this._outputWindowObservable = new Subject();
  }

  getNotificationObservable(): Observable<NotificationMessage> {
    return this._notificationObservable;
  }

  getServerMessageObservable(): Observable<string> {
    return this._serverMessageObservable;
  }

  getOutputWindowObservable(): Observable<string> {
    return this._outputWindowObservable;
  }

  sendUserMessage(type: UserMessageType, message: Object): void {
    logger.log(`sendUserMessage(${type}): ${JSON.stringify(message)}`);
    switch (type) {
      case 'notification':
        this._notificationObservable.next({
          type: message.type,
          message: message.message,
        });
        break;
      case 'console':
        this.sendMethod(this._serverMessageObservable, 'Console.messageAdded', {
          message,
        });
        break;
      case 'outputWindow':
        this.sendMethod(this._outputWindowObservable, 'Console.messageAdded', {
          message,
        });
        break;
      default:
        logger.logError(`Unknown UserMessageType: ${type}`);
    }
  }

  unknownMethod(id: number, domain: string, method: string, params: ?Object): void {
    const message = 'Unknown chrome dev tools method: ' + domain + '.' + method;
    logger.log(message);
    this.replyWithError(id, message);
  }

  replyWithError(id: number, error: string): void {
    this.replyToCommand(id, {}, error);
  }

  replyToCommand(id: number, result: Object, error: ?string): void {
    const value: Object = {id, result};
    if (error != null) {
      value.error = error;
    } else if (result.error != null) {
      value.error = result.error;
    }
    this._sendJsonObject(this._serverMessageObservable, value);
  }

  sendMethod(observable: Observable<string>, method: string, params: ?Object) {
    this._sendJsonObject(observable, createMessage(method, params));
  }

  _sendJsonObject(observable: Observable<string>, value: Object): void {
    const message = JSON.stringify(value);
    logger.log('Sending JSON: ' + message);
    ((observable: any): Subject<any>).next(message);
  }

  dispose(): void {
    logger.log('Called ClientCallback dispose method.');
    this._notificationObservable.complete();
    this._serverMessageObservable.complete();
    this._outputWindowObservable.complete();
  }
}
