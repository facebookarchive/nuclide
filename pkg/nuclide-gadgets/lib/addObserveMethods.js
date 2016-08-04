Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = addObserveMethods;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var strictEquals = function strictEquals(a, b) {
  return a === b;
};

/**
 * A decorator for adding Atom-style observation methods to a React component class whose
 * whose subscribers are invoked whenever the component updates.
 */

function addObserveMethods(methodMap) {
  return function (target) {
    var proto = target.prototype;

    // Add an observation method for each item in the map.
    Object.keys(methodMap).forEach(function (methodName) {
      var getValue = methodMap[methodName];
      Object.defineProperty(proto, methodName, createObserveMethodDescriptor(target, methodName, getValue));
    });

    // Wrap `componentDidUpdate` to notify Atom of changes.
    var oldMethod = proto.componentDidUpdate;
    proto.componentDidUpdate = function () {
      if (oldMethod) {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        oldMethod.apply(this, args);
      }
      if (this._notifiers) {
        this._notifiers.forEach(function (notify) {
          return notify();
        });
      }
    };

    return target;
  };
}

/**
 * Creates a descriptor that overwrites itself on first access with a method for observing changes
 * of a specific property.
 */
function createObserveMethodDescriptor(target, key, getValue) {
  return {
    configurable: true,
    get: function get() {
      var _this = this;

      // Don't override when accessed via prototype.
      if (this === target.prototype) {
        return null;
      }

      // If the instance doesn't have a list of notifiers yet, create one.
      if (!this._notifiers) {
        this._notifiers = [];
      }

      // Override the method with a new version on first access.

      var _createObserveFunction = createObserveFunction();

      var notify = _createObserveFunction.notify;
      var observe = _createObserveFunction.observe;

      this._notifiers.push(function () {
        return notify(function () {
          return getValue(_this);
        });
      });
      Object.defineProperty(this, key, {
        value: observe,
        configurable: true,
        writable: true
      });
      return observe;
    }
  };
}

/**
 * A utility for creating an Atom-style subscription function (`onDidChangeBlah`, `observeBlah`)
 * with an associated notification mechanism. This is just a thin wrapper around an RxJS Subject. We
 * provide our own default comparer because we want to be more strict (by default) than RxJS is.
 * (For example, RxJS will consider similar objects equal.)
 */
function createObserveFunction() {
  var comparer = arguments.length <= 0 || arguments[0] === undefined ? strictEquals : arguments[0];

  var value$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
  var distinctValue$ = value$.distinctUntilChanged(undefined, comparer);
  // Wrap each callback so that we don't leak the fact that subscribe is implemented with
  // observables (by accepting Observers as well as callbacks).
  return {
    observe: function observe(callback) {
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(distinctValue$.subscribe(function (value) {
        return callback(value);
      }));
    },
    notify: function notify(getValue) {
      // Don't calculate the next value unless somebody's listening.
      if (value$.observers.length) {
        value$.next(getValue());
      }
    }
  };
}
module.exports = exports.default;