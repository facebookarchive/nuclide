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
import type {ExpansionResult, EvaluationResult} from './Bridge';

import {
  CompositeDisposable,
} from 'atom';
import Rx from 'rxjs';
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
    this._disposables.add(this._previousEvaluationSubscriptions);
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _requestActionFromBridge<T>(
    subject: Rx.BehaviorSubject<T>,
    callback: () => Promise<T>,
  ): IDisposable {
    return new DisposableSubscription(
      incompleteObservableFromPromise(callback()).subscribe(subject)
    );
  }

  _requestExpressionEvaluation(
    expression: Expression,
    subject: Rx.BehaviorSubject<?EvaluationResult>,
  ): void {
    const evaluationDisposable = this._requestActionFromBridge(
      subject,
      () => this._bridge.evaluateOnSelectedCallFrame(expression),
    );
    this._previousEvaluationSubscriptions.add(evaluationDisposable);
  }

  _requestPropertiesForObjectId(
    objectId: string,
    subject: Rx.BehaviorSubject<?ExpansionResult>,
  ): void {
    this._requestActionFromBridge(
      subject,
      () => this._bridge.getProperties(objectId),
    );
  }

  /**
   * Returns an observable of child properties for the given objectId.
   * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
   */
  getProperties(objectId: string): Rx.Observable<?ExpansionResult> {
    const subject = new Rx.BehaviorSubject();
    this._requestPropertiesForObjectId(objectId, subject);
    return subject.asObservable();
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
      if (subject.observers == null || subject.observers.length === 0) {
        // Nobody is watching this expression anymore.
        this._watchExpressions.delete(expression);
        continue;
      }
      this._requestExpressionEvaluation(expression, subject);
    }
  }
}
