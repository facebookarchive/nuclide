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

import fs from 'fs';
import {getLogger} from 'log4js';
import {Deferred} from 'nuclide-commons/promise';
import {getOutputStream} from 'nuclide-commons/process';
import {Observable} from 'rxjs';
import {StreamTransport} from '../../nuclide-rpc';

const PIPE_FD = 3;

export class IpcServerTransport {
  _transport: StreamTransport;

  constructor() {
    this._transport = new StreamTransport(
      fs.createWriteStream('', {fd: PIPE_FD}),
      fs.createReadStream('', {fd: PIPE_FD}),
    );
  }

  send(message: string): void {
    this._transport.send(message);
  }

  onMessage(): Observable<string> {
    return this._transport.onMessage();
  }

  close(): void {
    this._transport.close();
  }

  isClosed(): boolean {
    return this._transport.isClosed();
  }
}

export class IpcClientTransport {
  _transport: Deferred<StreamTransport>;
  _subscription: rxjs$Subscription;

  constructor(processStream: Observable<child_process$ChildProcess>) {
    this._transport = new Deferred();
    this._subscription = processStream
      .do(process =>
        this._transport.resolve(
          new StreamTransport(process.stdio[PIPE_FD], process.stdio[PIPE_FD]),
        ),
      )
      .switchMap(process => getOutputStream(process))
      .subscribe({
        error: err => {
          this._handleError(err);
        },
      });
  }

  _handleError(err: Error) {
    this._transport.reject(err);
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
    this._transport.promise.then(transport => {
      transport.send(message);
    });
  }

  onMessage(): Observable<string> {
    return Observable.fromPromise(this._transport.promise).switchMap(
      transport => transport.onMessage(),
    );
  }

  close() {
    this._subscription.unsubscribe();
    this._transport.reject(Error('Transport closed'));
  }

  isClosed(): boolean {
    // $FlowFixMe: Add to rxjs defs
    return this._subscription.closed;
  }
}
