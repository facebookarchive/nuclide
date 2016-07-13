Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.observeStream = observeStream;
exports.observeRawStream = observeRawStream;
exports.splitStream = splitStream;
exports.bufferUntil = bufferUntil;
exports.cacheWhileSubscribed = cacheWhileSubscribed;
exports.diffSets = diffSets;
exports.reconcileSetDiffs = reconcileSetDiffs;
exports.reconcileSets = reconcileSets;
exports.toggle = toggle;
exports.compact = compact;
exports.takeWhileInclusive = takeWhileInclusive;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

/**
 * Observe a stream like stdout or stderr.
 */

function observeStream(stream) {
  return observeRawStream(stream).map(function (data) {
    return data.toString();
  });
}

function observeRawStream(stream) {
  var error = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(stream, 'error').flatMap((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw);
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(stream, 'data').merge(error).takeUntil((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(stream, 'end'));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */

function splitStream(input) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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

var DisposableSubscription = (function () {
  function DisposableSubscription(subscription) {
    _classCallCheck(this, DisposableSubscription);

    this._subscription = subscription;
  }

  _createClass(DisposableSubscription, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.unsubscribe();
    }
  }]);

  return DisposableSubscription;
})();

exports.DisposableSubscription = DisposableSubscription;

var CompositeSubscription = (function () {
  function CompositeSubscription() {
    var _this = this;

    _classCallCheck(this, CompositeSubscription);

    this._subscription = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subscription();

    for (var _len = arguments.length, subscriptions = Array(_len), _key = 0; _key < _len; _key++) {
      subscriptions[_key] = arguments[_key];
    }

    subscriptions.forEach(function (sub) {
      _this._subscription.add(sub);
    });
  }

  // TODO: We used to use `stream.buffer(stream.filter(...))` for this but it doesn't work in RxJS 5.
  //  See https://github.com/ReactiveX/rxjs/issues/1610

  _createClass(CompositeSubscription, [{
    key: 'unsubscribe',
    value: function unsubscribe() {
      this._subscription.unsubscribe();
    }
  }]);

  return CompositeSubscription;
})();

exports.CompositeSubscription = CompositeSubscription;

function bufferUntil(stream, condition) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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
    return new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).ReplaySubject(1);
  }).refCount();
}

function subtractSet(a, b, hash_) {
  if (a.size === 0) {
    return new Set();
  } else if (b.size === 0) {
    return new Set(a);
  }
  var result = new Set();
  var hash = hash_ || function (x) {
    return x;
  };
  var bHashes = hash_ == null ? b : new Set(Array.from(b.values()).map(hash));
  a.forEach(function (value) {
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

function diffSets(sets, hash) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(new Set()), // Always start with no items with an empty set
  sets)
  // $FlowFixMe(matthewwithanm): Type this.
  .pairwise().map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var previous = _ref2[0];
    var next = _ref2[1];
    return {
      added: subtractSet(next, previous, hash),
      removed: subtractSet(previous, next, hash)
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

  return new (_eventKit2 || _eventKit()).CompositeDisposable(new DisposableSubscription(diffs.subscribe(function (diff) {
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
    return enabled ? source : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
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
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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