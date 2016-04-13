'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {getOutputService} from '../../nuclide-debugger-common/lib/OutputServiceManager';
import utils from './utils';
const {log, logError} = utils;
import {Observable} from '@reactivex/rxjs';

type NotificationMessage = {
  type: 'info' | 'warning' | 'error' | 'fatalError';
  message: string;
};

/**
 * The ObservableManager keeps track of the streams we use to talk to the server-side nuclide
 * debugger.  Currently it manages 3 streams:
 *   1. A notification stream to communicate events to atom's notification system.
 *   2. A server message stream to communicate events to the debugger UI.
 *   3. An output window stream to communicate events to the client's output window.
 * The manager also allows two callback to be passed.
 *   1. sendServerMessageToChromeUi takes a string and sends it to the chrome debugger UI.
 *   2. onSessionEnd is optional, and is called when all the managed observables complete.
 * The ObservableManager takes ownership of its observables, and disposes them when its dispose
 * method is called.
 */
export class ObservableManager {
  _notifications: Observable<NotificationMessage>;
  _serverMessages: Observable<string>;
  _outputWindowMessages: Observable<Object>;
  _sendServerMessageToChromeUi: (message: string) => void;
  _onSessionEnd: ?() => mixed;
  _disposables: atom$CompositeDisposable;

  constructor(
    notifications: Observable<NotificationMessage>,
    serverMessages: Observable<string>,
    outputWindowMessages: Observable<Object>,
    sendServerMessageToChromeUi: (message: string) => void,
    onSessionEnd?: () => mixed,
  ) {
    this._notifications = notifications;
    this._serverMessages = serverMessages;
    this._outputWindowMessages = outputWindowMessages;
    this._sendServerMessageToChromeUi = sendServerMessageToChromeUi;
    this._onSessionEnd = onSessionEnd;
    this._disposables = new CompositeDisposable();
    this._subscribe();
  }

  _subscribe(): void {
    this._disposables.add(this._notifications.subscribe(
      this._handleNotificationMessage.bind(this),
      this._handleNotificationError.bind(this),
      this._handleNotificationEnd.bind(this),
    ));
    this._disposables.add(this._serverMessages.subscribe(
      this._handleServerMessage.bind(this),
      this._handleServerError.bind(this),
      this._handleServerEnd.bind(this),
    ));
    this._registerOutputWindowLogging();
    // Register a merged observable from shared streams that we can listen to for the onComplete.
    const sharedNotifications = this._notifications.share();
    const sharedServerMessages = this._serverMessages.share();
    const sharedOutputWindow = this._outputWindowMessages.share();
    Observable
      .merge(sharedNotifications, sharedServerMessages, sharedOutputWindow)
      .subscribe({
        complete: this._onCompleted.bind(this),
      });
  }

  _registerOutputWindowLogging(): void {
    const api = getOutputService();
    if (api != null) {
      const messages = this._outputWindowMessages
        .filter(messageObj => messageObj.method === 'Console.messageAdded')
        .map(messageObj => {
          return {
            level: messageObj.params.message.level,
            text: messageObj.params.message.text,
          };
        });
      const shared = messages.share();
      shared.subscribe({
        complete: this._handleOutputWindowEnd.bind(this),
      });
      this._disposables.add(api.registerOutputProvider({
        source: 'hhvm debugger',
        messages: shared,
      }));
    } else {
      logError('Cannot get output window service.');
    }
  }

  _handleOutputWindowEnd(): void {
    log('Output window observable ended.');
  }

  _handleNotificationMessage(message: NotificationMessage): void {
    switch (message.type) {
      case 'info':
        log('Notification observerable info: ' + message.message);
        atom.notifications.addInfo(message.message);
        break;

      case 'warning':
        log('Notification observerable warning: ' + message.message);
        atom.notifications.addWarning(message.message);
        break;

      case 'error':
        logError('Notification observerable error: ' + message.message);
        atom.notifications.addError(message.message);
        break;

      case 'fatalError':
        logError('Notification observerable fatal error: ' + message.message);
        atom.notifications.addFatalError(message.message);
        break;

      default:
        logError('Unknown message: ' + JSON.stringify(message));
        break;
    }
  }

  _handleNotificationError(error: string): void {
    logError('Notification observerable error: ' + error);
  }

  _handleNotificationEnd(): void {
    log('Notification observerable ends.');
  }

  _handleServerMessage(message: string): void {
    log('Recieved server message: ' + message);
    this._sendServerMessageToChromeUi(message);
  }

  _handleServerError(error: string): void {
    logError('Received server error: ' + error);
  }

  _handleServerEnd(): void {
    log('Server observerable ends.');
  }

  _onCompleted(): void {
    if (this._onSessionEnd != null) {
      this._onSessionEnd();
    }
    log('All observable streams have completed and session end callback was called.');
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
