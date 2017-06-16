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

import invariant from 'assert';
import {Disposable} from 'atom';
import {Observable, BehaviorSubject} from 'rxjs';

export default class MessageStore {
  // Messages will be de-duplicated: store a counter for each unique string.
  _currentMessages: Map<string, number>;
  _messageStream: BehaviorSubject<Array<string>>;

  constructor() {
    this._currentMessages = new Map();
    this._messageStream = new BehaviorSubject([]);
  }

  getMessageStream(): Observable<Array<string>> {
    return this._messageStream;
  }

  displayMessage(message: string): IDisposable {
    const count = (this._currentMessages.get(message) || 0) + 1;
    this._currentMessages.set(message, count);
    if (count === 1) {
      this._publishMessages();
    }
    return new Disposable(() => {
      const remainingCount = this._currentMessages.get(message);
      invariant(remainingCount != null);
      if (remainingCount === 1) {
        this._currentMessages.delete(message);
        this._publishMessages();
      } else {
        this._currentMessages.set(message, remainingCount - 1);
      }
    });
  }

  _publishMessages(): void {
    this._messageStream.next(Array.from(this._currentMessages.keys()));
  }
}
