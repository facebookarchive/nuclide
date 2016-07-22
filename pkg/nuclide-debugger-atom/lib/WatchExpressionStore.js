'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Bridge from './Bridge';
import type {
  EvaluationResult,
  ExpansionResult,
} from './types';
import type Dispatcher from 'flux';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {DebuggerMode} from './DebuggerStore';
import {Actions} from './Constants';
import Rx from 'rxjs';
import invariant from 'assert';
import {DisposableSubscription} from '../../commons-node/stream';

type Expression = string;

export class WatchExpressionStore {
  _bridge: Bridge;
  _disposables: CompositeDisposable;
  _watchExpressions: Map<Expression, Rx.BehaviorSubject<?EvaluationResult>>;
  _previousEvaluationSubscriptions: CompositeDisposable;

  constructor(dispatcher: Dispatcher, bridge: Bridge) {
    this._bridge = bridge;
    this._disposables = new CompositeDisposable();
    this._watchExpressions = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new CompositeDisposable();
    this._disposables.add(this._previousEvaluationSubscriptions);
    const _dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables.add(
      new Disposable(() => {
        dispatcher.unregister(_dispatcherToken);
      }),
    );
  }

  _handlePayload(payload: Object) {
    if (
      payload.actionType === Actions.DEBUGGER_MODE_CHANGE &&
      payload.data === DebuggerMode.PAUSED
    ) {
      this._triggerReevaluation();
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _requestActionFromBridge<T>(
    subject: Rx.BehaviorSubject<T>,
    callback: () => Promise<T>,
  ): IDisposable {
    return new DisposableSubscription(
      Rx.Observable
      .fromPromise(callback())
      .merge(Rx.Observable.never())
      .subscribe(subject),
    );
  }

  _requestExpressionEvaluation(
    expression: Expression,
    subject: Rx.BehaviorSubject<?EvaluationResult>,
    supportRepl: boolean,
  ): void {
    const evaluationDisposable = this._requestActionFromBridge(
      subject,
      () => (
        supportRepl
          ? this._bridge.evaluateConsoleExpression(expression)
          : this._bridge.evaluateWatchExpression(expression)
      ),
    );
    this._previousEvaluationSubscriptions.add(evaluationDisposable);
  }

  /**
   * Returns an observable of child properties for the given objectId.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   */
  getProperties(objectId: string): Rx.Observable<?ExpansionResult> {
    return Rx.Observable.fromPromise(this._bridge.getProperties(objectId));
  }

  evaluateConsoleExpression(expression: Expression): Rx.Observable<?EvaluationResult> {
    return this._evaluateExpression(expression, true /* support REPL */);
  }

  evaluateWatchExpression(expression: Expression): Rx.Observable<?EvaluationResult> {
    return this._evaluateExpression(expression, false /* do not support REPL */);
  }

  /**
   * Returns an observable of evaluation results for a given expression.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   *
   * The supportRepl boolean indicates if we allow evaluation in a non-paused state.
   */
  _evaluateExpression(
    expression: Expression,
    supportRepl: boolean,
  ): Rx.Observable<?EvaluationResult> {
    if (this._watchExpressions.has(expression)) {
      const cachedResult = this._watchExpressions.get(expression);
      invariant(cachedResult);
      return cachedResult;
    }
    const subject = new Rx.BehaviorSubject();
    this._requestExpressionEvaluation(expression, subject, supportRepl);
    this._watchExpressions.set(expression, subject);
    // Expose an observable rather than the raw subject.
    return subject.asObservable();
  }

  _triggerReevaluation(): void {
    // Cancel any outstanding evaluation requests to the Bridge
    this._previousEvaluationSubscriptions.dispose();
    this._previousEvaluationSubscriptions = new CompositeDisposable();
    for (const [expression, subject] of this._watchExpressions) {
      if (subject.observers == null || subject.observers.length === 0) {
        // Nobody is watching this expression anymore.
        this._watchExpressions.delete(expression);
        continue;
      }
      this._requestExpressionEvaluation(expression, subject, false /* no REPL support */);
    }
  }
}
