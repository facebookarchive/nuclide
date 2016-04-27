Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.observeStream = observeStream;
exports.splitStream = splitStream;
exports.bufferUntil = bufferUntil;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rxjs = require('rxjs');

/**
 * Observe a stream like stdout or stderr.
 */

function observeStream(stream) {
  var error = _rxjs.Observable.fromEvent(stream, 'error').flatMap(_rxjs.Observable['throw']);
  return _rxjs.Observable.fromEvent(stream, 'data').map(function (data) {
    return data.toString();
  }).merge(error).takeUntil(_rxjs.Observable.fromEvent(stream, 'end').race(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */

function splitStream(input) {
  return _rxjs.Observable.create(function (observer) {
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

    this._subscription = new _rxjs.Subscription();

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
  return _rxjs.Observable.create(function (observer) {
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