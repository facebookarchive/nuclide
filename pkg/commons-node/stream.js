'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'event-kit';
import {Observable, ReplaySubject, Subscription} from 'rxjs';

/**
 * Observe a stream like stdout or stderr.
 */
export function observeStream(stream: stream$Readable): Observable<string> {
  return observeRawStream(stream).map(data => data.toString());
}

export function observeRawStream(stream: stream$Readable): Observable<Buffer> {
  const error = Observable.fromEvent(stream, 'error').flatMap(Observable.throw);
  return Observable
    .fromEvent(stream, 'data')
    .merge(error)
    .takeUntil(Observable.fromEvent(stream, 'end'));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */
export function splitStream(input: Observable<string>): Observable<string> {
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

/**
 * Like Observable.prototype.cache(1) except it forgets the cached value when there are no
 * subscribers. This is useful so that if consumers unsubscribe and then subscribe much later, they
 * do not get an ancient cached value.
 *
 * This is intended to be used with cold Observables. If you have a hot Observable, `cache(1)` will
 * be just fine because the hot Observable will continue producing values even when there are no
 * subscribers, so you can be assured that the cached values are up-to-date.
 */
export function cacheWhileSubscribed<T>(input: Observable<T>): Observable<T> {
  return input.multicast(() => new ReplaySubject(1)).refCount();
}

type Diff<T> = {
  added: Set<T>;
  removed: Set<T>;
};

function subtractSet<T>(a: Set<T>, b: Set<T>, hash_?: (v: T) => any): Set<T> {
  if (a.size === 0) {
    return new Set();
  } else if (b.size === 0) {
    return new Set(a);
  }
  const result = new Set();
  const hash = hash_ || (x => x);
  const bHashes = hash_ == null ? b : new Set(Array.from(b.values()).map(hash));
  a.forEach(value => {
    if (!bHashes.has(hash(value))) {
      result.add(value);
    }
  });
  return result;
}

/**
 * Given a stream of sets, return a stream of diffs.
 * **IMPORTANT:** These sets are assumed to be immutable by convention. Don't mutate them!
 */
export function diffSets<T>(sets: Observable<Set<T>>, hash?: (v: T) => any): Observable<Diff<T>> {
  return Observable.concat(
      Observable.of(new Set()), // Always start with no items with an empty set
      sets,
    )
    // $FlowFixMe(matthewwithanm): Type this.
    .pairwise()
    .map(([previous, next]) => ({
      added: subtractSet(next, previous, hash),
      removed: subtractSet(previous, next, hash),
    }))
    .filter(diff => diff.added.size > 0 || diff.removed.size > 0);
}

/**
 * Give a stream of diffs, perform an action for each added item and dispose of the returned
 * disposable when the item is removed.
 */
export function reconcileSetDiffs<T>(
  diffs: Observable<Diff<T>>,
  addAction: (addedItem: T) => IDisposable,
  hash_?: (v: T) => any,
): IDisposable {
  const hash = hash_ || (x => x);
  const itemsToDisposables = new Map();
  const disposeItem = item => {
    const disposable = itemsToDisposables.get(hash(item));
    invariant(disposable != null);
    disposable.dispose();
    itemsToDisposables.delete(item);
  };
  const disposeAll = () => {
    itemsToDisposables.forEach(disposable => { disposable.dispose(); });
    itemsToDisposables.clear();
  };

  return new CompositeDisposable(
    new DisposableSubscription(
      diffs.subscribe(diff => {
        // For every item that got added, perform the add action.
        diff.added.forEach(item => { itemsToDisposables.set(hash(item), addAction(item)); });

        // "Undo" the add action for each item that got removed.
        diff.removed.forEach(disposeItem);
      })
    ),
    new Disposable(disposeAll),
  );
}

/**
 * Given a stream of sets, perform a side-effect whenever an item is added (i.e. is present in a
 * set but wasn't in the previous set in the stream), and a corresponding cleanup when it's removed.
 * **IMPORTANT:** These sets are assumed to be immutable by convention. Don't mutate them!
 *
 * Example:
 *
 *    const dogs = Observable.of(
 *      new Set([{name: 'Winston', id: 1}, {name: 'Penelope', id: 2}]),
 *      new Set([{name: 'Winston', id: 1}]),
 *    );
 *    const disposable = reconcileSets(
 *      dogs,
 *      dog => {
 *        const notification = atom.notifications.addSuccess(
 *          `${dog.name} was added!`,
 *          {dismissable: true},
 *        );
 *        return new Disposable(() => { notification.dismiss(); });
 *      },
 *      dog => dog.id,
 *    );
 *
 * The above code will first add notifications saying "Winston was added!" and "Penelope was
 * added!", then dismiss the "Penelope" notification. Since the Winston object is in the final set
 * of the dogs observable, his notification will remain until `disposable.dispose()` is called, at
 * which point the cleanup for all remaining items will be performed.
 */
export function reconcileSets<T>(
  sets: Observable<Set<T>>,
  addAction: (addedItem: T) => IDisposable,
  hash?: (v: T) => any,
): IDisposable {
  const diffs = diffSets(sets, hash);
  return reconcileSetDiffs(diffs, addAction, hash);
}

export function toggle<T>(
  source: Observable<T>,
  toggler: Observable<boolean>,
): Observable<T> {
  return toggler
    .distinctUntilChanged()
    .switchMap(enabled => (enabled ? source : Observable.empty()));
}

export function compact<T>(source: Observable<?T>): Observable<T> {
  // Flow does not understand the semantics of `filter`
  return (source.filter(x => x != null): any);
}

/**
 * Like `takeWhile`, but includes the first item that doesn't match the predicate.
 */
export function takeWhileInclusive<T>(
  source: Observable<T>,
  predicate: (value: T) => boolean,
): Observable<T> {
  return Observable.create(observer => (
    source.subscribe(
      x => {
        observer.next(x);
        if (!predicate(x)) {
          observer.complete();
        }
      },
      err => { observer.error(err); },
      () => { observer.complete(); },
    )
  ));
}
