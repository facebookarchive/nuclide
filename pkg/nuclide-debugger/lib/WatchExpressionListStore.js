'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Expression,
  EvaluatedExpression,
  EvaluatedExpressionList,
} from './types';
import type {WatchExpressionStore} from './WatchExpressionStore';
import type {Dispatcher} from 'flux';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import Rx from 'rxjs';
import Constants from './Constants';
import {DebuggerMode} from './DebuggerStore';

export class WatchExpressionListStore {
  _watchExpressionStore: WatchExpressionStore;
  _disposables: IDisposable;
  /**
   * Treat the underlying EvaluatedExpressionList as immutable.
   */
  _watchExpressions: Rx.BehaviorSubject<EvaluatedExpressionList>;

  constructor(watchExpressionStore: WatchExpressionStore, dispatcher: Dispatcher) {
    this._watchExpressionStore = watchExpressionStore;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._watchExpressions = new Rx.BehaviorSubject([]);
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.ADD_WATCH_EXPRESSION:
        this._addWatchExpression(payload.data.expression);
        break;
      case Constants.Actions.REMOVE_WATCH_EXPRESSION:
        this._removeWatchExpression(payload.data.index);
        break;
      case Constants.Actions.UPDATE_WATCH_EXPRESSION:
        this._updateWatchExpression(payload.data.index, payload.data.newExpression);
        break;
      case Constants.Actions.DEBUGGER_MODE_CHANGE:
        if (payload.data === DebuggerMode.STARTING) {
          this._refetchWatchSubscriptions();
        }
        break;
      default:
        return;
    }
  }

  _getExpressionEvaluationFor(expression: Expression): EvaluatedExpression {
    return {
      expression,
      value: this._watchExpressionStore.evaluateWatchExpression(expression),
    };
  }

  getWatchExpressions(): Rx.Observable<EvaluatedExpressionList> {
    return this._watchExpressions.asObservable();
  }

  _addWatchExpression(expression: Expression): void {
    this._watchExpressions.next([
      ...this._watchExpressions.getValue(),
      this._getExpressionEvaluationFor(expression),
    ]);
  }

  _removeWatchExpression(index: number): void {
    const watchExpressions = this._watchExpressions.getValue().slice();
    watchExpressions.splice(index, 1);
    this._watchExpressions.next(watchExpressions);
  }

  _updateWatchExpression(index: number, newExpression: Expression): void {
    const watchExpressions = this._watchExpressions.getValue().slice();
    watchExpressions[index] = this._getExpressionEvaluationFor(newExpression);
    this._watchExpressions.next(watchExpressions);
  }

  _refetchWatchSubscriptions(): void {
    const watchExpressions = this._watchExpressions.getValue().slice();
    const refetchedWatchExpressions = watchExpressions.map(({expression}) => {
      return this._getExpressionEvaluationFor(expression);
    });
    this._watchExpressions.next(refetchedWatchExpressions);
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
