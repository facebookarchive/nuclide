'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {CircularBuffer} from 'nuclide-commons';

type Item = {
  date: Date,
  service: string,
  method: string,
  args: Array<mixed>,
}

export default class ServiceLogger {
  _buffer: CircularBuffer<Item>;

  constructor() {
    // $FlowIssue Flow does not understand a getter that returns a constructor function.
    this._buffer = new CircularBuffer(10000);
  }

  logServiceCall(
    service: string,
    method: string,
    isLocal: boolean,
    ...args: Array<mixed>
  ): void {
    var item: Item = {
      date: new Date(),
      service,
      method,
      args,
    };
    // $FlowIssue
    this._buffer.push(item);
  }

  // $FlowIssue: t6187050
  [Symbol.iterator](): Iterator<Item> {
    return this._buffer[Symbol.iterator]();
  }
}
