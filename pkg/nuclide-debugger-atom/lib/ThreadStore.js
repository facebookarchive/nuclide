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
} from './types';
import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {EventEmitter} from 'events';

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

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      default:
        return;
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
