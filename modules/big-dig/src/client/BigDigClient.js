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

import type {Observable} from 'rxjs';
import type {NuclideSocket} from '../socket/NuclideSocket';
import type {XhrConnectionHeartbeat} from './XhrConnectionHeartbeat';

import {Subject} from 'rxjs';
import {getLogger} from 'log4js';

/**
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
export class BigDigClient {
  _logger: log4js$Logger;
  _tagToSubject: Map<string, Subject<string>>;
  _transport: NuclideSocket;

  constructor(nuclideSocketTransport: NuclideSocket) {
    this._logger = getLogger();
    this._transport = nuclideSocketTransport;
    this._tagToSubject = new Map();

    const observable = nuclideSocketTransport.onMessage();
    observable.subscribe({
      // Must use arrow function so that `this` is bound correctly.
      next: message => {
        const index = message.indexOf('\0');
        const tag = message.substring(0, index);
        const subject = this._tagToSubject.get(tag);
        if (subject != null) {
          const body = message.substring(index + 1);
          subject.next(body);
        } else {
          this._logger.warn(`No one listening for tag "${tag}".`);
        }
      },
      error(err) {
        this._logger.error('Error received in ConnectionWrapper', err);
      },
      complete() {
        this._logger.error('ConnectionWrapper completed()?');
      },
    });
  }

  isClosed(): boolean {
    return this._transport.isClosed();
  }

  onClose(callback: () => mixed): IDisposable {
    return this._transport.onClose(callback);
  }

  close(): void {
    this._transport.close();
  }

  sendMessage(tag: string, body: string) {
    this._transport.send(`${tag}\0${body}`);
  }

  onMessage(tag: string): Observable<string> {
    let subject = this._tagToSubject.get(tag);
    if (subject == null) {
      subject = new Subject();
      this._tagToSubject.set(tag, subject);
    }
    return subject.asObservable();
  }

  getHeartbeat(): XhrConnectionHeartbeat {
    return this._transport.getHeartbeat();
  }

  getAddress(): string {
    return this._transport.getAddress();
  }

  dispose() {
    this.close();
  }
}
