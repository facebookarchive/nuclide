'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';
import {observeStream, splitStream} from '../../commons-node/stream';
import invariant from 'assert';

export class StreamTransport {
  _output: stream$Writable;
  _messages: Observable<string>;

  constructor(output: stream$Writable, input: stream$Readable) {
    this._output = output;
    this._messages = splitStream(observeStream(input));
  }
  send(message: string): void {
    invariant(message.indexOf('\n') === -1,
      'StreamTransport.send - unexpected newline in JSON message');
    this._output.write(message + '\n');
  }
  onMessage(): Observable<string> {
    return this._messages;
  }
  close(): void {
  }
}
