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
import type {EvaluationResult} from './Bridge';

import {
  CompositeDisposable,
  Disposable,
} from 'atom';
import Rx from '@reactivex/rxjs';
import invariant from 'assert';
import {DisposableSubscription, observables} from '../../nuclide-commons';
const {incompleteObservableFromPromise} = observables;

type Expression = string;

export class WatchExpressionStore {
  _bridge: Bridge;
  _disposables: CompositeDisposable;
  _watchExpressions: Map<Expression, Rx.BehaviorSubject<?EvaluationResult>>;
  _previousEvaluationSubscriptions: CompositeDisposable;

  constructor(bridge: Bridge) {
    this._bridge = bridge;
    this._disposables = new CompositeDisposable();
    this._watchExpressions = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new CompositeDisposable();
    this._disposables.add(new Disposable(() => {
      this._previousEvaluationSubscriptions.dispose();
    }));
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _requestExpressionEvaluation(
    expression: Expression,
    subject: Rx.BehaviorSubject<?EvaluationResult>,
  ): void {
    this._previousEvaluationSubscriptions.add(
      new DisposableSubscription(
        incompleteObservableFromPromise(
          this._bridge.evaluateOnSelectedCallFrame(expression)
        ).subscribe(subject)
      )
    );
  }

  /**
   * Returns an observable of evaluation results for a given expression.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   */
  evaluateWatchExpression(expression: Expression): Rx.Observable<?EvaluationResult> {
    if (this._watchExpressions.has(expression)) {
      const cachedResult = this._watchExpressions.get(expression);
      invariant(cachedResult);
      return cachedResult;
    }
    const subject = new Rx.BehaviorSubject();
    this._requestExpressionEvaluation(expression, subject);
    this._watchExpressions.set(expression, subject);
    // Expose an observable rather than the raw subject.
    return subject.asObservable();
  }

  triggerReevaluation(): void {
    // Cancel any outstanding evaluation requests to the Bridge
    this._previousEvaluationSubscriptions.dispose();
    this._previousEvaluationSubscriptions = new CompositeDisposable();
    for (const [expression, subject] of this._watchExpressions) {
      if (subject.observers.length === 0) {
        // Nobody is watching this expression anymore.
        this._watchExpressions.delete(expression);
        continue;
      }
      this._requestExpressionEvaluation(expression, subject);
    }
  }
}
