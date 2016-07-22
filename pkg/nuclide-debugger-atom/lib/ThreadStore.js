'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';
import type {
  ThreadItem,
  NuclideThreadData,
} from './types';
import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {EventEmitter} from 'events';
import Constants from './Constants';

export default class ThreadStore {
  _disposables: IDisposable;
  _eventEmitter: EventEmitter;
  _threadMap: Map<number, ThreadItem>;
  _owningProcessId: number;
  _selectedThreadId: number;
  _stopThreadId: number;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._eventEmitter = new EventEmitter();
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
  }

  _handlePayload(payload: Object): void {
    switch (payload.actionType) {
      case Constants.Actions.UPDATE_THREADS:
        this._updateThreads(payload.data.threadData);
        break;
      default:
        return;
    }
  }

  _updateThreads(threadData: NuclideThreadData): void {
    this._threadMap.clear();
    this._owningProcessId = threadData.owningProcessId;
    this._stopThreadId = threadData.stopThreadId;
    this._selectedThreadId = threadData.stopThreadId;
    threadData.threads.forEach(thread =>
      this._threadMap.set(Number(thread.threadId), thread),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
