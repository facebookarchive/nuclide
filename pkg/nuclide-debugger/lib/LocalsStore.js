'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerDispatcher, {DebuggerAction} from './DebuggerDispatcher';
import type {ExpansionResult} from './types';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {BehaviorSubject, Observable} from 'rxjs';
import {ActionTypes} from './DebuggerDispatcher';

export default class LocalsStore {
  _disposables: IDisposable;
  /**
   * Treat as immutable.
   */
  _locals: BehaviorSubject<ExpansionResult>;

  constructor(dispatcher: DebuggerDispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._locals = new BehaviorSubject([]);
  }

  _handlePayload(payload: DebuggerAction): void {
    switch (payload.actionType) {
      case ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        break;
      case ActionTypes.UPDATE_LOCALS:
        this._handleUpdateLocals(payload.data.locals);
        break;
      default:
        return;
    }
  }

  _handleClearInterface(): void {
    this._locals.next([]);
  }

  _handleUpdateLocals(locals: ExpansionResult): void {
    this._locals.next(locals);
  }

  getLocals(): Observable<ExpansionResult> {
    return this._locals.asObservable();
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
