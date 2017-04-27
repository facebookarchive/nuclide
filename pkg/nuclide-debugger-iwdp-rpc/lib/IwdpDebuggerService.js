/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {connectToPackager} from './connectToPackager';
import {connectToIwdp} from './connectToIwdp';
import {ConnectionMultiplexer} from './ConnectionMultiplexer';
import {logger} from './logger';
import {Observable} from 'rxjs';

import type {ConnectableObservable} from 'rxjs';
import type {DeviceInfo, TargetEnvironment} from './types';
import type {AtomNotification} from '../../nuclide-debugger-base/lib/types';

const {log, logError} = logger;
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
      (level, message) => this._clientCallback.sendAtomNotification(level, message),
    );
    this._disposables = new UniversalDisposable(
      this._clientCallback,
      this._connectionMultiplexer,
    );
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  getAtomNotificationObservable(): ConnectableObservable<AtomNotification> {
    return this._clientCallback.getAtomNotificationObservable().publish();
  }

  attach(targetEnvironment: TargetEnvironment): Promise<string> {
    const connection = connectToTarget(targetEnvironment);
    this._disposables.add(
      connection.subscribe(
        deviceInfo => {
          log(`Got device info: ${JSON.stringify(deviceInfo)}`);
          this._connectionMultiplexer.add(deviceInfo);
        },
        err => {
          logError(`The debug proxy was killed!  Error: ${err}`);
          this._clientCallback.sendAtomNotification(
            'warning',
            err.type === undefined
              ? 'The session has ended because the debug proxy was killed!'
              : err.type,
          );
          // We need to wait for the event loop to run before disposing, otherwise our atom
          // notification never makes it through the service framework.
          process.nextTick(() => this.dispose());
        },
      ),
    );
    return Promise.resolve('IWDP Connected');
  }

  sendCommand(message: string): Promise<void> {
    this._connectionMultiplexer.sendCommand(JSON.parse(message));
    return Promise.resolve();
  }

  dispose(): Promise<void> {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
    return Promise.resolve();
  }
}

function connectToTarget(targetEnvironment: TargetEnvironment): Observable<DeviceInfo> {
  if (targetEnvironment === 'iOS') {
    return connectToIwdp();
  } else if (targetEnvironment === 'Android') {
    return connectToPackager();
  }
  throw new Error(`Unrecognized environment: ${targetEnvironment}`);
}
