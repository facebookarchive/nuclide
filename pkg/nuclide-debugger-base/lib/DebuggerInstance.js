/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type DebuggerProcessInfo from './DebuggerProcessInfo';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {AtomNotification} from '../../nuclide-debugger-common';

import {Emitter} from 'atom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  translateMessageFromServer,
  translateMessageToServer,
} from './ChromeMessageRemoting';
import nuclideUri from 'nuclide-commons/nuclideUri';
import NewProtocolMessageChecker from './NewProtocolMessageChecker';

import {getLogger} from 'log4js';
const SESSION_END_EVENT = 'session-end-event';
const RECEIVED_MESSAGE_EVENT = 'received-message-event';

export default class DebuggerInstanceBase {
  _processInfo: DebuggerProcessInfo;
  +onSessionEnd: ?(callback: () => void) => IDisposable;

  constructor(processInfo: DebuggerProcessInfo) {
    this._processInfo = processInfo;
  }

  getDebuggerProcessInfo(): DebuggerProcessInfo {
    return this._processInfo;
  }

  getProviderName(): string {
    return this._processInfo.getServiceName();
  }

  getTargetUri(): NuclideUri {
    return this._processInfo.getTargetUri();
  }

  dispose(): void {
    throw new Error('abstract method');
  }
}

export class DebuggerInstance extends DebuggerInstanceBase {
  _rpcService: Object;
  _disposables: UniversalDisposable;
  _emitter: Emitter;
  _logger: log4js$Logger;
  _newProtocolMessageChecker: NewProtocolMessageChecker;
  _disposed: boolean;

  constructor(
    processInfo: DebuggerProcessInfo,
    rpcService: IDisposable,
    subscriptions: ?UniversalDisposable,
  ) {
    super(processInfo);
    this._disposed = false;
    this._rpcService = rpcService;
    this._disposables = new UniversalDisposable();
    if (subscriptions != null) {
      this._disposables.add(subscriptions);
    }
    this._disposables.add(rpcService);
    this._logger = getLogger(`nuclide-debugger-${this.getProviderName()}`);
    this._newProtocolMessageChecker = new NewProtocolMessageChecker();
    this._emitter = new Emitter();
    this._registerServerHandlers();
  }

  getLogger(): log4js$Logger {
    return this._logger;
  }

  _registerServerHandlers(): void {
    const disposables = new UniversalDisposable(
      this._rpcService
        .getServerMessageObservable()
        .refCount()
        .subscribe(
          this._handleServerMessage.bind(this),
          this._handleServerError.bind(this),
          this._handleSessionEnd.bind(this),
        ),
    );
    if (rpcServiceSupportsAtomNotifications(this._rpcService)) {
      disposables.add(
        this._rpcService
          .getAtomNotificationObservable()
          .refCount()
          .subscribe(this._handleAtomNotification.bind(this)),
      );
    }
    this._disposables.add(disposables);
  }

  _handleAtomNotification(notification: AtomNotification): void {
    const {type, message} = notification;
    atom.notifications.add(type, message);
  }

  onSessionEnd(callback: () => mixed): IDisposable {
    return this._emitter.on(SESSION_END_EVENT, callback);
  }

  _translateMessageIfNeeded(message_: string): string {
    let message = message_;
    // TODO: do we really need isRemote() checking?
    if (nuclideUri.isRemote(this.getTargetUri())) {
      message = translateMessageFromServer(
        nuclideUri.getHostname(this.getTargetUri()),
        message,
      );
    }
    return message;
  }

  _handleServerMessage(message_: string): void {
    let message = message_;
    const processedMessage = this.preProcessServerMessage(message);
    message = this._translateMessageIfNeeded(processedMessage);
    this.receiveNuclideMessage(message);
  }

  _handleServerError(error: string): void {
    this.getLogger().error('Received server error: ' + error);
  }

  _handleSessionEnd(): void {
    this.getLogger().debug('Ending Session');
    this._emitter.emit(SESSION_END_EVENT);
    this.dispose();
  }

  async _handleChromeSocketMessage(message: string): Promise<void> {
    const processedMessage = await this.preProcessClientMessage(message);
    this._rpcService.sendCommand(translateMessageToServer(processedMessage));
  }

  /**
   * The following three methods are used by new Nuclide channel.
   */
  sendNuclideMessage(message: string): void {
    if (this._disposed) {
      this._logger.error('sendNuclideMessage after dispose!', message);
      return;
    }
    this._newProtocolMessageChecker.registerSentMessage(message);
    this._handleChromeSocketMessage(message);
  }

  registerNuclideNotificationHandler(
    callback: (message: string) => mixed,
  ): IDisposable {
    return this._emitter.on(RECEIVED_MESSAGE_EVENT, callback);
  }

  receiveNuclideMessage(message: string): void {
    this._emitter.emit(RECEIVED_MESSAGE_EVENT, message);
  }

  // Preprocessing hook for client messages before sending to server.
  preProcessClientMessage(message: string): Promise<string> {
    return Promise.resolve(message);
  }

  // Preprocessing hook for server messages before sending to client UI.
  preProcessServerMessage(message: string): string {
    return message;
  }

  dispose() {
    this._disposed = true;
    this._disposables.dispose();
  }
}

function rpcServiceSupportsAtomNotifications(service: Object): boolean {
  return typeof service.getAtomNotificationObservable === 'function';
}
