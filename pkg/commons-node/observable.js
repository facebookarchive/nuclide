Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _UniversalDisposable2;

function _UniversalDisposable() {
  return _UniversalDisposable2 = _interopRequireDefault(require('./UniversalDisposable'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _collection2;

function _collection() {
  return _collection2 = require('./collection');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */

function splitStream(input) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var current = '';

    function onEnd() {
      if (current !== '') {
        observer.next(current);
        current = '';
      }
    }

    return input.subscribe(function (value) {
      var lines = (current + value).split('\n');
      current = lines.pop();
      lines.forEach(function (line) {
        return observer.next(line + '\n');
      });
    }, function (error) {
      onEnd();observer.error(error);
    }, function () {
      onEnd();observer.complete();
    });
  });
}

// TODO: We used to use `stream.buffer(stream.filter(...))` for this but it doesn't work in RxJS 5.
//  See https://github.com/ReactiveX/rxjs/issues/1610

function bufferUntil(stream, condition) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var buffer = null;
    var flush = function flush() {
      if (buffer != null) {
        observer.next(buffer);
        buffer = null;
      }
    };
    return stream.subscribe(function (x) {
      if (buffer == null) {
        buffer = [];
      }
      buffer.push(x);
      if (condition(x)) {
        flush();
      }
    }, function (err) {
      flush();
      observer.error(err);
    }, function () {
      flush();
      observer.complete();
    });
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

function cacheWhileSubscribed(input) {
  return input.multicast(function () {
    return new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).ReplaySubject(1);
  }).refCount();
}

/**
 * Given a stream of sets, return a stream of diffs.
 * **IMPORTANT:** These sets are assumed to be immutable by convention. Don't mutate them!
 */

function diffSets(sets, hash) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(new Set()), // Always start with no items with an empty set
  sets)
  // $FlowFixMe(matthewwithanm): Type this.
  .pairwise().map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var previous = _ref2[0];
    var next = _ref2[1];
    return {
      added: (0, (_collection2 || _collection()).setDifference)(next, previous, hash),
      removed: (0, (_collection2 || _collection()).setDifference)(previous, next, hash)
    };
  }).filter(function (diff) {
    return diff.added.size > 0 || diff.removed.size > 0;
  });
}

/**
 * Give a stream of diffs, perform an action for each added item and dispose of the returned
 * disposable when the item is removed.
 */

function reconcileSetDiffs(diffs, addAction, hash_) {
  var hash = hash_ || function (x) {
    return x;
  };
  var itemsToDisposables = new Map();
  var disposeItem = function disposeItem(item) {
    var disposable = itemsToDisposables.get(hash(item));
    (0, (_assert2 || _assert()).default)(disposable != null);
    disposable.dispose();
    itemsToDisposables.delete(item);
  };
  var disposeAll = function disposeAll() {
    itemsToDisposables.forEach(function (disposable) {
      disposable.dispose();
    });
    itemsToDisposables.clear();
  };

  return new (_eventKit2 || _eventKit()).CompositeDisposable(new (_UniversalDisposable2 || _UniversalDisposable()).default(diffs.subscribe(function (diff) {
    // For every item that got added, perform the add action.
    diff.added.forEach(function (item) {
      itemsToDisposables.set(hash(item), addAction(item));
    });

    // "Undo" the add action for each item that got removed.
    diff.removed.forEach(disposeItem);
  })), new (_eventKit2 || _eventKit()).Disposable(disposeAll));
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
  var diffs = diffSets(sets, hash);
  return reconcileSetDiffs(diffs, addAction, hash);
}

function toggle(source, toggler) {
  return toggler.distinctUntilChanged().switchMap(function (enabled) {
    return enabled ? source : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
  });
}

function compact(source) {
  // Flow does not understand the semantics of `filter`
  return source.filter(function (x) {
    return x != null;
  });
}

/**
 * Like `takeWhile`, but includes the first item that doesn't match the predicate.
 */

function takeWhileInclusive(source, predicate) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    return source.subscribe(function (x) {
      observer.next(x);
      if (!predicate(x)) {
        observer.complete();
      }
    }, function (err) {
      observer.error(err);
    }, function () {
      observer.complete();
    });
  });
}

// Concatenate the latest values from each input observable into one big list.
// Observables who have not emitted a value yet are treated as empty.

function concatLatest() {
  var _Observable;

  for (var _len = arguments.length, observables = Array(_len), _key = 0; _key < _len; _key++) {
    observables[_key] = arguments[_key];
  }

  // First, tag all input observables with their index.

  var tagged = observables.map(function (observable, index) {
    return observable.map(function (list) {
      return [list, index];
    });
  });
  return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(tagged)).scan(function (accumulator, _ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var list = _ref32[0];
    var index = _ref32[1];

    accumulator[index] = list;
    return accumulator;
  }, observables.map(function (x) {
    return [];
  })).map(function (accumulator) {
    var _ref4;

    return (_ref4 = []).concat.apply(_ref4, _toConsumableArray(accumulator));
  });
}

// Flow errors with ambiguity without the explicit annotation.