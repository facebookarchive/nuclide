'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {connectToIwdp} from './connectToIwdp';
import {ConnectionMultiplexer} from './ConnectionMultiplexer';
import {logger} from './logger';

import type {ConnectableObservable} from 'rxjs';

const {log} = logger;
let lastServiceObjectDispose = null;

import {ClientCallback} from '../../nuclide-debugger-common/lib/main';

export class IwdpDebuggerService {
  _clientCallback: ClientCallback;
  _disposables: UniversalDisposable;
  _connectionMultiplexer: ConnectionMultiplexer;

  constructor() {
    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._clientCallback = new ClientCallback();
    this._connectionMultiplexer = new ConnectionMultiplexer(
      message => this._clientCallback.sendChromeMessage(JSON.stringify(message)),
    );
    this._disposables = new UniversalDisposable(
      this._clientCallback,
      this._connectionMultiplexer,
    );
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  attach(): Promise<string> {
    this._disposables.add(
      connectToIwdp().subscribe(deviceInfo => {
        log(`Got device info: ${JSON.stringify(deviceInfo)}`);
        this._connectionMultiplexer.add(deviceInfo);
      }),
    );
    return Promise.resolve('IWDP Connected');
  }

  sendCommand(message: string): Promise<void> {
    this._connectionMultiplexer.sendCommand(JSON.parse(message));
    return Promise.resolve();
  }

  dispose(): Promise<void> {
    this._disposables.dispose();
    return Promise.resolve();
  }
}
