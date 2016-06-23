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

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import Constants from './Constants';

type CallstackItem = {
  name: string;
  location: {
    path: string;
    line: number;
    column?: number;
  };
};
export type Callstack = Array<CallstackItem>;

export default class CallstackStore {
  _disposables: IDisposable;
  _callstack: ?Callstack;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      })
    );
    this._callstack = null;
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.UPDATE_CALLSTACK:
        this._updateCallstack(payload.data.callstack);
        break;
      default:
        return;
    }
  }

  _updateCallstack(callstack: Callstack): void {
    this._callstack = callstack;
  }
  getCallstack(): ?Callstack {
    return this._callstack;
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
