'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalMessage} from 'nuclide-busy-signal-interfaces';

import {Subject} from 'rx';
import invariant from 'assert';

import {promises} from 'nuclide-commons';
const {isPromise} = promises;

export class BusySignalProviderBase {
  messages: Subject<BusySignalMessage>;
  _nextId: number;
  constructor() {
    this.messages = new Subject();
    this._nextId = 0;
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
  reportBusy<T>(message: string, f: () => Promise<T>): Promise<T> {
    const {busy, done} = this._nextMessagePair(message);
    const publishDone = () => {
      this.messages.onNext(done);
    };
    this.messages.onNext(busy);
    try {
      const returnValue = f();
      invariant(isPromise(returnValue));
      returnValue.then(publishDone, publishDone);
      return returnValue;
    } catch (e) {
      publishDone();
      throw e;
    }
  }
}
