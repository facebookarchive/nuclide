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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _track2;

function _track() {
  return _track2 = require('./track');
}

var _HistogramTracker2;

function _HistogramTracker() {
  return _HistogramTracker2 = require('./HistogramTracker');
}

function track(eventName, values) {
  (0, (_assert2 || _assert()).default)((_track2 || _track()).track);
  return (0, (_track2 || _track()).track)(eventName, values || {});
}

/**
 * Track an analytics event and send it off immediately.
 * The returned promise will resolve when the request completes (or reject on failure).
 */
function trackImmediate(eventName, values) {
  (0, (_assert2 || _assert()).default)((_track2 || _track()).track);
  return (0, (_track2 || _track()).track)(eventName, values || {}, true);
}

/**
 * An alternative interface for `track` that accepts a single event object. This is particularly
 * useful when dealing with streams (Observables).
 */
function trackEvent(event) {
  return track(event.type, event.data);
}

/**
 * Track each event in a stream of TrackingEvents.
 */
function trackEvents(events) {
  return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(events.subscribe(trackEvent));
}

/**
 * A decorator factory (https://github.com/wycats/javascript-decorators) who measures the execution
 * time of an asynchronous/synchronous function which belongs to either a Class or an Object.
 * Usage:
 *
 * ```
 * Class Test{
 *   @trackTiming()
 *   foo(...) {...}
 *
 *   @trackTiming()
 *   bar(...): Promise {...}
 * }
 *
 * const obj = {
 *   @trackTiming('fooEvent')
 *   foo(...) {...}
 * }
 * ```
 *
 * @param eventName Name of the event to be tracked. It's optional and default value is
 *    `$className.$methodName` for Class method or `Object.$methodName` for Object method.
 * @returns A decorator.
 */
function trackTiming() {
  var eventName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  return function (target, name, descriptor) {
    var originalMethod = descriptor.value;

    // We can't use arrow function here as it will bind `this` to the context of enclosing function
    // which is trackTiming, whereas what needed is context of originalMethod.
    descriptor.value = function () {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!eventName) {
        var constructorName = this.constructor ? this.constructor.name : undefined;
        eventName = constructorName + '.' + name;
      }

      return trackOperationTiming(eventName,
      // Must use arrow here to get correct 'this'
      function () {
        return originalMethod.apply(_this, args);
      });
    };
  };
}

/**
 * Obtain a monotonically increasing timestamp in milliseconds, if possible.
 * If `window.performance` is unavailable (e.g. in Node), use process.hrtime.
 * Fall back to `Date.now` otherwise – note that `Date.now` does not guarantee timestamps to
 * increase monotonically, and is thus subject to system clock updates.
 *
 * Wrapped in a function rather than a module constant to facilitate testing.
 */
var getTimestamp = function getTimestamp() {
  var timingFunction = global.performance != null ? function () {
    return Math.round(global.performance.now());
  } : process != null && typeof process.hrtime === 'function' ? function () {
    var hr = process.hrtime();
    return Math.round((hr[0] * 1e9 + hr[1]) / 1e6);
  } : Date.now;
  return timingFunction();
};

var PERFORMANCE_EVENT = 'performance';

var TimingTracker = (function () {
  function TimingTracker(eventName) {
    _classCallCheck(this, TimingTracker);

    this._eventName = eventName;
    this._startTime = getTimestamp();
  }

  _createClass(TimingTracker, [{
    key: 'onError',
    value: function onError(error) {
      return this._trackTimingEvent(error);
    }
  }, {
    key: 'onSuccess',
    value: function onSuccess() {
      return this._trackTimingEvent( /* error */null);
    }
  }, {
    key: '_trackTimingEvent',
    value: function _trackTimingEvent(exception) {
      return track(PERFORMANCE_EVENT, {
        duration: (getTimestamp() - this._startTime).toString(),
        eventName: this._eventName,
        error: exception ? '1' : '0',
        exception: exception ? exception.toString() : ''
      });
    }
  }]);

  return TimingTracker;
})();

function startTracking(eventName) {
  return new TimingTracker(eventName);
}

/**
 * Reports analytics including timing for a single operation.
 *
 * Usage:
 *
 * analytics.trackOperationTiming('my-package-some-long-operation' () => doit());
 *
 * Returns (or throws) the result of the operation.
 */
function trackOperationTiming(eventName, operation) {

  var tracker = startTracking(eventName);

  try {
    var result = operation();

    if ((0, (_commonsNodePromise2 || _commonsNodePromise()).isPromise)(result)) {
      // Atom uses a different Promise implementation than Nuclide, so the following is not true:
      // invariant(result instanceof Promise);

      // For the method returning a Promise, track the time after the promise is resolved/rejected.
      return result.then(function (value) {
        tracker.onSuccess();
        return value;
      }, function (reason) {
        tracker.onError(reason instanceof Error ? reason : new Error(reason));
        return Promise.reject(reason);
      });
    } else {
      tracker.onSuccess();
      return result;
    }
  } catch (error) {
    tracker.onError(error);
    throw error;
  }
}

module.exports = {
  track: track,
  trackImmediate: trackImmediate,
  trackEvent: trackEvent,
  trackEvents: trackEvents,
  trackOperationTiming: trackOperationTiming,
  startTracking: startTracking,
  TimingTracker: TimingTracker,
  trackTiming: trackTiming,
  HistogramTracker: (_HistogramTracker2 || _HistogramTracker()).HistogramTracker
};