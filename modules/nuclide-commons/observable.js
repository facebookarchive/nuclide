'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextAnimationFrame = exports.macrotask = exports.microtask = undefined;
exports.splitStream = splitStream;
exports.bufferUntil = bufferUntil;
exports.cacheWhileSubscribed = cacheWhileSubscribed;
exports.diffSets = diffSets;
exports.reconcileSetDiffs = reconcileSetDiffs;
exports.reconcileSets = reconcileSets;
exports.toggle = toggle;
exports.compact = compact;
exports.takeWhileInclusive = takeWhileInclusive;
exports.concatLatest = concatLatest;
exports.throttle = throttle;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */
function splitStream(input) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let current = '';

    function onEnd() {
      if (current !== '') {
        observer.next(current);
        current = '';
      }
    }

    return input.subscribe(value => {
      const lines = (current + value).split('\n');
      current = lines.pop();
      lines.forEach(line => observer.next(line + '\n'));
    }, error => {
      onEnd();
      observer.error(error);
    }, () => {
      onEnd();
      observer.complete();
    });
  });
}

/**
 * Buffers until the predicate matches an element, then opens a new buffer.
 *
 * @param stream - The observable to buffer
 * @param predicate - A function that will be called every time an element is emitted from the
 *     source. The predicate is passed the current element as well as the buffer at that point
 *     (which includes the element). IMPORTANT: DO NOT MUTATE THE BUFFER. It returns a boolean
 *     specifying whether to complete the buffer (and begin a new one).
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* global requestAnimationFrame, cancelAnimationFrame */

function bufferUntil(stream, condition) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let buffer = null;
    const flush = () => {
      if (buffer != null) {
        observer.next(buffer);
        buffer = null;
      }
    };
    return stream.subscribe(x => {
      if (buffer == null) {
        buffer = [];
      }
      buffer.push(x);
      if (condition(x, buffer)) {
        flush();
      }
    }, err => {
      flush();
      observer.error(err);
    }, () => {
      flush();
      observer.complete();
    });
  });
}

/**
 * Caches the latest element as long as there are subscribers. This is useful so that if consumers
 * unsubscribe and then subscribe much later, they do not get an ancient cached value.
 *
 * This is intended to be used with cold Observables. If you have a hot Observable, `cache(1)` will
 * be just fine because the hot Observable will continue producing values even when there are no
 * subscribers, so you can be assured that the cached values are up-to-date.
 */
function cacheWhileSubscribed(input) {
  return input.multicast(() => new _rxjsBundlesRxMinJs.ReplaySubject(1)).refCount();
}

/**
 * Given a stream of sets, return a stream of diffs.
 * **IMPORTANT:** These sets are assumed to be immutable by convention. Don't mutate them!
 */
function diffSets(sets, hash) {
  return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(new Set()), // Always start with no items with an empty set
  sets).pairwise().map(([previous, next]) => ({
    added: (0, (_collection || _load_collection()).setDifference)(next, previous, hash),
    removed: (0, (_collection || _load_collection()).setDifference)(previous, next, hash)
  })).filter(diff => diff.added.size > 0 || diff.removed.size > 0);
}

/**
 * Give a stream of diffs, perform an action for each added item and dispose of the returned
 * disposable when the item is removed.
 */
function reconcileSetDiffs(diffs, addAction, hash_) {
  const hash = hash_ || (x => x);
  const itemsToDisposables = new Map();
  const disposeItem = item => {
    const disposable = itemsToDisposables.get(hash(item));

    if (!(disposable != null)) {
      throw new Error('Invariant violation: "disposable != null"');
    }

    disposable.dispose();
    itemsToDisposables.delete(item);
  };
  const disposeAll = () => {
    itemsToDisposables.forEach(disposable => {
      disposable.dispose();
    });
    itemsToDisposables.clear();
  };

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(diffs.subscribe(diff => {
    // For every item that got added, perform the add action.
    diff.added.forEach(item => {
      itemsToDisposables.set(hash(item), addAction(item));
    });

    // "Undo" the add action for each item that got removed.
    diff.removed.forEach(disposeItem);
  }), disposeAll);
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
function reconcileSets(sets, addAction, hash) {
  const diffs = diffSets(sets, hash);
  return reconcileSetDiffs(diffs, addAction, hash);
}

function toggle(source, toggler) {
  return toggler.distinctUntilChanged().switchMap(enabled => enabled ? source : _rxjsBundlesRxMinJs.Observable.empty());
}

function compact(source) {
  // Flow does not understand the semantics of `filter`
  return source.filter(x => x != null);
}

/**
 * Like `takeWhile`, but includes the first item that doesn't match the predicate.
 */
function takeWhileInclusive(source, predicate) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => source.subscribe(x => {
    observer.next(x);
    if (!predicate(x)) {
      observer.complete();
    }
  }, err => {
    observer.error(err);
  }, () => {
    observer.complete();
  }));
}

// Concatenate the latest values from each input observable into one big list.
// Observables who have not emitted a value yet are treated as empty.
function concatLatest(...observables) {
  // First, tag all input observables with their index.
  const tagged = observables.map((observable, index) => observable.map(list => [list, index]));
  return _rxjsBundlesRxMinJs.Observable.merge(...tagged).scan((accumulator, [list, index]) => {
    accumulator[index] = list;
    return accumulator;
  }, observables.map(x => [])).map(accumulator => [].concat(...accumulator));
}

/**
 * A more sensible alternative to RxJS's throttle/audit/sample operators.
 */
function throttle(source, duration, options_) {
  const options = options_ || {};
  const leading = options.leading !== false;
  let audit;
  switch (typeof duration) {
    case 'number':
      // $FlowFixMe: Add `auditTime()` to Flow defs
      audit = obs => obs.auditTime(duration);
      break;
    case 'function':
      audit = obs => obs.audit(duration);
      break;
    default:
      audit = obs => obs.audit(() => duration);
  }

  if (!leading) {
    return audit(source);
  }

  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const connectableSource = source.publish();
    const throttled = _rxjsBundlesRxMinJs.Observable.merge(connectableSource.take(1), audit(connectableSource.skip(1)));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(throttled.subscribe(observer), connectableSource.connect());
  });
}

const microtask = exports.microtask = _rxjsBundlesRxMinJs.Observable.create(observer => {
  process.nextTick(() => {
    observer.next();
    observer.complete();
  });
});

const macrotask = exports.macrotask = _rxjsBundlesRxMinJs.Observable.create(observer => {
  const timerId = setImmediate(() => {
    observer.next();
    observer.complete();
  });
  return () => {
    clearImmediate(timerId);
  };
});

const nextAnimationFrame = exports.nextAnimationFrame = _rxjsBundlesRxMinJs.Observable.create(observer => {
  if (typeof requestAnimationFrame === 'undefined') {
    throw new Error('This util can only be used in Atom');
  }
  const id = requestAnimationFrame(() => {
    observer.next();
    observer.complete();
  });
  return () => {
    cancelAnimationFrame(id);
  };
});