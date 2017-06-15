'use strict';

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
exports.startTracking = startTracking;
exports.trackTiming = trackTiming;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('nuclide-commons/performanceNow'));
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

const PERFORMANCE_EVENT = 'performance';

class TimingTracker {

  constructor(eventName) {
    this._eventName = eventName;
    this._startTime = (0, (_performanceNow || _load_performanceNow()).default)();
  }

  onError(error) {
    this._trackTimingEvent(error);
  }

  onSuccess() {
    this._trackTimingEvent( /* error */null);
  }

  _trackTimingEvent(exception) {
    track(PERFORMANCE_EVENT, {
      duration: Math.round((0, (_performanceNow || _load_performanceNow()).default)() - this._startTime).toString(),
      eventName: this._eventName,
      error: exception ? '1' : '0',
      exception: exception ? exception.toString() : ''
    });
  }
}

exports.TimingTracker = TimingTracker;
function startTracking(eventName) {
  return new TimingTracker(eventName);
}

/**
 * Reports analytics including timing for a single operation.
 *
 * Usage:
 *
 * analytics.trackTiming('my-package-some-long-operation' () => doit());
 *
 * Returns (or throws) the result of the operation.
 */
function trackTiming(eventName, operation) {
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