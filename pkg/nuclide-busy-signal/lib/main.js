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

import type {MessageDisplayOptions} from './BusySignalInstance';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import BusySignalInstance from './BusySignalInstance';
import MessageStore from './MessageStore';
import StatusBarTile from './StatusBarTile';

export type BusySignalService = {
  // Activates the busy signal with the given message and returns the promise
  // from the provided callback.
  // The busy signal automatically deactivates when the returned promise
  // either resolves or rejects.
  reportBusyWhile<T>(
    message: string,
    f: () => Promise<T>,
    options?: MessageDisplayOptions,
  ): Promise<T>,

  // Activates the busy signal with the given message.
  // The returned disposable/subscription can be dispose()d or unsubscribe()d
  // to deactivate the given busy message.
  reportBusy(
    message: string,
    options?: MessageDisplayOptions,
  ): IDisposable & rxjs$ISubscription,

  // Call this when you're done to ensure that all busy signals are removed.
  dispose(): void,
};

class Activation {
  _statusBarTile: ?StatusBarTile;
  _disposables: UniversalDisposable;
  _messageStore: MessageStore;

  constructor() {
    this._disposables = new UniversalDisposable();
    this._messageStore = new MessageStore();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeStatusBar(statusBar: atom$StatusBar): IDisposable {
    const statusBarTile = (this._statusBarTile = new StatusBarTile());
    statusBarTile.consumeMessageStream(this._messageStore.getMessageStream());
    const disposable = new UniversalDisposable(() => {
      if (this._statusBarTile) {
        this._statusBarTile.dispose();
        this._statusBarTile = null;
      }
    });
    statusBarTile.consumeStatusBar(statusBar);
    this._disposables.add(disposable);
    return disposable;
  }

  provideBusySignal(): BusySignalService {
    return new BusySignalInstance(this._messageStore);
  }
}

createPackage(module.exports, Activation);
