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

import {getLogger} from 'log4js';
import {Deferred} from 'nuclide-commons/promise';
import {getOutputStream} from 'nuclide-commons/process';
import {Observable} from 'rxjs';

// Due to https://github.com/nodejs/node/issues/3145 (fixed in 7.5.0+),
// Node IPC is currently O(N^2) in the message size.
// Performance starts degrading significantly after 4096 bytes.
// We'll break each message into chunks of 4096 bytes and prefix each with a 0/1
// depending on whether or not the chunk marks the end of a message.
const CHUNK_SIZE = 4096;

class ChunkedMessageBuffer {
  _callback: string => mixed;
  _buffer: string;

  constructor(callback: string => mixed) {
    this._callback = callback;
    this._buffer = '';
  }

  write(data: ?string): void {
    if (data == null) {
      this._callback(this._buffer);
      this._buffer = '';
    } else {
      this._buffer += data;
    }
  }

  static writeChunks(data: string, callback: mixed => mixed) {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      callback(data.substr(i, CHUNK_SIZE));
    }
    // IPC preserves object types, so write out a "null" as a sentinel.
    callback(null);
  }
}

export class IpcServerTransport {
  constructor() {}

  send(message: string): void {
    ChunkedMessageBuffer.writeChunks(message, data => {
      // $FlowIgnore
      process.send(data);
    });
  }

  onMessage(): Observable<string> {
    return Observable.create(observer => {
      const buffer = new ChunkedMessageBuffer(data => {
        observer.next(data);
      });
      process.on('message', data => {
        buffer.write(data);
      });
    });
  }

  close(): void {
    // $FlowIgnore
    process.disconnect();
  }

  isClosed(): boolean {
    return !process.connected;
  }
}

export class IpcClientTransport {
  _process: Deferred<child_process$ChildProcess>;
  _subscription: rxjs$Subscription;

  constructor(processStream: Observable<child_process$ChildProcess>) {
    this._process = new Deferred();
    this._subscription = processStream
      .do(process => this._process.resolve(process))
      .switchMap(process => getOutputStream(process))
      .subscribe({
        error: err => {
          this._handleError(err);
        },
      });
  }

  _handleError(err: Error) {
    this._process.reject(err);
    getLogger().fatal('Nuclide RPC process crashed', err);
    atom.notifications.addError('Local RPC process crashed!', {
      description:
        'The local Nuclide RPC process crashed. Please reload Atom to continue.',
      detail: String(err),
      dismissable: true,
      buttons: [
        {
          text: 'Reload Atom',
          className: 'icon icon-zap',
          onDidClick() {
            atom.reload();
          },
        },
      ],
    });
  }

  send(message: string): void {
    this._process.promise.then(process => {
      ChunkedMessageBuffer.writeChunks(message, data => {
        // $FlowIgnore
        process.send(data);
      });
    });
  }

  onMessage(): Observable<string> {
    return Observable.create(observer => {
      this._process.promise.then(
        process => {
          const buffer = new ChunkedMessageBuffer(data => {
            observer.next(data);
          });
          process.on('message', data => {
            buffer.write(data);
          });
        },
        err => observer.error(err),
      );
      // If the process prematurely errors or completes, we're in deep trouble anyway.
      // So teardown here isn't extremely important.
    });
  }

  close() {
    this._subscription.unsubscribe();
    this._process.reject(Error('Transport closed'));
  }

  isClosed(): boolean {
    // $FlowFixMe: Add to rxjs defs
    return this._subscription.closed;
  }
}
