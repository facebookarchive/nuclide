'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProvider, BusySignalMessage} from 'nuclide-busy-signal-interfaces';

import {Observable, BehaviorSubject} from 'rx';
import {Disposable} from 'atom';
import invariant from 'assert';

export class MessageStore {
  // provider to id to messages.
  _currentMessages: Map<BusySignalProvider, Map<number, BusySignalMessage>>;
  _messageStream: BehaviorSubject<Array<BusySignalMessage>>;

  constructor() {
    this._currentMessages = new Map();
    this._messageStream = new BehaviorSubject([]);
  }

  consumeProvider(provider: BusySignalProvider): atom$Disposable {
    const subscription =
      provider.messages.subscribe(message => this._processUpdate(provider, message));
    return new Disposable(() => {
      subscription.dispose();
      this._currentMessages.delete(provider);
      this._publishMessages();
    });
  }

  getMessageStream(): Observable<Array<BusySignalMessage>> {
    return this._messageStream;
  }

  _processUpdate(provider: BusySignalProvider, message: BusySignalMessage): void {
    let idMap = this._currentMessages.get(provider);
    if (idMap == null) {
      idMap = new Map();
      this._currentMessages.set(provider, idMap);
    }
    if (message.status === 'busy') {
      idMap.set(message.id, message);
    } else {
      invariant(message.status === 'done');
      idMap.delete(message.id);
    }
    this._publishMessages();
  }

  _publishMessages(): void {
    const messages = [];
    for (const idMap of this._currentMessages.values()) {
      for (const message of idMap.values()) {
        messages.push(message);
      }
    }
    this._messageStream.onNext(messages);
  }
}
