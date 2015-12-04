'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {Disposable} from 'atom';

import {BusySignalProviderBase} from './BusySignalProviderBase';

type MessageRecord = {
  // The disposable to call to remove the message
  disposable: atom$Disposable,
  // The number of messages outstanding
  count: number,
}

export class DedupedBusySignalProviderBase extends BusySignalProviderBase {

  // Invariant: All contained MessageRecords must have a count greater than or equal to one.
  _messageRecords: Map<string, MessageRecord>;

  constructor() {
    super();
    this._messageRecords = new Map();
  }

  displayMessage(message: string): atom$Disposable {
    this._incrementCount(message);
    return new Disposable(() => {
      this._decrementCount(message);
    });
  }

  _incrementCount(message: string): void {
    let record = this._messageRecords.get(message);
    if (record == null) {
      record = {
        disposable: super.displayMessage(message),
        count: 1,
      };
      this._messageRecords.set(message, record);
    } else {
      record.count++;
    }
  }

  _decrementCount(message: string): void {
    const record = this._messageRecords.get(message);
    invariant(record != null);
    invariant(record.count > 0);
    if (record.count === 1) {
      record.disposable.dispose();
      this._messageRecords.delete(message);
    } else {
      record.count--;
    }
  }
}
