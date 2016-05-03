'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable as ObservableType} from 'rxjs';

import {Observable, Subscription} from 'rxjs';

/**
 * Observe a stream like stdout or stderr.
 */
export function observeStream(stream: stream$Readable): ObservableType<string> {
  const error = Observable.fromEvent(stream, 'error').flatMap(Observable.throw);
  return Observable
    .fromEvent(stream, 'data')
    .map(data => data.toString())
    .merge(error)
    .takeUntil(Observable.fromEvent(stream, 'end').race(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */
export function splitStream(input: ObservableType<string>): ObservableType<string> {
  return Observable.create(observer => {
    let current: string = '';

    function onEnd() {
      if (current !== '') {
        observer.next(current);
        current = '';
      }
    }

    return input.subscribe(
      value => {
        const lines = (current + value).split('\n');
        current = lines.pop();
        lines.forEach(line => observer.next(line + '\n'));
      },
      error => { onEnd(); observer.error(error); },
      () => { onEnd(); observer.complete(); },
    );
  });
}

export class DisposableSubscription {
  _subscription: rx$ISubscription;

  constructor(subscription: rx$ISubscription) {
    this._subscription = subscription;
  }

  dispose(): void {
    this._subscription.unsubscribe();
  }
}

type TeardownLogic = (() => void) | rx$ISubscription;

export class CompositeSubscription {
  _subscription: Subscription;

  constructor(...subscriptions: Array<TeardownLogic>) {
    this._subscription = new Subscription();
    subscriptions.forEach(sub => {
      this._subscription.add(sub);
    });
  }

  unsubscribe(): void {
    this._subscription.unsubscribe();
  }
}

// TODO: We used to use `stream.buffer(stream.filter(...))` for this but it doesn't work in RxJS 5.
//  See https://github.com/ReactiveX/rxjs/issues/1610
export function bufferUntil<T>(
  stream: Observable<T>,
  condition: (item: T) => boolean,
): Observable<Array<T>> {
  return Observable.create(observer => {
    let buffer = null;
    const flush = () => {
      if (buffer != null) {
        observer.next(buffer);
        buffer = null;
      }
    };
    return stream
      .subscribe(
        x => {
          if (buffer == null) {
            buffer = [];
          }
          buffer.push(x);
          if (condition(x)) {
            flush();
          }
        },
        err => {
          flush();
          observer.error(err);
        },
        () => {
          flush();
          observer.complete();
        },
      );
  });
}
