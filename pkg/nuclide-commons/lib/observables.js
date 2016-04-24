'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Rx from 'rxjs';

/**
 * Like `Rx.Observable.fromPromise`, but the resulting Observable sequence does not automatically
 * complete once the promise resolves.
 */
// $FlowIssue Rx.Observable.never should not influence merged type
export function incompleteObservableFromPromise<T>(promise: Promise<T>): Rx.Observable<T> {
  return Rx.Observable
      .fromPromise(promise)
      .merge(Rx.Observable.never());
}
