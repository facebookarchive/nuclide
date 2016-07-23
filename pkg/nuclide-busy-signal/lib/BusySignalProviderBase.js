'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalMessage} from './types';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Observable} from 'rxjs';

import {Disposable, CompositeDisposable} from 'atom';

import {Subject} from 'rxjs';
import invariant from 'assert';

import {isPromise} from '../../commons-node/promise';

export type MessageDisplayOptions = {
  onlyForFile: NuclideUri,
};

export class BusySignalProviderBase {
  _nextId: number;
  _messages: Subject<BusySignalMessage>;
  messages: Observable<BusySignalMessage>;

  constructor() {
    this._nextId = 0;
    this._messages = new Subject();
    this.messages = this._messages;
  }

  /**
   * Displays the message until the returned disposable is disposed
   */
  displayMessage(message: string, optionsArg?: MessageDisplayOptions): IDisposable {
    // Reassign as const so the type refinement holds in the closure below
    const options = optionsArg;
    if (options == null || options.onlyForFile == null) {
      return this._displayMessage(message);
    }

    let displayedDisposable = null;
    const disposeDisplayed = () => {
      if (displayedDisposable != null) {
        displayedDisposable.dispose();
        displayedDisposable = null;
      }
    };
    return new CompositeDisposable(
      atom.workspace.observeActivePaneItem(item => {
        if (item != null &&
            typeof item.getPath === 'function' &&
            item.getPath() === options.onlyForFile) {
          if (displayedDisposable == null) {
            displayedDisposable = this._displayMessage(message);
          }
        } else {
          disposeDisplayed();
        }
      }),
      // We can't add displayedDisposable directly because its value may change.
      new Disposable(disposeDisplayed),
    );
  }

  _displayMessage(message: string): IDisposable {
    const {busy, done} = this._nextMessagePair(message);
    this._messages.next(busy);
    return new Disposable(() => {
      this._messages.next(done);
    });
  }

  _nextMessagePair(message: string): {busy: BusySignalMessage, done: BusySignalMessage} {
    const busy = {
      status: 'busy',
      id: this._nextId,
      message,
    };
    const done = {
      status: 'done',
      id: this._nextId,
    };
    this._nextId++;
    return {busy, done};
  }

  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */
  reportBusy<T>(message: string, f: () => Promise<T>, options?: MessageDisplayOptions): Promise<T> {
    const messageRemover = this.displayMessage(message, options);
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
