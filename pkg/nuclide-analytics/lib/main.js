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

var _nuclideCommons = require('../../nuclide-commons');

var _track = require('./track');

var _HistogramTracker = require('./HistogramTracker');

function track(eventName, values) {
  (0, _assert2['default'])(_track.track);
  return (0, _track.track)(eventName, values || {});
}

/**
 * Track an analytics event and send it off immediately.
 * The returned promise will resolve when the request completes (or reject on failure).
 */
function trackImmediate(eventName, values) {
  (0, _assert2['default'])(_track.track);
  return (0, _track.track)(eventName, values || {}, true);
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
  return new _nuclideCommons.DisposableSubscription(events.subscribe(trackEvent));
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

    if (require('../../nuclide-commons').promises.isPromise(result)) {
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
  HistogramTracker: _HistogramTracker.HistogramTracker
};
//# sourceMappingURL=data:application/json;base64,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LE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDL0IsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLGFBQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNwQixhQUFPLE1BQU0sQ0FBQztLQUNmO0dBQ0YsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLFdBQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsVUFBTSxLQUFLLENBQUM7R0FDYjtDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixPQUFLLEVBQUwsS0FBSztBQUNMLGdCQUFjLEVBQWQsY0FBYztBQUNkLFlBQVUsRUFBVixVQUFVO0FBQ1YsYUFBVyxFQUFYLFdBQVc7QUFDWCxzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLGVBQWEsRUFBYixhQUFhO0FBQ2IsZUFBYSxFQUFiLGFBQWE7QUFDYixhQUFXLEVBQVgsV0FBVztBQUNYLGtCQUFnQixvQ0FBQTtDQUNqQixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrIGFzIHJhd1RyYWNrfSBmcm9tICcuL3RyYWNrJztcbmltcG9ydCB7SGlzdG9ncmFtVHJhY2tlcn0gZnJvbSAnLi9IaXN0b2dyYW1UcmFja2VyJztcblxuZXhwb3J0IHR5cGUgVHJhY2tpbmdFdmVudCA9IHtcbiAgdHlwZTogc3RyaW5nO1xuICBkYXRhPzogT2JqZWN0O1xufTtcblxuZnVuY3Rpb24gdHJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHZhbHVlcz86IHtba2V5OiBzdHJpbmddOiBtaXhlZH0pOiBQcm9taXNlPG1peGVkPiB7XG4gIGludmFyaWFudChyYXdUcmFjayk7XG4gIHJldHVybiByYXdUcmFjayhldmVudE5hbWUsIHZhbHVlcyB8fCB7fSk7XG59XG5cbi8qKlxuICogVHJhY2sgYW4gYW5hbHl0aWNzIGV2ZW50IGFuZCBzZW5kIGl0IG9mZiBpbW1lZGlhdGVseS5cbiAqIFRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSByZXF1ZXN0IGNvbXBsZXRlcyAob3IgcmVqZWN0IG9uIGZhaWx1cmUpLlxuICovXG5mdW5jdGlvbiB0cmFja0ltbWVkaWF0ZShldmVudE5hbWU6IHN0cmluZywgdmFsdWVzPzoge1trZXk6IHN0cmluZ106IG1peGVkfSk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgaW52YXJpYW50KHJhd1RyYWNrKTtcbiAgcmV0dXJuIHJhd1RyYWNrKGV2ZW50TmFtZSwgdmFsdWVzIHx8IHt9LCB0cnVlKTtcbn1cblxuLyoqXG4gKiBBbiBhbHRlcm5hdGl2ZSBpbnRlcmZhY2UgZm9yIGB0cmFja2AgdGhhdCBhY2NlcHRzIGEgc2luZ2xlIGV2ZW50IG9iamVjdC4gVGhpcyBpcyBwYXJ0aWN1bGFybHlcbiAqIHVzZWZ1bCB3aGVuIGRlYWxpbmcgd2l0aCBzdHJlYW1zIChPYnNlcnZhYmxlcykuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrRXZlbnQoZXZlbnQ6IFRyYWNraW5nRXZlbnQpOiBQcm9taXNlPG1peGVkPiB7XG4gIHJldHVybiB0cmFjayhldmVudC50eXBlLCBldmVudC5kYXRhKTtcbn1cblxuLyoqXG4gKiBUcmFjayBlYWNoIGV2ZW50IGluIGEgc3RyZWFtIG9mIFRyYWNraW5nRXZlbnRzLlxuICovXG5mdW5jdGlvbiB0cmFja0V2ZW50cyhldmVudHM6IFJ4Lk9ic2VydmFibGU8VHJhY2tpbmdFdmVudD4pOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihldmVudHMuc3Vic2NyaWJlKHRyYWNrRXZlbnQpKTtcbn1cblxuLyoqXG4gKiBBIGRlY29yYXRvciBmYWN0b3J5IChodHRwczovL2dpdGh1Yi5jb20vd3ljYXRzL2phdmFzY3JpcHQtZGVjb3JhdG9ycykgd2hvIG1lYXN1cmVzIHRoZSBleGVjdXRpb25cbiAqIHRpbWUgb2YgYW4gYXN5bmNocm9ub3VzL3N5bmNocm9ub3VzIGZ1bmN0aW9uIHdoaWNoIGJlbG9uZ3MgdG8gZWl0aGVyIGEgQ2xhc3Mgb3IgYW4gT2JqZWN0LlxuICogVXNhZ2U6XG4gKlxuICogYGBgXG4gKiBDbGFzcyBUZXN0e1xuICogICBAdHJhY2tUaW1pbmcoKVxuICogICBmb28oLi4uKSB7Li4ufVxuICpcbiAqICAgQHRyYWNrVGltaW5nKClcbiAqICAgYmFyKC4uLik6IFByb21pc2Ugey4uLn1cbiAqIH1cbiAqXG4gKiBjb25zdCBvYmogPSB7XG4gKiAgIEB0cmFja1RpbWluZygnZm9vRXZlbnQnKVxuICogICBmb28oLi4uKSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZSBOYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmFja2VkLiBJdCdzIG9wdGlvbmFsIGFuZCBkZWZhdWx0IHZhbHVlIGlzXG4gKiAgICBgJGNsYXNzTmFtZS4kbWV0aG9kTmFtZWAgZm9yIENsYXNzIG1ldGhvZCBvciBgT2JqZWN0LiRtZXRob2ROYW1lYCBmb3IgT2JqZWN0IG1ldGhvZC5cbiAqIEByZXR1cm5zIEEgZGVjb3JhdG9yLlxuICovXG5mdW5jdGlvbiB0cmFja1RpbWluZyhldmVudE5hbWU6ID9zdHJpbmcgPSBudWxsKTogYW55IHtcblxuICByZXR1cm4gKHRhcmdldDogYW55LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0b3I6IGFueSkgPT4ge1xuICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgIC8vIFdlIGNhbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBoZXJlIGFzIGl0IHdpbGwgYmluZCBgdGhpc2AgdG8gdGhlIGNvbnRleHQgb2YgZW5jbG9zaW5nIGZ1bmN0aW9uXG4gICAgLy8gd2hpY2ggaXMgdHJhY2tUaW1pbmcsIHdoZXJlYXMgd2hhdCBuZWVkZWQgaXMgY29udGV4dCBvZiBvcmlnaW5hbE1ldGhvZC5cbiAgICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgaWYgKCFldmVudE5hbWUpIHtcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3JOYW1lID0gdGhpcy5jb25zdHJ1Y3RvciA/IHRoaXMuY29uc3RydWN0b3IubmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgZXZlbnROYW1lID0gYCR7Y29uc3RydWN0b3JOYW1lfS4ke25hbWV9YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKGV2ZW50TmFtZSxcbiAgICAgICAgLy8gTXVzdCB1c2UgYXJyb3cgaGVyZSB0byBnZXQgY29ycmVjdCAndGhpcydcbiAgICAgICAgKCkgPT4gb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncykpO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogT2J0YWluIGEgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nIHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHMsIGlmIHBvc3NpYmxlLlxuICogSWYgYHdpbmRvdy5wZXJmb3JtYW5jZWAgaXMgdW5hdmFpbGFibGUgKGUuZy4gaW4gTm9kZSksIHVzZSBwcm9jZXNzLmhydGltZS5cbiAqIEZhbGwgYmFjayB0byBgRGF0ZS5ub3dgIG90aGVyd2lzZSDigJMgbm90ZSB0aGF0IGBEYXRlLm5vd2AgZG9lcyBub3QgZ3VhcmFudGVlIHRpbWVzdGFtcHMgdG9cbiAqIGluY3JlYXNlIG1vbm90b25pY2FsbHksIGFuZCBpcyB0aHVzIHN1YmplY3QgdG8gc3lzdGVtIGNsb2NrIHVwZGF0ZXMuXG4gKlxuICogV3JhcHBlZCBpbiBhIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGEgbW9kdWxlIGNvbnN0YW50IHRvIGZhY2lsaXRhdGUgdGVzdGluZy5cbiAqL1xuY29uc3QgZ2V0VGltZXN0YW1wID0gKCk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHRpbWluZ0Z1bmN0aW9uID0gKGdsb2JhbC5wZXJmb3JtYW5jZSAhPSBudWxsKVxuICAgID8gKCkgPT4gTWF0aC5yb3VuZChnbG9iYWwucGVyZm9ybWFuY2Uubm93KCkpXG4gICAgOiAocHJvY2VzcyAhPSBudWxsICYmIHR5cGVvZiBwcm9jZXNzLmhydGltZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgID8gKCkgPT4ge1xuICAgICAgICBjb25zdCBociA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKChoclswXSAqIDFlOSArIGhyWzFdKSAvIDFlNik7XG4gICAgICB9XG4gICAgICA6IERhdGUubm93O1xuICByZXR1cm4gdGltaW5nRnVuY3Rpb24oKTtcbn07XG5cbmNvbnN0IFBFUkZPUk1BTkNFX0VWRU5UID0gJ3BlcmZvcm1hbmNlJztcblxuY2xhc3MgVGltaW5nVHJhY2tlciB7XG4gIF9ldmVudE5hbWU6IHN0cmluZztcbiAgX3N0YXJ0VGltZTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IGdldFRpbWVzdGFtcCgpO1xuICB9XG5cbiAgb25FcnJvcihlcnJvcjogRXJyb3IpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tUaW1pbmdFdmVudChlcnJvcik7XG4gIH1cblxuICBvblN1Y2Nlc3MoKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVGltaW5nRXZlbnQoLyogZXJyb3IgKi8gbnVsbCk7XG4gIH1cblxuICBfdHJhY2tUaW1pbmdFdmVudChleGNlcHRpb246ID9FcnJvcik6IFByb21pc2Uge1xuICAgIHJldHVybiB0cmFjayhQRVJGT1JNQU5DRV9FVkVOVCwge1xuICAgICAgZHVyYXRpb246IChnZXRUaW1lc3RhbXAoKSAtIHRoaXMuX3N0YXJ0VGltZSkudG9TdHJpbmcoKSxcbiAgICAgIGV2ZW50TmFtZTogdGhpcy5fZXZlbnROYW1lLFxuICAgICAgZXJyb3I6IGV4Y2VwdGlvbiA/ICcxJyA6ICcwJyxcbiAgICAgIGV4Y2VwdGlvbjogZXhjZXB0aW9uID8gZXhjZXB0aW9uLnRvU3RyaW5nKCkgOiAnJyxcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydFRyYWNraW5nKGV2ZW50TmFtZTogc3RyaW5nKTogVGltaW5nVHJhY2tlciB7XG4gIHJldHVybiBuZXcgVGltaW5nVHJhY2tlcihldmVudE5hbWUpO1xufVxuXG4vKipcbiAqIFJlcG9ydHMgYW5hbHl0aWNzIGluY2x1ZGluZyB0aW1pbmcgZm9yIGEgc2luZ2xlIG9wZXJhdGlvbi5cbiAqXG4gKiBVc2FnZTpcbiAqXG4gKiBhbmFseXRpY3MudHJhY2tPcGVyYXRpb25UaW1pbmcoJ215LXBhY2thZ2Utc29tZS1sb25nLW9wZXJhdGlvbicgKCkgPT4gZG9pdCgpKTtcbiAqXG4gKiBSZXR1cm5zIChvciB0aHJvd3MpIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdHJhY2tPcGVyYXRpb25UaW1pbmc8VD4oZXZlbnROYW1lOiBzdHJpbmcsIG9wZXJhdGlvbjogKCkgPT4gVCk6IFQge1xuXG4gIGNvbnN0IHRyYWNrZXIgPSBzdGFydFRyYWNraW5nKGV2ZW50TmFtZSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBvcGVyYXRpb24oKTtcblxuICAgIGlmIChyZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKS5wcm9taXNlcy5pc1Byb21pc2UocmVzdWx0KSkge1xuICAgICAgLy8gQXRvbSB1c2VzIGEgZGlmZmVyZW50IFByb21pc2UgaW1wbGVtZW50YXRpb24gdGhhbiBOdWNsaWRlLCBzbyB0aGUgZm9sbG93aW5nIGlzIG5vdCB0cnVlOlxuICAgICAgLy8gaW52YXJpYW50KHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpO1xuXG4gICAgICAvLyBGb3IgdGhlIG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLCB0cmFjayB0aGUgdGltZSBhZnRlciB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZC9yZWplY3RlZC5cbiAgICAgIHJldHVybiAocmVzdWx0OiBhbnkpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICB0cmFja2VyLm9uU3VjY2VzcygpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LCByZWFzb24gPT4ge1xuICAgICAgICB0cmFja2VyLm9uRXJyb3IocmVhc29uIGluc3RhbmNlb2YgRXJyb3IgPyByZWFzb24gOiBuZXcgRXJyb3IocmVhc29uKSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0cmFja2VyLm9uRXJyb3IoZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0cmFjayxcbiAgdHJhY2tJbW1lZGlhdGUsXG4gIHRyYWNrRXZlbnQsXG4gIHRyYWNrRXZlbnRzLFxuICB0cmFja09wZXJhdGlvblRpbWluZyxcbiAgc3RhcnRUcmFja2luZyxcbiAgVGltaW5nVHJhY2tlcixcbiAgdHJhY2tUaW1pbmcsXG4gIEhpc3RvZ3JhbVRyYWNrZXIsXG59O1xuIl19