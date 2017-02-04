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
import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {logger} from './logger';
import {RUNNING, PAUSED, ENDED} from './constants';
import {Socket} from './Socket';

import type {DeviceInfo, RuntimeStatus} from './types';
import type {AnyTeardown} from '../../commons-node/UniversalDisposable';

const {log} = logger;

/**
 * A connection to a JSContext on the device (or simulator/emulator).  There are 2 channels of
 * Communication provided by this class.
 *
 * 1. Bi-directional communcation for Chrome Protocol (CP) requests and responses.  This is via the
 * `sendCommand` API, which sends a CP request to the target, and returns a promise which resolves
 * with the response when it's received.
 *
 * 2. One-way communication for CP events that are emitted by the target, for example
 * `Debugger.paused` events.  Interested parties can subscribe to these events via the
 * `subscribeToEvents` API, which accepts a callback called when events are emitted from the target.
 */
export class DebuggerConnection {
  _disposables: UniversalDisposable;
  _status: BehaviorSubject<RuntimeStatus>;
  _events: Subject<Object>;
  _connectionId: number;
  _deviceInfo: DeviceInfo;
  _socket: Socket;

  constructor(connectionId: number, deviceInfo: DeviceInfo) {
    this._deviceInfo = deviceInfo;
    this._connectionId = connectionId;
    this._events = new Subject();
    this._status = new BehaviorSubject(RUNNING);
    const {webSocketDebuggerUrl} = deviceInfo;
    this._socket = new Socket(
      webSocketDebuggerUrl,
      this._handleChromeEvent.bind(this),
      () => this._status.next(ENDED),
    );
    this._disposables = new UniversalDisposable(this._socket);
    log(`DebuggerConnection created with device info: ${JSON.stringify(deviceInfo)}`);
  }

  sendCommand(message: Object): Promise<Object> {
    return this._socket.sendCommand(message);
  }

  _handleChromeEvent(message: Object): void {
    switch (message.method) {
      case 'Debugger.paused': {
        this._status.next(PAUSED);
        break;
      }
      case 'Debugger.resumed': {
        this._status.next(RUNNING);
        break;
      }
    }
    this._events.next(message);
  }

  subscribeToEvents(toFrontend: (message: Object) => void): IDisposable {
    return new UniversalDisposable(
      this._events.subscribe(toFrontend),
    );
  }

  isPaused(): boolean {
    return this._status.getValue() === PAUSED;
  }

  getName(): string {
    return this._deviceInfo.title;
  }

  getStatus(): RuntimeStatus {
    return this._status.getValue();
  }

  getStatusChanges(): Observable<RuntimeStatus> {
    return this._status.asObservable();
  }

  getId(): number {
    return this._connectionId;
  }

  onDispose(...teardowns: Array<AnyTeardown>): void {
    for (const teardown of teardowns) {
      this._disposables.add(teardown);
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
