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

import type {BusySignalOptions} from './types';
import type MessageStore from './MessageStore';

import invariant from 'assert';
import {isPromise} from 'nuclide-commons/promise';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export default class BusySignalInstance {
  _messageStore: MessageStore;
  _disposables: UniversalDisposable;

  constructor(messageStore: MessageStore) {
    this._messageStore = messageStore;
    this._disposables = new UniversalDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  /**
   * Displays the message until the returned disposable is disposed
   */
  reportBusy(
    message: string,
    options?: BusySignalOptions,
  ): UniversalDisposable {
    if (options == null || options.onlyForFile == null) {
      const disposable = this._messageStore.displayMessage(message);
      this._disposables.add(disposable);
      return new UniversalDisposable(disposable, () => {
        this._disposables.remove(disposable);
      });
    }

    let displayedDisposable = null;
    const disposeDisplayed = () => {
      if (displayedDisposable != null) {
        displayedDisposable.dispose();
        displayedDisposable = null;
      }
    };
    this._disposables.add(disposeDisplayed);
    return new UniversalDisposable(
      atom.workspace.observeActivePaneItem(item => {
        if (
          item != null &&
          typeof item.getPath === 'function' &&
          item.getPath() === options.onlyForFile
        ) {
          if (displayedDisposable == null) {
            displayedDisposable = this._messageStore.displayMessage(message);
          }
        } else {
          disposeDisplayed();
        }
      }),
      // We can't add displayedDisposable directly because its value may change.
      disposeDisplayed,
      () => this._disposables.remove(disposeDisplayed),
    );
  }

  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */
  reportBusyWhile<T>(
    message: string,
    f: () => Promise<T>,
    options?: BusySignalOptions,
  ): Promise<T> {
    const messageRemover = this.reportBusy(message, options);
    const removeMessage = messageRemover.dispose.bind(messageRemover);
    try {
      const returnValue = f();
      invariant(isPromise(returnValue));
      returnValue.then(removeMessage, removeMessage);
      return returnValue;
    } catch (e) {
      removeMessage();
      throw e;
    }
  }
}
