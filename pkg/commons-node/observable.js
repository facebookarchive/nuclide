'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
      onEnd();observer.error(error);
    }, () => {
      onEnd();observer.complete();
    });
  });
}

// TODO: We used to use `stream.buffer(stream.filter(...))` for this but it doesn't work in RxJS 5.
//  See https://github.com/ReactiveX/rxjs/issues/1610
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
      if (condition(x)) {
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
  sets).pairwise().map((_ref) => {
    var _ref2 = _slicedToArray(_ref, 2);

    let previous = _ref2[0],
        next = _ref2[1];
    return {
      added: (0, (_collection || _load_collection()).setDifference)(next, previous, hash),
      removed: (0, (_collection || _load_collection()).setDifference)(previous, next, hash)
    };
  }).filter(diff => diff.added.size > 0 || diff.removed.size > 0);
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
function concatLatest() {
  for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
    observables[_key] = arguments[_key];
  }

  // First, tag all input observables with their index.
  const tagged = observables.map((observable, index) => observable.map(list => [list, index]));
  return _rxjsBundlesRxMinJs.Observable.merge(...tagged).scan((accumulator, _ref3) => {
    var _ref4 = _slicedToArray(_ref3, 2);

    let list = _ref4[0],
        index = _ref4[1];

    accumulator[index] = list;
    return accumulator;
  }, observables.map(x => [])).map(accumulator => [].concat(...accumulator));
}