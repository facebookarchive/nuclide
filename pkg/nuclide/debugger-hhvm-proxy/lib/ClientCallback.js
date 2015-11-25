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
import {Observable, Subject} from 'rx';

export type UserMessageType = 'notification' | 'console';
export type NotificationType = 'info' | 'warning' | 'error' | 'fatalError';

function createMessage(method: string, params: ?Object): Object {
  const result = {method};
  if (params) {
    result.params = params;
  }
  return result;
}

/**
 * This class provides a central callback channel to communicate with debugger client.
 * Currently it provides three callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 */
export class ClientCallback {
  _serverMessageObservable: Subject;  // For server messages.
  _notificationObservable: Subject;   // For atom UI notifications.

  constructor() {
    this._serverMessageObservable = new Subject();
    this._notificationObservable = new Subject();
  }

  getNotificationObservable(): Observable<NotificationMessage> {
    return this._notificationObservable;
  }

  getServerMessageObservable(): Observable<string> {
    return this._serverMessageObservable;
  }

  sendUserMessage(type: UserMessageType, message: Object): void {
    logger.log(`sendUserMessage(${type}): ${JSON.stringify(message)}`);
    if (type === 'notification') {
      this._notificationObservable.onNext({
        type: message.type,
        message: message.message,
      });
    } else if (type === 'console') {
      this.sendMethod('Console.messageAdded', {
        message,
      });
    } else {
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
    const value = {id, result};
    if (error) {
      value.error = error;
    }
    this._sendJsonObject(value);
  }

  sendMethod(method: string, params: ?Object) {
    this._sendJsonObject(createMessage(method, params));
  }

  _sendJsonObject(value: Object): void {
    const message = JSON.stringify(value);
    logger.log('Sending JSON: ' + message);
    this._serverMessageObservable.onNext(message);
  }

  dispose(): void {
    this._notificationObservable.onCompleted();
    this._serverMessageObservable.onCompleted();
  }
}
