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
exports.TimingTracker = exports.HistogramTracker = undefined;

var _HistogramTracker;

function _load_HistogramTracker() {
  return _HistogramTracker = require('./HistogramTracker');
}

Object.defineProperty(exports, 'HistogramTracker', {
  enumerable: true,
  get: function () {
    return (_HistogramTracker || _load_HistogramTracker()).HistogramTracker;
  }
});
exports.track = track;
exports.trackImmediate = trackImmediate;
exports.trackEvent = trackEvent;
exports.trackEvents = trackEvents;
exports.trackTiming = trackTiming;
exports.startTracking = startTracking;
exports.trackOperationTiming = trackOperationTiming;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _track;

function _load_track() {
  return _track = require('./track');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Track a set of values against a named event.
 * Analytics will be batched and processed asynchronously in the background.
 *
 * @param eventName Name of the event to be tracked.
 * @param values The object containing the data to track.
 */
function track(eventName, values) {
  (0, (_track || _load_track()).track)(eventName, values || {});
}

/**
 * Same as `track`, except this is guaranteed to send immediately.
 * The returned promise will resolve when the request completes (or reject on failure).
 */
function trackImmediate(eventName, values) {
  return (0, (_track || _load_track()).track)(eventName, values || {}, true) || Promise.resolve();
}

/**
 * An alternative interface for `track` that accepts a single event object. This is particularly
 * useful when dealing with streams (Observables).
 */
function trackEvent(event) {
  track(event.type, event.data);
}

/**
 * Track each event in a stream of TrackingEvents.
 */
function trackEvents(events) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(events.subscribe(trackEvent));
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
  let eventName_ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  let eventName = eventName_;

  return (target, name, descriptor) => {
    const originalMethod = descriptor.value;

    // We can't use arrow function here as it will bind `this` to the context of enclosing function
    // which is trackTiming, whereas what needed is context of originalMethod.
    descriptor.value = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!eventName) {
        const constructorName = this.constructor ? this.constructor.name : undefined;
        eventName = `${ (0, (_string || _load_string()).maybeToString)(constructorName) }.${ name }`;
      }

      return trackOperationTiming(eventName,
      // Must use arrow here to get correct 'this'
      () => originalMethod.apply(this, args));
    };
  };
}

const PERFORMANCE_EVENT = 'performance';

let TimingTracker = exports.TimingTracker = class TimingTracker {

  constructor(eventName) {
    this._eventName = eventName;
    this._startTime = this._getTimestamp();
  }

  onError(error) {
    this._trackTimingEvent(error);
  }

  onSuccess() {
    this._trackTimingEvent( /* error */null);
  }

  _trackTimingEvent(exception) {
    track(PERFORMANCE_EVENT, {
      duration: (this._getTimestamp() - this._startTime).toString(),
      eventName: this._eventName,
      error: exception ? '1' : '0',
      exception: exception ? exception.toString() : ''
    });
  }

  // Obtain a monotonically increasing timestamp in milliseconds.
  _getTimestamp() {
    return Math.round(process.uptime() * 1000);
  }
};
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
  const tracker = startTracking(eventName);

  try {
    const result = operation();

    if ((0, (_promise || _load_promise()).isPromise)(result)) {
      // Atom uses a different Promise implementation than Nuclide, so the following is not true:
      // invariant(result instanceof Promise);

      // For the method returning a Promise, track the time after the promise is resolved/rejected.
      return result.then(value => {
        tracker.onSuccess();
        return value;
      }, reason => {
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