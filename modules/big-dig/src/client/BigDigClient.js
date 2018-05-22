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
import type {ReliableSocket} from '../socket/ReliableSocket';
import type {XhrConnectionHeartbeat} from './XhrConnectionHeartbeat';
import type {Proxy} from '../services/tunnel/Proxy';

import {Subject} from 'rxjs';
import {getLogger} from 'log4js';

import {createTunnel} from '../services/tunnel/tunnel';

/**
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
export class BigDigClient {
  _logger: log4js$Logger;
  _tagToSubject: Map<string, Subject<string>>;
  _transport: ReliableSocket;

  constructor(reliableSocketTransport: ReliableSocket) {
    this._logger = getLogger();
    this._transport = reliableSocketTransport;
    this._tagToSubject = new Map();

    const observable = reliableSocketTransport.onMessage();
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

  async createTunnel(localPort: number, remotePort: number): Promise<Proxy> {
    const transportAdapter = {
      onMessage: () => {
        return this.onMessage('tunnel');
      },
      send: (message: string) => {
        this.sendMessage('tunnel', message);
      },
    };

    return createTunnel(localPort, remotePort, transportAdapter);
  }

  close(): void {
    this._logger.info('close called');
    this._transport.close();
  }

  sendMessage(tag: string, body: string) {
    const message = `${tag}\0${body}`;
    if (this.isClosed()) {
      this._logger.warn(
        `Attempting to send message to ${this.getAddress()} on closed BigDigClient: ${message}`,
      );
      return;
    }
    this._transport.send(message);
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
}
