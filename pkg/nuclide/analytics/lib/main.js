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
//# sourceMappingURL=data:application/json;base64,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Iid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtzaW5nbGV0b259IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtBbmFseXRpY3NCYXRjaGVyfSBmcm9tICcuL0FuYWx5dGljc0JhdGNoZXInO1xuaW1wb3J0IHt0cmFjayBhcyByYXdUcmFja30gZnJvbSAnLi90cmFjayc7XG5cbmNvbnN0IEFOQUxZVElDU19CQVRDSEVSID0gJ2FuYWx5dGljcy1iYXRjaGVyJztcblxuZXhwb3J0IHR5cGUgVHJhY2tpbmdFdmVudCA9IHtcbiAgdHlwZTogc3RyaW5nLFxuICBkYXRhPzogT2JqZWN0LFxufTtcblxuZnVuY3Rpb24gZ2V0QmF0Y2hlcigpOiBBbmFseXRpY3NCYXRjaGVyIHtcbiAgcmV0dXJuIHNpbmdsZXRvbi5nZXQoXG4gICAgQU5BTFlUSUNTX0JBVENIRVIsICgpID0+IHtcbiAgICAgIGludmFyaWFudChyYXdUcmFjayk7XG4gICAgICByZXR1cm4gbmV3IEFuYWx5dGljc0JhdGNoZXIocmF3VHJhY2spO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZXNldEJhdGNoZXIoKTogdm9pZCB7XG4gIGdldEJhdGNoZXIoKS5kaXNwb3NlKCk7XG4gIHJldHVybiBzaW5nbGV0b24uY2xlYXIoQU5BTFlUSUNTX0JBVENIRVIpO1xufVxuXG5sZXQgYmF0Y2hpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gc2V0QmF0Y2hpbmcobmV3QmF0Y2hpbmc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKGJhdGNoaW5nICE9PSBuZXdCYXRjaGluZykge1xuICAgIGJhdGNoaW5nID0gbmV3QmF0Y2hpbmc7XG4gICAgaWYgKCFiYXRjaGluZykge1xuICAgICAgcmVzZXRCYXRjaGVyKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrKGV2ZW50TmFtZTogc3RyaW5nLCB2YWx1ZXM/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgaW52YXJpYW50KHJhd1RyYWNrKTtcbiAgaWYgKCFiYXRjaGluZykge1xuICAgIHJldHVybiByYXdUcmFjayhldmVudE5hbWUsIHZhbHVlcyB8fCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgZ2V0QmF0Y2hlcigpLnRyYWNrKGV2ZW50TmFtZSwgdmFsdWVzIHx8IHt9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBhbHRlcm5hdGl2ZSBpbnRlcmZhY2UgZm9yIGB0cmFja2AgdGhhdCBhY2NlcHRzIGEgc2luZ2xlIGV2ZW50IG9iamVjdC4gVGhpcyBpcyBwYXJ0aWN1bGFybHlcbiAqIHVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBzdHJlYW1zIChPYnNlcnZhYmxlcykuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrRXZlbnQoZXZlbnQ6IFRyYWNraW5nRXZlbnQpOiBQcm9taXNlPG1peGVkPiB7XG4gIHJldHVybiB0cmFjayhldmVudC50eXBlLCBldmVudC5kYXRhKTtcbn1cblxuLyoqXG4gKiBUcmFjayBlYWNoIGV2ZW50IGluIGEgc3RyZWFtIG9mIFRyYWNraW5nRXZlbnRzLlxuICovXG5mdW5jdGlvbiB0cmFja0V2ZW50cyhldmVudHM6IFJ4Lk9ic2VydmFibGU8VHJhY2tpbmdFdmVudD4pOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiBldmVudHMuZm9yRWFjaCh0cmFja0V2ZW50KTtcbn1cblxuLyoqXG4gKiBBIGRlY29yYXRvciBmYWN0b3J5IChodHRwczovL2dpdGh1Yi5jb20vd3ljYXRzL2phdmFzY3JpcHQtZGVjb3JhdG9ycykgd2hvIG1lYXN1cmVzIHRoZSBleGVjdXRpb25cbiAqIHRpbWUgb2YgYW4gYXN5bmNocm9ub3VzL3N5bmNocm9ub3VzIGZ1bmN0aW9uIHdoaWNoIGJlbG9uZ3MgdG8gZWl0aGVyIGEgQ2xhc3Mgb3IgYW4gT2JqZWN0LlxuICogVXNhZ2U6XG4gKlxuICogYGBgXG4gKiBDbGFzcyBUZXN0e1xuICogICBAdHJhY2tUaW1pbmcoKVxuICogICBmb28oLi4uKSB7Li4ufVxuICpcbiAqICAgQHRyYWNrVGltaW5nKClcbiAqICAgYmFyKC4uLik6IFByb21pc2Ugey4uLn1cbiAqIH1cbiAqXG4gKiBjb25zdCBvYmogPSB7XG4gKiAgIEB0cmFja1RpbWluZygnZm9vRXZlbnQnKVxuICogICBmb28oLi4uKSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZSBOYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmFja2VkLiBJdCdzIG9wdGlvbmFsIGFuZCBkZWZhdWx0IHZhbHVlIGlzXG4gKiAgICBgJGNsYXNzTmFtZS4kbWV0aG9kTmFtZWAgZm9yIENsYXNzIG1ldGhvZCBvciBgT2JqZWN0LiRtZXRob2ROYW1lYCBmb3IgT2JqZWN0IG1ldGhvZC5cbiAqIEByZXR1cm5zIEEgZGVjb3JhdG9yLlxuICovXG5mdW5jdGlvbiB0cmFja1RpbWluZyhldmVudE5hbWU6ID9zdHJpbmcgPSBudWxsKTogYW55IHtcblxuICByZXR1cm4gKHRhcmdldDogYW55LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0b3I6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgIC8vIFdlIGNhbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBoZXJlIGFzIGl0IHdpbGwgYmluZCBgdGhpc2AgdG8gdGhlIGNvbnRleHQgb2YgZW5jbG9zaW5nIGZ1bmN0aW9uXG4gICAgLy8gd2hpY2ggaXMgdHJhY2tUaW1pbmcsIHdoZXJlYXMgd2hhdCBuZWVkZWQgaXMgY29udGV4dCBvZiBvcmlnaW5hbE1ldGhvZC5cbiAgICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgaWYgKCFldmVudE5hbWUpIHtcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3JOYW1lID0gdGhpcy5jb25zdHJ1Y3RvciA/IHRoaXMuY29uc3RydWN0b3IubmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgZXZlbnROYW1lID0gYCR7Y29uc3RydWN0b3JOYW1lfS4ke25hbWV9YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKGV2ZW50TmFtZSxcbiAgICAgICAgLy8gTXVzdCB1c2UgYXJyb3cgaGVyZSB0byBnZXQgY29ycmVjdCAndGhpcydcbiAgICAgICAgKCkgPT4gb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncykpO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogT2J0YWluIGEgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nIHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHMsIGlmIHBvc3NpYmxlLlxuICogSWYgYHdpbmRvdy5wZXJmb3JtYW5jZWAgaXMgdW5hdmFpbGFibGUgKGUuZy4gaW4gTm9kZSksIHVzZSBwcm9jZXNzLmhydGltZS5cbiAqIEZhbGwgYmFjayB0byBgRGF0ZS5ub3dgIG90aGVyd2lzZSDigJMgbm90ZSB0aGF0IGBEYXRlLm5vd2AgZG9lcyBub3QgZ3VhcmFudGVlIHRpbWVzdGFtcHMgdG9cbiAqIGluY3JlYXNlIG1vbm90b25pY2FsbHksIGFuZCBpcyB0aHVzIHN1YmplY3QgdG8gc3lzdGVtIGNsb2NrIHVwZGF0ZXMuXG4gKlxuICogV3JhcHBlZCBpbiBhIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGEgbW9kdWxlIGNvbnN0YW50IHRvIGZhY2lsaXRhdGUgdGVzdGluZy5cbiAqL1xuY29uc3QgZ2V0VGltZXN0YW1wID0gKCk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHRpbWluZ0Z1bmN0aW9uID0gKGdsb2JhbC5wZXJmb3JtYW5jZSAhPSBudWxsKVxuICAgID8gKCkgPT4gTWF0aC5yb3VuZChnbG9iYWwucGVyZm9ybWFuY2Uubm93KCkpXG4gICAgOiAocHJvY2VzcyAhPSBudWxsICYmIHR5cGVvZiBwcm9jZXNzLmhydGltZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKCkgPT4ge1xuICAgICAgICBjb25zdCBociA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKChoclswXSAqIDFlOSArIGhyWzFdKSAvIDFlNik7XG4gICAgICB9XG4gICAgICA6IERhdGUubm93O1xuICByZXR1cm4gdGltaW5nRnVuY3Rpb24oKTtcbn07XG5cbmNvbnN0IFBFUkZPUk1BTkNFX0VWRU5UID0gJ3BlcmZvcm1hbmNlJztcblxuY2xhc3MgVGltaW5nVHJhY2tlciB7XG4gIF9ldmVudE5hbWU6IHN0cmluZztcbiAgX3N0YXJ0VGltZTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IGdldFRpbWVzdGFtcCgpO1xuICB9XG5cbiAgb25FcnJvcihlcnJvcjogRXJyb3IpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tUaW1pbmdFdmVudChlcnJvcik7XG4gIH1cblxuICBvblN1Y2Nlc3MoKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVGltaW5nRXZlbnQoLyogZXJyb3IgKi8gbnVsbCk7XG4gIH1cblxuICBfdHJhY2tUaW1pbmdFdmVudChleGNlcHRpb246ID9FcnJvcik6IFByb21pc2Uge1xuICAgIHJldHVybiB0cmFjayhQRVJGT1JNQU5DRV9FVkVOVCwge1xuICAgICAgZHVyYXRpb246IChnZXRUaW1lc3RhbXAoKSAtIHRoaXMuX3N0YXJ0VGltZSkudG9TdHJpbmcoKSxcbiAgICAgIGV2ZW50TmFtZTogdGhpcy5fZXZlbnROYW1lLFxuICAgICAgZXJyb3I6IGV4Y2VwdGlvbiA/ICcxJyA6ICcwJyxcbiAgICAgIGV4Y2VwdGlvbjogZXhjZXB0aW9uID8gZXhjZXB0aW9uLnRvU3RyaW5nKCkgOiAnJyxcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydFRyYWNraW5nKGV2ZW50TmFtZTogc3RyaW5nKTogVGltaW5nVHJhY2tlciB7XG4gIHJldHVybiBuZXcgVGltaW5nVHJhY2tlcihldmVudE5hbWUpO1xufVxuXG4vKipcbiAqIFJlcG9ydHMgYW5hbHl0aWNzIGluY2x1ZGluZyB0aW1pbmcgZm9yIGEgc2luZ2xlIG9wZXJhdGlvbi5cbiAqXG4gKiBVc2FnZTpcbiAqXG4gKiBhbmFseXRpY3MudHJhY2tPcGVyYXRpb25UaW1pbmcoJ215LXBhY2thZ2Utc29tZS1sb25nLW9wZXJhdGlvbicgKCkgPT4gZG9pdCgpKTtcbiAqXG4gKiBSZXR1cm5zIChvciB0aHJvd3MpIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdHJhY2tPcGVyYXRpb25UaW1pbmc8VD4oZXZlbnROYW1lOiBzdHJpbmcsIG9wZXJhdGlvbjogKCkgPT4gVCk6IFQge1xuXG4gIGNvbnN0IHRyYWNrZXIgPSBzdGFydFRyYWNraW5nKGV2ZW50TmFtZSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBvcGVyYXRpb24oKTtcblxuICAgIGlmIChyZXF1aXJlKCcuLi8uLi9jb21tb25zJykucHJvbWlzZXMuaXNQcm9taXNlKHJlc3VsdCkpIHtcbiAgICAgIC8vIEF0b20gdXNlcyBhIGRpZmZlcmVudCBQcm9taXNlIGltcGxlbWVudGF0aW9uIHRoYW4gTnVjbGlkZSwgc28gdGhlIGZvbGxvd2luZyBpcyBub3QgdHJ1ZTpcbiAgICAgIC8vIGludmFyaWFudChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKTtcblxuICAgICAgLy8gRm9yIHRoZSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZSwgdHJhY2sgdGhlIHRpbWUgYWZ0ZXIgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQvcmVqZWN0ZWQuXG4gICAgICByZXR1cm4gKHJlc3VsdDogYW55KS50aGVuKCh2YWx1ZSkgPT4ge1xuICAgICAgICB0cmFja2VyLm9uU3VjY2VzcygpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LCAocmVhc29uKSA9PiB7XG4gICAgICAgIHRyYWNrZXIub25FcnJvcihyZWFzb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlYXNvbiA6IG5ldyBFcnJvcihyZWFzb24pKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRyYWNrZXIub25FcnJvcihlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRyYWNrLFxuICB0cmFja0V2ZW50LFxuICB0cmFja0V2ZW50cyxcbiAgdHJhY2tPcGVyYXRpb25UaW1pbmcsXG4gIHN0YXJ0VHJhY2tpbmcsXG4gIFRpbWluZ1RyYWNrZXIsXG4gIHRyYWNrVGltaW5nLFxuICBzZXRCYXRjaGluZyxcbn07XG4iXX0=