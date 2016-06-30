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
import type {Locals} from './types';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import Rx from 'rxjs';
import Constants from './Constants';

export default class LocalsStore {
  _disposables: IDisposable;
  /**
   * Treat as immutable.
   */
  _locals: Rx.BehaviorSubject<Locals>;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      })
    );
    this._locals = new Rx.BehaviorSubject([]);
  }

  _handlePayload(payload: Object): void {
    switch (payload.actionType) {
      case Constants.Actions.UPDATE_LOCALS:
        this._handleUpdateLocals(payload.data.locals);
        break;
      default:
        return;
    }
  }

  _handleUpdateLocals(locals: Locals): void {
    this._locals.next(locals);
  }

  getLocals(): Rx.Observable<Locals> {
    return this._locals.asObservable();
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
