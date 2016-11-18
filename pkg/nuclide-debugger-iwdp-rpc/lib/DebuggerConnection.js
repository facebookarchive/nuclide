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
import WS from 'ws';
import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {createWebSocketListener} from './createWebSocketListener';
import {logger} from './logger';
import {RUNNING, PAUSED} from './constants';
import invariant from 'assert';

import type {IosDeviceInfo, RuntimeStatus} from './types';

type Id = number;
type onResponseReceived = (response: Object) => void;

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
  _webSocket: ?WS;
  _webSocketPromise: Promise<WS>;
  _disposables: UniversalDisposable;
  _status: BehaviorSubject<RuntimeStatus>;
  _pendingRequests: Map<Id, onResponseReceived>;
  _id: number;
  _events: Subject<Object>;
  _connectionId: number;
  _iosDeviceInfo: IosDeviceInfo;

  constructor(connectionId: number, iosDeviceInfo: IosDeviceInfo) {
    this._iosDeviceInfo = iosDeviceInfo;
    this._connectionId = connectionId;
    this._webSocket = null;
    this._events = new Subject();
    this._id = 0;
    this._pendingRequests = new Map();
    this._status = new BehaviorSubject(RUNNING);
    const {webSocketDebuggerUrl} = iosDeviceInfo;
    const webSocket = new WS(webSocketDebuggerUrl);
    // It's not enough to just construct the websocket -- we have to also wait for it to open.
    this._webSocketPromise = new Promise(resolve => webSocket.on('open', () => resolve(webSocket)));
    const socketMessages: Observable<string> = createWebSocketListener(webSocket);
    this._disposables = new UniversalDisposable(
      () => webSocket.close(),
      socketMessages.subscribe(message => this._handleSocketMessage(message)),
    );
    log(`DebuggerConnection created with device info: ${JSON.stringify(iosDeviceInfo)}`);
  }

  async sendCommand(message: Object): Promise<Object> {
    if (this._webSocket == null) {
      this._webSocket = await this._webSocketPromise;
    }
    const webSocket = this._webSocket;
    if (message.id == null) {
      message.id = this._id++;
    }
    return new Promise(resolve => {
      this._pendingRequests.set(message.id, resolve);
      webSocket.send(JSON.stringify(message));
    });
  }

  _handleSocketMessage(message: string): void {
    const obj = JSON.parse(message);
    if (isEvent(obj)) {
      this._handleChromeEvent(obj);
    } else {
      const resolve = this._pendingRequests.get(obj.id);
      invariant(resolve != null, `Got response for a request that wasn't sent: ${message}`);
      this._pendingRequests.delete(obj.id);
      resolve(obj);
    }
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
    return this._iosDeviceInfo.title;
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

  dispose(): void {
    this._disposables.dispose();
  }
}

function isEvent(obj: Object): boolean {
  return obj.id == null;
}
