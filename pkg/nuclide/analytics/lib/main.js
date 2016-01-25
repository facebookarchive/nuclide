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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _commons = require('../../commons');

var _AnalyticsBatcher = require('./AnalyticsBatcher');

var _track = require('./track');

var ANALYTICS_BATCHER = 'analytics-batcher';

function getBatcher() {
  return _commons.singleton.get(ANALYTICS_BATCHER, function () {
    (0, _assert2['default'])(_track.track);
    return new _AnalyticsBatcher.AnalyticsBatcher(_track.track);
  });
}

function resetBatcher() {
  getBatcher().dispose();
  return _commons.singleton.clear(ANALYTICS_BATCHER);
}

var batching = false;

function setBatching(newBatching) {
  if (batching !== newBatching) {
    batching = newBatching;
    if (!batching) {
      resetBatcher();
    }
  }
}

function track(eventName, values) {
  (0, _assert2['default'])(_track.track);
  if (!batching) {
    return (0, _track.track)(eventName, values || {});
  } else {
    getBatcher().track(eventName, values || {});
    return Promise.resolve();
  }
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
  return events.forEach(trackEvent);
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

    if (require('../../commons').promises.isPromise(result)) {
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
  trackEvent: trackEvent,
  trackEvents: trackEvents,
  trackOperationTiming: trackOperationTiming,
  startTracking: startTracking,
  TimingTracker: TimingTracker,
  trackTiming: trackTiming,
  setBatching: setBatching
};
//# sourceMappingURL=data:application/json;base64,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WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7c2luZ2xldG9ufSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7QW5hbHl0aWNzQmF0Y2hlcn0gZnJvbSAnLi9BbmFseXRpY3NCYXRjaGVyJztcbmltcG9ydCB7dHJhY2sgYXMgcmF3VHJhY2t9IGZyb20gJy4vdHJhY2snO1xuXG5jb25zdCBBTkFMWVRJQ1NfQkFUQ0hFUiA9ICdhbmFseXRpY3MtYmF0Y2hlcic7XG5cbmV4cG9ydCB0eXBlIFRyYWNraW5nRXZlbnQgPSB7XG4gIHR5cGU6IHN0cmluZyxcbiAgZGF0YT86IE9iamVjdCxcbn07XG5cbmZ1bmN0aW9uIGdldEJhdGNoZXIoKTogQW5hbHl0aWNzQmF0Y2hlciB7XG4gIHJldHVybiBzaW5nbGV0b24uZ2V0KFxuICAgIEFOQUxZVElDU19CQVRDSEVSLCAoKSA9PiB7XG4gICAgICBpbnZhcmlhbnQocmF3VHJhY2spO1xuICAgICAgcmV0dXJuIG5ldyBBbmFseXRpY3NCYXRjaGVyKHJhd1RyYWNrKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzZXRCYXRjaGVyKCk6IHZvaWQge1xuICBnZXRCYXRjaGVyKCkuZGlzcG9zZSgpO1xuICByZXR1cm4gc2luZ2xldG9uLmNsZWFyKEFOQUxZVElDU19CQVRDSEVSKTtcbn1cblxubGV0IGJhdGNoaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHNldEJhdGNoaW5nKG5ld0JhdGNoaW5nOiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChiYXRjaGluZyAhPT0gbmV3QmF0Y2hpbmcpIHtcbiAgICBiYXRjaGluZyA9IG5ld0JhdGNoaW5nO1xuICAgIGlmICghYmF0Y2hpbmcpIHtcbiAgICAgIHJlc2V0QmF0Y2hlcigpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFjayhldmVudE5hbWU6IHN0cmluZywgdmFsdWVzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBQcm9taXNlPG1peGVkPiB7XG4gIGludmFyaWFudChyYXdUcmFjayk7XG4gIGlmICghYmF0Y2hpbmcpIHtcbiAgICByZXR1cm4gcmF3VHJhY2soZXZlbnROYW1lLCB2YWx1ZXMgfHwge30pO1xuICB9IGVsc2Uge1xuICAgIGdldEJhdGNoZXIoKS50cmFjayhldmVudE5hbWUsIHZhbHVlcyB8fCB7fSk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG59XG5cbi8qKlxuICogQW4gYWx0ZXJuYXRpdmUgaW50ZXJmYWNlIGZvciBgdHJhY2tgIHRoYXQgYWNjZXB0cyBhIHNpbmdsZSBldmVudCBvYmplY3QuIFRoaXMgaXMgcGFydGljdWxhcmx5XG4gKiB1c2VmdWwgd2hlbiBkZWFsaW5nIHdpdGggc3RyZWFtcyAoT2JzZXJ2YWJsZXMpLlxuICovXG5mdW5jdGlvbiB0cmFja0V2ZW50KGV2ZW50OiBUcmFja2luZ0V2ZW50KTogUHJvbWlzZTxtaXhlZD4ge1xuICByZXR1cm4gdHJhY2soZXZlbnQudHlwZSwgZXZlbnQuZGF0YSk7XG59XG5cbi8qKlxuICogVHJhY2sgZWFjaCBldmVudCBpbiBhIHN0cmVhbSBvZiBUcmFja2luZ0V2ZW50cy5cbiAqL1xuZnVuY3Rpb24gdHJhY2tFdmVudHMoZXZlbnRzOiBSeC5PYnNlcnZhYmxlPFRyYWNraW5nRXZlbnQ+KTogcngkSURpc3Bvc2FibGUge1xuICByZXR1cm4gZXZlbnRzLmZvckVhY2godHJhY2tFdmVudCk7XG59XG5cbi8qKlxuICogQSBkZWNvcmF0b3IgZmFjdG9yeSAoaHR0cHM6Ly9naXRodWIuY29tL3d5Y2F0cy9qYXZhc2NyaXB0LWRlY29yYXRvcnMpIHdobyBtZWFzdXJlcyB0aGUgZXhlY3V0aW9uXG4gKiB0aW1lIG9mIGFuIGFzeW5jaHJvbm91cy9zeW5jaHJvbm91cyBmdW5jdGlvbiB3aGljaCBiZWxvbmdzIHRvIGVpdGhlciBhIENsYXNzIG9yIGFuIE9iamVjdC5cbiAqIFVzYWdlOlxuICpcbiAqIGBgYFxuICogQ2xhc3MgVGVzdHtcbiAqICAgQHRyYWNrVGltaW5nKClcbiAqICAgZm9vKC4uLikgey4uLn1cbiAqXG4gKiAgIEB0cmFja1RpbWluZygpXG4gKiAgIGJhciguLi4pOiBQcm9taXNlIHsuLi59XG4gKiB9XG4gKlxuICogY29uc3Qgb2JqID0ge1xuICogICBAdHJhY2tUaW1pbmcoJ2Zvb0V2ZW50JylcbiAqICAgZm9vKC4uLikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnQgdG8gYmUgdHJhY2tlZC4gSXQncyBvcHRpb25hbCBhbmQgZGVmYXVsdCB2YWx1ZSBpc1xuICogICAgYCRjbGFzc05hbWUuJG1ldGhvZE5hbWVgIGZvciBDbGFzcyBtZXRob2Qgb3IgYE9iamVjdC4kbWV0aG9kTmFtZWAgZm9yIE9iamVjdCBtZXRob2QuXG4gKiBAcmV0dXJucyBBIGRlY29yYXRvci5cbiAqL1xuZnVuY3Rpb24gdHJhY2tUaW1pbmcoZXZlbnROYW1lOiA/c3RyaW5nID0gbnVsbCk6IGFueSB7XG5cbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgbmFtZTogc3RyaW5nLCBkZXNjcmlwdG9yOiBhbnkpID0+IHtcbiAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgICAvLyBXZSBjYW4ndCB1c2UgYXJyb3cgZnVuY3Rpb24gaGVyZSBhcyBpdCB3aWxsIGJpbmQgYHRoaXNgIHRvIHRoZSBjb250ZXh0IG9mIGVuY2xvc2luZyBmdW5jdGlvblxuICAgIC8vIHdoaWNoIGlzIHRyYWNrVGltaW5nLCB3aGVyZWFzIHdoYXQgbmVlZGVkIGlzIGNvbnRleHQgb2Ygb3JpZ2luYWxNZXRob2QuXG4gICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIGlmICghZXZlbnROYW1lKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yTmFtZSA9IHRoaXMuY29uc3RydWN0b3IgPyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGV2ZW50TmFtZSA9IGAke2NvbnN0cnVjdG9yTmFtZX0uJHtuYW1lfWA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZyhldmVudE5hbWUsXG4gICAgICAgIC8vIE11c3QgdXNlIGFycm93IGhlcmUgdG8gZ2V0IGNvcnJlY3QgJ3RoaXMnXG4gICAgICAgICgpID0+IG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIE9idGFpbiBhIG1vbm90b25pY2FsbHkgaW5jcmVhc2luZyB0aW1lc3RhbXAgaW4gbWlsbGlzZWNvbmRzLCBpZiBwb3NzaWJsZS5cbiAqIElmIGB3aW5kb3cucGVyZm9ybWFuY2VgIGlzIHVuYXZhaWxhYmxlIChlLmcuIGluIE5vZGUpLCB1c2UgcHJvY2Vzcy5ocnRpbWUuXG4gKiBGYWxsIGJhY2sgdG8gYERhdGUubm93YCBvdGhlcndpc2Ug4oCTIG5vdGUgdGhhdCBgRGF0ZS5ub3dgIGRvZXMgbm90IGd1YXJhbnRlZSB0aW1lc3RhbXBzIHRvXG4gKiBpbmNyZWFzZSBtb25vdG9uaWNhbGx5LCBhbmQgaXMgdGh1cyBzdWJqZWN0IHRvIHN5c3RlbSBjbG9jayB1cGRhdGVzLlxuICpcbiAqIFdyYXBwZWQgaW4gYSBmdW5jdGlvbiByYXRoZXIgdGhhbiBhIG1vZHVsZSBjb25zdGFudCB0byBmYWNpbGl0YXRlIHRlc3RpbmcuXG4gKi9cbmNvbnN0IGdldFRpbWVzdGFtcCA9ICgpOiBudW1iZXIgPT4ge1xuICBjb25zdCB0aW1pbmdGdW5jdGlvbiA9IChnbG9iYWwucGVyZm9ybWFuY2UgIT0gbnVsbClcbiAgICA/ICgpID0+IE1hdGgucm91bmQoZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdygpKVxuICAgIDogKHByb2Nlc3MgIT0gbnVsbCAmJiB0eXBlb2YgcHJvY2Vzcy5ocnRpbWUgPT09ICdmdW5jdGlvbicpXG4gICAgICA/ICgpID0+IHtcbiAgICAgICAgY29uc3QgaHIgPSBwcm9jZXNzLmhydGltZSgpO1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgoaHJbMF0gKiAxZTkgKyBoclsxXSkgLyAxZTYpO1xuICAgICAgfVxuICAgICAgOiBEYXRlLm5vdztcbiAgcmV0dXJuIHRpbWluZ0Z1bmN0aW9uKCk7XG59O1xuXG5jb25zdCBQRVJGT1JNQU5DRV9FVkVOVCA9ICdwZXJmb3JtYW5jZSc7XG5cbmNsYXNzIFRpbWluZ1RyYWNrZXIge1xuICBfZXZlbnROYW1lOiBzdHJpbmc7XG4gIF9zdGFydFRpbWU6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihldmVudE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX2V2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSBnZXRUaW1lc3RhbXAoKTtcbiAgfVxuXG4gIG9uRXJyb3IoZXJyb3I6IEVycm9yKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVGltaW5nRXZlbnQoZXJyb3IpO1xuICB9XG5cbiAgb25TdWNjZXNzKCk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl90cmFja1RpbWluZ0V2ZW50KC8qIGVycm9yICovIG51bGwpO1xuICB9XG5cbiAgX3RyYWNrVGltaW5nRXZlbnQoZXhjZXB0aW9uOiA/RXJyb3IpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdHJhY2soUEVSRk9STUFOQ0VfRVZFTlQsIHtcbiAgICAgIGR1cmF0aW9uOiAoZ2V0VGltZXN0YW1wKCkgLSB0aGlzLl9zdGFydFRpbWUpLnRvU3RyaW5nKCksXG4gICAgICBldmVudE5hbWU6IHRoaXMuX2V2ZW50TmFtZSxcbiAgICAgIGVycm9yOiBleGNlcHRpb24gPyAnMScgOiAnMCcsXG4gICAgICBleGNlcHRpb246IGV4Y2VwdGlvbiA/IGV4Y2VwdGlvbi50b1N0cmluZygpIDogJycsXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRUcmFja2luZyhldmVudE5hbWU6IHN0cmluZyk6IFRpbWluZ1RyYWNrZXIge1xuICByZXR1cm4gbmV3IFRpbWluZ1RyYWNrZXIoZXZlbnROYW1lKTtcbn1cblxuLyoqXG4gKiBSZXBvcnRzIGFuYWx5dGljcyBpbmNsdWRpbmcgdGltaW5nIGZvciBhIHNpbmdsZSBvcGVyYXRpb24uXG4gKlxuICogVXNhZ2U6XG4gKlxuICogYW5hbHl0aWNzLnRyYWNrT3BlcmF0aW9uVGltaW5nKCdteS1wYWNrYWdlLXNvbWUtbG9uZy1vcGVyYXRpb24nICgpID0+IGRvaXQoKSk7XG4gKlxuICogUmV0dXJucyAob3IgdGhyb3dzKSB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb24uXG4gKi9cbmZ1bmN0aW9uIHRyYWNrT3BlcmF0aW9uVGltaW5nPFQ+KGV2ZW50TmFtZTogc3RyaW5nLCBvcGVyYXRpb246ICgpID0+IFQpOiBUIHtcblxuICBjb25zdCB0cmFja2VyID0gc3RhcnRUcmFja2luZyhldmVudE5hbWUpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gb3BlcmF0aW9uKCk7XG5cbiAgICBpZiAocmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLnByb21pc2VzLmlzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAvLyBBdG9tIHVzZXMgYSBkaWZmZXJlbnQgUHJvbWlzZSBpbXBsZW1lbnRhdGlvbiB0aGFuIE51Y2xpZGUsIHNvIHRoZSBmb2xsb3dpbmcgaXMgbm90IHRydWU6XG4gICAgICAvLyBpbnZhcmlhbnQocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSk7XG5cbiAgICAgIC8vIEZvciB0aGUgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UsIHRyYWNrIHRoZSB0aW1lIGFmdGVyIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkL3JlamVjdGVkLlxuICAgICAgcmV0dXJuIChyZXN1bHQ6IGFueSkudGhlbigodmFsdWUpID0+IHtcbiAgICAgICAgdHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSwgKHJlYXNvbikgPT4ge1xuICAgICAgICB0cmFja2VyLm9uRXJyb3IocmVhc29uIGluc3RhbmNlb2YgRXJyb3IgPyByZWFzb24gOiBuZXcgRXJyb3IocmVhc29uKSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0cmFja2VyLm9uRXJyb3IoZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0cmFjayxcbiAgdHJhY2tFdmVudCxcbiAgdHJhY2tFdmVudHMsXG4gIHRyYWNrT3BlcmF0aW9uVGltaW5nLFxuICBzdGFydFRyYWNraW5nLFxuICBUaW1pbmdUcmFja2VyLFxuICB0cmFja1RpbWluZyxcbiAgc2V0QmF0Y2hpbmcsXG59O1xuIl19