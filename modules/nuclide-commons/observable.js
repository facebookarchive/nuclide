'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingletonExecutor = exports.PromiseCancelledError = exports.nextAnimationFrame = exports.macrotask = exports.microtask = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
exports.completingSwitchMap = completingSwitchMap;
exports.fastDebounce = fastDebounce;
exports.toCancellablePromise = toCancellablePromise;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('./collection');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('./debounce'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream (if includeNewlines is true).
 * Sends any non-newline terminated data before closing.
 * Does not ensure a trailing newline.
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

// NOTE: Custom operators that require arguments should be written as higher-order functions. That
// is, they should accept the arguments and return a function that accepts only an observable. This
// allows a nice ergonomic way of using them with '.let()' (or a potential future pipe operator):
//
//     const makeExciting = (excitementLevel: number = 1) =>
//       (source: Observable<string>) =>
//         source.map(x => x + '!'.repeat(excitementLevel));
//
//     Observable.of('hey', 'everybody')
//       .let(makeExciting())
//       .subscribe(x => console.log(x));

function splitStream(input, includeNewlines = true) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let current = '';

    function onEnd() {
      if (current !== '') {
        observer.next(current);
        current = '';
      }
    }

    return input.subscribe(value => {
      const lines = value.split('\n');
      lines[0] = current + lines[0];
      current = lines.pop();
      if (includeNewlines) {
        lines.forEach(line => observer.next(line + '\n'));
      } else {
        lines.forEach(line => observer.next(line));
      }
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
function bufferUntil(condition) {
  return stream => _rxjsBundlesRxMinJs.Observable.create(observer => {
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
function diffSets(hash) {
  return sets => _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(new Set()), // Always start with no items with an empty set
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
  const diffs = sets.let(diffSets(hash));
  return reconcileSetDiffs(diffs, addAction, hash);
}

function toggle(toggler) {
  return source => toggler.distinctUntilChanged().switchMap(enabled => enabled ? source : _rxjsBundlesRxMinJs.Observable.empty());
}

function compact(source) {
  // Flow does not understand the semantics of `filter`
  return source.filter(x => x != null);
}

/**
 * Like `takeWhile`, but includes the first item that doesn't match the predicate.
 */
function takeWhileInclusive(predicate) {
  return source => _rxjsBundlesRxMinJs.Observable.create(observer => source.subscribe(x => {
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
function throttle(duration, options_) {
  return source => {
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
  };
}

/**
 * Returns a new function which takes an `observable` and returns
 * `observable.switchMap(project)`, except that it completes
 * when the outer observable completes.
 *
 * Example:
 *
 *   Observable.of(1)
 *     .let(completingSwitchMap(x => Observable.never()))
 *
 * ends up returning an Observable that completes immediately.
 * With a regular switchMap, this would never terminate.
 */
function completingSwitchMap(project) {
  // An alternative implementation is to materialize the input observable,
  // but this avoids the creation of extra notifier objects.
  const completedSymbol = Symbol('completed');
  return observable => _rxjsBundlesRxMinJs.Observable.concat(observable, _rxjsBundlesRxMinJs.Observable.of(completedSymbol)).switchMap((input, index) => {
    if (input === completedSymbol) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return project(input, index);
  });
}

/**
 * RxJS's debounceTime is actually fairly inefficient:
 * on each event, it always clears its interval and [creates a new one][1].
 * Until this is fixed, this uses our debounce implementation which
 * reuses a timeout and just sets a timestamp when possible.
 *
 * This may seem like a micro-optimization but we often use debounces
 * for very hot events, like keypresses. Exceeding the frame budget can easily lead
 * to increased key latency!
 *
 * [1]: https://github.com/ReactiveX/rxjs/blob/master/src/operators/debounceTime.ts#L106
 */
function fastDebounce(delay) {
  return observable => _rxjsBundlesRxMinJs.Observable.create(observer => {
    const debouncedNext = (0, (_debounce || _load_debounce()).default)(x => observer.next(x), delay);
    const subscription = observable.subscribe(debouncedNext, observer.error.bind(observer), observer.complete.bind(observer));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription, debouncedNext);
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

/**
 * Thrown when a CancellablePromise is cancelled().
 */
class PromiseCancelledError extends Error {
  constructor() {
    super();
    this.name = 'PromiseCancelledError';
  }
}

exports.PromiseCancelledError = PromiseCancelledError; // Given an observable, convert to a Promise (thereby subscribing to the Observable)
// and return back a cancellation function as well.
// If the cancellation function is called before the returned promise resolves,
// then unsubscribe from the underlying Promise and have the returned Promise throw.
// If the cancellation function is called after the returned promise resolves,
// then it does nothing.

function toCancellablePromise(observable) {
  // Assign a dummy value to keep flow happy
  let cancel = () => {};

  const promise = new Promise((resolve, reject) => {
    // Stolen from Rx.js toPromise.js
    let value;
    const subscription = observable.subscribe(v => {
      value = v;
    }, reject, () => {
      resolve(value);
    });

    // Attempt cancellation of both the subscription and the promise.
    // Do not let one failure prevent the other from succeeding.
    cancel = () => {
      try {
        subscription.unsubscribe();
      } catch (e) {}
      try {
        reject(new PromiseCancelledError());
      } catch (e) {}
    };
  });

  return { promise, cancel };
}

// Executes tasks. Ensures that at most one task is running at a time.
// This class is handy for expensive tasks like processes, provided
// you never want the result of a previous task after a new task has started.
class SingletonExecutor {
  constructor() {
    this._currentTask = null;
  }

  // Executes(subscribes to) the task.
  // Will terminate(unsubscribe) to any previously executing task.
  // Subsequent executes() will terminate this task if called before
  // this task completes.
  execute(createTask) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Kill any previously running processes
      _this.cancel();

      // Start a new process
      const task = toCancellablePromise(createTask);
      _this._currentTask = task;

      // Wait for the process to complete or be cancelled ...
      try {
        return yield task.promise;
      } finally {
        // ... and always clean up if we haven't been cancelled already.
        if (task === _this._currentTask) {
          _this._currentTask = null;
        }
      }
    })();
  }

  isExecuting() {
    return this._currentTask != null;
  }

  // Cancells any currently executing tasks.
  cancel() {
    if (this._currentTask != null) {
      this._currentTask.cancel();
      this._currentTask = null;
    }
  }
}
exports.SingletonExecutor = SingletonExecutor;