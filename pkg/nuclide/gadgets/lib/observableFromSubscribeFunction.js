'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Rx from 'rx';

type SubscribeCallback = (...args: Array<mixed>) => mixed;
type SubscribeFunction = (callback: SubscribeCallback) => atom$IDisposable;

export default function observableFromSubscribeFunction(fn: SubscribeFunction): Rx.Observable {
  return new Rx.Observable.create(observer => fn((...args) => observer.onNext(...args)));
}
