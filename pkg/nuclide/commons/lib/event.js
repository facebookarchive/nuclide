'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {EventEmitter} from 'events';

import {Disposable} from 'event-kit';
import {Observable} from 'rx';

/**
 * Add an event listener an return a disposable for removing it. Note that this function assumes
 * node EventEmitter semantics: namely, that adding the same combination of eventName and callback
 * adds a second listener.
 */
export function attachEvent(
  emitter: EventEmitter,
  eventName: string,
  callback: Function
): Disposable {
  emitter.addListener(eventName, callback);
  return new Disposable(() => {
    emitter.removeListener(eventName, callback);
  });
}

type SubscribeCallback<T> = (item: T) => mixed;
type SubscribeFunction<T> = (callback: SubscribeCallback<T>) => IDisposable;

export function observableFromSubscribeFunction<T>(fn: SubscribeFunction<T>): Observable<T> {
  return Observable.create(observer => fn(observer.onNext.bind(observer)));
}
