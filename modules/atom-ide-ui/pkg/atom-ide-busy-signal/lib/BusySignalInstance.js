/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {BusySignalOptions, BusyMessage} from './types';
import type {MessageStore} from './MessageStore';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export default class BusySignalInstance {
  _messageStore: MessageStore;
  _disposables: UniversalDisposable = new UniversalDisposable();

  constructor(messageStore: MessageStore) {
    this._messageStore = messageStore;
  }

  dispose() {
    this._disposables.dispose();
  }

  reportBusy(title: string, options?: BusySignalOptions): BusyMessage {
    const busyMessage = this._messageStore.add(title, options || {});

    const serviceDisposables = this._disposables;
    const wrapper: BusyMessage = {
      setTitle(title2: string): void {
        busyMessage.setTitle(title2);
      },
      dispose(): void {
        busyMessage.dispose();
        serviceDisposables.remove(wrapper);
      },
    };
    serviceDisposables.add(wrapper);
    return wrapper;
  }

  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */
  async reportBusyWhile<T>(
    title: string,
    f: () => Promise<T>,
    options?: BusySignalOptions,
  ): Promise<T> {
    const busySignal = this.reportBusy(title, options);
    try {
      return await f();
    } finally {
      busySignal.dispose();
    }
  }
}
