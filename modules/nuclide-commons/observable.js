"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
exports.mergeUntilAnyComplete = mergeUntilAnyComplete;
exports.fastDebounce = fastDebounce;
exports.fromAbortablePromise = fromAbortablePromise;
exports.toAbortablePromise = toAbortablePromise;
exports.takeUntilAbort = takeUntilAbort;
exports.poll = poll;
exports.SingletonExecutor = exports.nextAnimationFrame = exports.macrotask = exports.microtask = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("./UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _domexception() {
  const data = _interopRequireDefault(require("domexception"));

  _domexception = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AbortController() {
  const data = _interopRequireDefault(require("./AbortController"));

  _AbortController = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("./collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("./debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Note: DOMException is usable in Chrome but not in Node.

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream (if includeNewlines is true).
 * Sends any non-newline terminated data before closing.
 * Does not ensure a trailing newline.
 */
function splitStream(input, includeNewlines = true) {
  return _RxMin.Observable.create(observer => {
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
  return stream => _RxMin.Observable.create(observer => {
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
  return input.multicast(() => new _RxMin.ReplaySubject(1)).refCount();
}

/**
 * Given a stream of sets, return a stream of diffs.
 * **IMPORTANT:** These sets are assumed to be immutable by convention. Don't mutate them!
 */
function diffSets(hash) {
  return sets => _RxMin.Observable.concat(_RxMin.Observable.of(new Set()), // Always start with no items with an empty set
  sets).pairwise().map(([previous, next]) => ({
    added: (0, _collection().setDifference)(next, previous, hash),
    removed: (0, _collection().setDifference)(previous, next, hash)
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
      throw new Error("Invariant violation: \"disposable != null\"");
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

  return new (_UniversalDisposable().default)(diffs.subscribe(diff => {
    // For every item that got added, perform the add action.
    diff.added.forEach(item => {
      itemsToDisposables.set(hash(item), addAction(item));
    }); // "Undo" the add action for each item that got removed.

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
  return source => toggler.distinctUntilChanged().switchMap(enabled => enabled ? source : _RxMin.Observable.empty());
}

function compact(source) {
  // Flow does not understand the semantics of `filter`
  return source.filter(x => x != null);
}
/**
 * Like `takeWhile`, but includes the first item that doesn't match the predicate.
 */


function takeWhileInclusive(predicate) {
  return source => _RxMin.Observable.create(observer => source.subscribe(x => {
    observer.next(x);

    if (!predicate(x)) {
      observer.complete();
    }
  }, err => {
    observer.error(err);
  }, () => {
    observer.complete();
  }));
} // Concatenate the latest values from each input observable into one big list.
// Observables who have not emitted a value yet are treated as empty.


function concatLatest(...observables) {
  // First, tag all input observables with their index.
  const tagged = observables.map((observable, index) => observable.map(list => [list, index]));
  return _RxMin.Observable.merge(...tagged).scan((accumulator, [list, index]) => {
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

    return _RxMin.Observable.create(observer => {
      const connectableSource = source.publish();

      const throttled = _RxMin.Observable.merge(connectableSource.take(1), audit(connectableSource.skip(1)));

      return new (_UniversalDisposable().default)(throttled.subscribe(observer), connectableSource.connect());
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
  return observable => _RxMin.Observable.concat(observable, _RxMin.Observable.of(completedSymbol)).switchMap((input, index) => {
    if (input === completedSymbol) {
      return _RxMin.Observable.empty();
    }

    return project(input, index);
  });
}
/**
 * Returns a new observable consisting of the merged values from the passed
 * observables and completes when the first inner observable completes.
 */


function mergeUntilAnyComplete(...observables) {
  const notifications = _RxMin.Observable.merge(...observables.map(o => o.materialize())); // $FlowFixMe add dematerialize to rxjs Flow types


  return notifications.dematerialize();
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
  return observable => _RxMin.Observable.create(observer => {
    const debouncedNext = (0, _debounce().default)(x => observer.next(x), delay);
    const subscription = observable.subscribe(debouncedNext, observer.error.bind(observer), observer.complete.bind(observer));
    return new (_UniversalDisposable().default)(subscription, debouncedNext);
  });
}

const microtask = _RxMin.Observable.create(observer => {
  process.nextTick(() => {
    observer.next();
    observer.complete();
  });
});

exports.microtask = microtask;

const macrotask = _RxMin.Observable.create(observer => {
  const timerId = setImmediate(() => {
    observer.next();
    observer.complete();
  });
  return () => {
    clearImmediate(timerId);
  };
});

exports.macrotask = macrotask;

const nextAnimationFrame = _RxMin.Observable.create(observer => {
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
 * Creates an Observable around an abortable promise.
 * Unsubscriptions are forwarded to the AbortController as an `abort()`.
 * Example usage (with an abortable fetch):
 *
 *   fromPromise(signal => fetch(url, {...options, signal}))
 *     .switchMap(....)
 *
 * Note that this can take a normal `() => Promise<T>` too
 * (in which case this acts as just a plain `Observable.defer`).
 */


exports.nextAnimationFrame = nextAnimationFrame;

function fromAbortablePromise(func) {
  return _RxMin.Observable.create(observer => {
    let completed = false;
    const abortController = new (_AbortController().default)();
    func(abortController.signal).then(value => {
      completed = true;
      observer.next(value);
      observer.complete();
    }, error => {
      completed = true;
      observer.error(error);
    });
    return () => {
      if (!completed) {
        abortController.abort(); // If the promise adheres to the spec, it should throw.
        // The error will be captured above but go into the void.
      }
    };
  });
}
/**
 * Converts an observable + AbortSignal into a cancellable Promise,
 * which rejects with an AbortError DOMException on abort.
 * Useful when writing the internals of a cancellable promise.
 *
 * Usage:
 *
 *   function abortableFunction(arg1: blah, options?: {signal?: AbortSignal}): Promise {
 *     return toPromise(
 *       observableFunction(arg1, options),
 *       options && options.signal,
 *     );
 *   }
 *
 * Could eventually be replaced by Observable.first if
 * https://github.com/whatwg/dom/issues/544 goes through.
 *
 * It's currently unclear if this should be usable with let/pipe:
 * https://github.com/ReactiveX/rxjs/issues/3445
 */


function toAbortablePromise(observable, signal) {
  if (signal == null) {
    return observable.toPromise();
  }

  if (signal.aborted) {
    return Promise.reject((0, _domexception().default)('Aborted', 'AbortError'));
  }

  return observable.race(_RxMin.Observable.fromEvent(signal, 'abort').map(() => {
    throw new (_domexception().default)('Aborted', 'AbortError');
  })).toPromise();
}
/**
 * When using Observables with AbortSignals, be sure to use this -
 * it's really easy to miss the case when the signal is already aborted!
 * Recommended to use this with let/pipe:
 *
 *   myObservable
 *     .let(obs => takeUntilAbort(obs, signal))
 */


function takeUntilAbort(observable, signal) {
  return _RxMin.Observable.defer(() => {
    if (signal.aborted) {
      return _RxMin.Observable.empty();
    }

    return observable.takeUntil(_RxMin.Observable.fromEvent(signal, 'abort'));
  });
} // Executes tasks. Ensures that at most one task is running at a time.
// This class is handy for expensive tasks like processes, provided
// you never want the result of a previous task after a new task has started.


class SingletonExecutor {
  constructor() {
    this._abortController = null;
  }

  // Executes(subscribes to) the task.
  // Will terminate(unsubscribe) to any previously executing task.
  // Subsequent executes() will terminate this task if called before
  // this task completes.
  async execute(createTask) {
    // Kill any previously running processes
    this.cancel(); // Start a new process

    const controller = new (_AbortController().default)();
    this._abortController = controller; // Wait for the process to complete or be canceled ...

    try {
      return await toAbortablePromise(createTask, controller.signal);
    } finally {
      // ... and always clean up if we haven't been canceled already.
      if (controller === this._abortController) {
        this._abortController = null;
      }
    }
  }

  isExecuting() {
    return this._abortController != null;
  } // Cancels any currently executing tasks.


  cancel() {
    if (this._abortController != null) {
      this._abortController.abort();

      this._abortController = null;
    }
  }

}
/**
 * Repeatedly subscribe to an observable every `delay` milliseconds, waiting for the observable to
 * complete each time. This is preferable to, say, `Observable.interval(d).switchMap(() => source)`
 * because, in the case that `source` takes longer than `d` milliseconds to produce a value, that
 * formulation will never produce a value (while continuing to incur the overhead of subscribing to
 * source).
 *
 * Example:
 *
 *    // Ask what time it is every second until it's Friday.
 *    runCommand('date')
 *      .let(poll(1000))
 *      .filter(output => output.startsWith('Fri'))
 *      .take(1)
 *      .subscribe(() => {
 *        console.log("IT'S FRIDAY!!")
 *      });
 *
 */


exports.SingletonExecutor = SingletonExecutor;

function poll(delay) {
  return source => _RxMin.Observable.defer(() => {
    const delays = new _RxMin.Subject();
    return delays.switchMap(n => _RxMin.Observable.timer(n)).merge(_RxMin.Observable.of(null)).switchMap(() => {
      const subscribedAt = Date.now();
      return source.do({
        complete: () => {
          const timeElapsed = Date.now() - subscribedAt;
          delays.next(Math.max(0, delay - timeElapsed));
        }
      });
    });
  });
}