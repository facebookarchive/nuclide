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

var _track = require('./track');

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
  trackTiming: trackTiming
};
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztLQUNKLE1BQU07QUFDTCxhQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEIsYUFBTyxNQUFNLENBQUM7S0FDZjtHQUNGLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxXQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLFVBQU0sS0FBSyxDQUFDO0dBQ2I7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsT0FBSyxFQUFMLEtBQUs7QUFDTCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxZQUFVLEVBQVYsVUFBVTtBQUNWLGFBQVcsRUFBWCxXQUFXO0FBQ1gsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixlQUFhLEVBQWIsYUFBYTtBQUNiLGVBQWEsRUFBYixhQUFhO0FBQ2IsYUFBVyxFQUFYLFdBQVc7Q0FDWixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7dHJhY2sgYXMgcmF3VHJhY2t9IGZyb20gJy4vdHJhY2snO1xuXG5leHBvcnQgdHlwZSBUcmFja2luZ0V2ZW50ID0ge1xuICB0eXBlOiBzdHJpbmc7XG4gIGRhdGE/OiBPYmplY3Q7XG59O1xuXG5mdW5jdGlvbiB0cmFjayhldmVudE5hbWU6IHN0cmluZywgdmFsdWVzPzoge1trZXk6IHN0cmluZ106IG1peGVkfSk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgaW52YXJpYW50KHJhd1RyYWNrKTtcbiAgcmV0dXJuIHJhd1RyYWNrKGV2ZW50TmFtZSwgdmFsdWVzIHx8IHt9KTtcbn1cblxuLyoqXG4gKiBUcmFjayBhbiBhbmFseXRpY3MgZXZlbnQgYW5kIHNlbmQgaXQgb2ZmIGltbWVkaWF0ZWx5LlxuICogVGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCByZXNvbHZlIHdoZW4gdGhlIHJlcXVlc3QgY29tcGxldGVzIChvciByZWplY3Qgb24gZmFpbHVyZSkuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrSW1tZWRpYXRlKGV2ZW50TmFtZTogc3RyaW5nLCB2YWx1ZXM/OiB7W2tleTogc3RyaW5nXTogbWl4ZWR9KTogUHJvbWlzZTxtaXhlZD4ge1xuICBpbnZhcmlhbnQocmF3VHJhY2spO1xuICByZXR1cm4gcmF3VHJhY2soZXZlbnROYW1lLCB2YWx1ZXMgfHwge30sIHRydWUpO1xufVxuXG4vKipcbiAqIEFuIGFsdGVybmF0aXZlIGludGVyZmFjZSBmb3IgYHRyYWNrYCB0aGF0IGFjY2VwdHMgYSBzaW5nbGUgZXZlbnQgb2JqZWN0LiBUaGlzIGlzIHBhcnRpY3VsYXJseVxuICogdXNlZnVsIHdoZW4gZGVhbGluZyB3aXRoIHN0cmVhbXMgKE9ic2VydmFibGVzKS5cbiAqL1xuZnVuY3Rpb24gdHJhY2tFdmVudChldmVudDogVHJhY2tpbmdFdmVudCk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgcmV0dXJuIHRyYWNrKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGEpO1xufVxuXG4vKipcbiAqIFRyYWNrIGVhY2ggZXZlbnQgaW4gYSBzdHJlYW0gb2YgVHJhY2tpbmdFdmVudHMuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrRXZlbnRzKGV2ZW50czogUnguT2JzZXJ2YWJsZTxUcmFja2luZ0V2ZW50Pik6IElEaXNwb3NhYmxlIHtcbiAgcmV0dXJuIGV2ZW50cy5mb3JFYWNoKHRyYWNrRXZlbnQpO1xufVxuXG4vKipcbiAqIEEgZGVjb3JhdG9yIGZhY3RvcnkgKGh0dHBzOi8vZ2l0aHViLmNvbS93eWNhdHMvamF2YXNjcmlwdC1kZWNvcmF0b3JzKSB3aG8gbWVhc3VyZXMgdGhlIGV4ZWN1dGlvblxuICogdGltZSBvZiBhbiBhc3luY2hyb25vdXMvc3luY2hyb25vdXMgZnVuY3Rpb24gd2hpY2ggYmVsb25ncyB0byBlaXRoZXIgYSBDbGFzcyBvciBhbiBPYmplY3QuXG4gKiBVc2FnZTpcbiAqXG4gKiBgYGBcbiAqIENsYXNzIFRlc3R7XG4gKiAgIEB0cmFja1RpbWluZygpXG4gKiAgIGZvbyguLi4pIHsuLi59XG4gKlxuICogICBAdHJhY2tUaW1pbmcoKVxuICogICBiYXIoLi4uKTogUHJvbWlzZSB7Li4ufVxuICogfVxuICpcbiAqIGNvbnN0IG9iaiA9IHtcbiAqICAgQHRyYWNrVGltaW5nKCdmb29FdmVudCcpXG4gKiAgIGZvbyguLi4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lIE5hbWUgb2YgdGhlIGV2ZW50IHRvIGJlIHRyYWNrZWQuIEl0J3Mgb3B0aW9uYWwgYW5kIGRlZmF1bHQgdmFsdWUgaXNcbiAqICAgIGAkY2xhc3NOYW1lLiRtZXRob2ROYW1lYCBmb3IgQ2xhc3MgbWV0aG9kIG9yIGBPYmplY3QuJG1ldGhvZE5hbWVgIGZvciBPYmplY3QgbWV0aG9kLlxuICogQHJldHVybnMgQSBkZWNvcmF0b3IuXG4gKi9cbmZ1bmN0aW9uIHRyYWNrVGltaW5nKGV2ZW50TmFtZTogP3N0cmluZyA9IG51bGwpOiBhbnkge1xuXG4gIHJldHVybiAodGFyZ2V0OiBhbnksIG5hbWU6IHN0cmluZywgZGVzY3JpcHRvcjogYW55KSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gICAgLy8gV2UgY2FuJ3QgdXNlIGFycm93IGZ1bmN0aW9uIGhlcmUgYXMgaXQgd2lsbCBiaW5kIGB0aGlzYCB0byB0aGUgY29udGV4dCBvZiBlbmNsb3NpbmcgZnVuY3Rpb25cbiAgICAvLyB3aGljaCBpcyB0cmFja1RpbWluZywgd2hlcmVhcyB3aGF0IG5lZWRlZCBpcyBjb250ZXh0IG9mIG9yaWdpbmFsTWV0aG9kLlxuICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICBpZiAoIWV2ZW50TmFtZSkge1xuICAgICAgICBjb25zdCBjb25zdHJ1Y3Rvck5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yID8gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICBldmVudE5hbWUgPSBgJHtjb25zdHJ1Y3Rvck5hbWV9LiR7bmFtZX1gO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhY2tPcGVyYXRpb25UaW1pbmcoZXZlbnROYW1lLFxuICAgICAgICAvLyBNdXN0IHVzZSBhcnJvdyBoZXJlIHRvIGdldCBjb3JyZWN0ICd0aGlzJ1xuICAgICAgICAoKSA9PiBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBPYnRhaW4gYSBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgdGltZXN0YW1wIGluIG1pbGxpc2Vjb25kcywgaWYgcG9zc2libGUuXG4gKiBJZiBgd2luZG93LnBlcmZvcm1hbmNlYCBpcyB1bmF2YWlsYWJsZSAoZS5nLiBpbiBOb2RlKSwgdXNlIHByb2Nlc3MuaHJ0aW1lLlxuICogRmFsbCBiYWNrIHRvIGBEYXRlLm5vd2Agb3RoZXJ3aXNlIOKAkyBub3RlIHRoYXQgYERhdGUubm93YCBkb2VzIG5vdCBndWFyYW50ZWUgdGltZXN0YW1wcyB0b1xuICogaW5jcmVhc2UgbW9ub3RvbmljYWxseSwgYW5kIGlzIHRodXMgc3ViamVjdCB0byBzeXN0ZW0gY2xvY2sgdXBkYXRlcy5cbiAqXG4gKiBXcmFwcGVkIGluIGEgZnVuY3Rpb24gcmF0aGVyIHRoYW4gYSBtb2R1bGUgY29uc3RhbnQgdG8gZmFjaWxpdGF0ZSB0ZXN0aW5nLlxuICovXG5jb25zdCBnZXRUaW1lc3RhbXAgPSAoKTogbnVtYmVyID0+IHtcbiAgY29uc3QgdGltaW5nRnVuY3Rpb24gPSAoZ2xvYmFsLnBlcmZvcm1hbmNlICE9IG51bGwpXG4gICAgPyAoKSA9PiBNYXRoLnJvdW5kKGdsb2JhbC5wZXJmb3JtYW5jZS5ub3coKSlcbiAgICA6IChwcm9jZXNzICE9IG51bGwgJiYgdHlwZW9mIHByb2Nlc3MuaHJ0aW1lID09PSAnZnVuY3Rpb24nKVxuICAgICAgPyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhyID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKGhyWzBdICogMWU5ICsgaHJbMV0pIC8gMWU2KTtcbiAgICAgIH1cbiAgICAgIDogRGF0ZS5ub3c7XG4gIHJldHVybiB0aW1pbmdGdW5jdGlvbigpO1xufTtcblxuY29uc3QgUEVSRk9STUFOQ0VfRVZFTlQgPSAncGVyZm9ybWFuY2UnO1xuXG5jbGFzcyBUaW1pbmdUcmFja2VyIHtcbiAgX2V2ZW50TmFtZTogc3RyaW5nO1xuICBfc3RhcnRUaW1lOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZXZlbnROYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgdGhpcy5fc3RhcnRUaW1lID0gZ2V0VGltZXN0YW1wKCk7XG4gIH1cblxuICBvbkVycm9yKGVycm9yOiBFcnJvcik6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl90cmFja1RpbWluZ0V2ZW50KGVycm9yKTtcbiAgfVxuXG4gIG9uU3VjY2VzcygpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tUaW1pbmdFdmVudCgvKiBlcnJvciAqLyBudWxsKTtcbiAgfVxuXG4gIF90cmFja1RpbWluZ0V2ZW50KGV4Y2VwdGlvbjogP0Vycm9yKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRyYWNrKFBFUkZPUk1BTkNFX0VWRU5ULCB7XG4gICAgICBkdXJhdGlvbjogKGdldFRpbWVzdGFtcCgpIC0gdGhpcy5fc3RhcnRUaW1lKS50b1N0cmluZygpLFxuICAgICAgZXZlbnROYW1lOiB0aGlzLl9ldmVudE5hbWUsXG4gICAgICBlcnJvcjogZXhjZXB0aW9uID8gJzEnIDogJzAnLFxuICAgICAgZXhjZXB0aW9uOiBleGNlcHRpb24gPyBleGNlcHRpb24udG9TdHJpbmcoKSA6ICcnLFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0VHJhY2tpbmcoZXZlbnROYW1lOiBzdHJpbmcpOiBUaW1pbmdUcmFja2VyIHtcbiAgcmV0dXJuIG5ldyBUaW1pbmdUcmFja2VyKGV2ZW50TmFtZSk7XG59XG5cbi8qKlxuICogUmVwb3J0cyBhbmFseXRpY3MgaW5jbHVkaW5nIHRpbWluZyBmb3IgYSBzaW5nbGUgb3BlcmF0aW9uLlxuICpcbiAqIFVzYWdlOlxuICpcbiAqIGFuYWx5dGljcy50cmFja09wZXJhdGlvblRpbWluZygnbXktcGFja2FnZS1zb21lLWxvbmctb3BlcmF0aW9uJyAoKSA9PiBkb2l0KCkpO1xuICpcbiAqIFJldHVybnMgKG9yIHRocm93cykgdGhlIHJlc3VsdCBvZiB0aGUgb3BlcmF0aW9uLlxuICovXG5mdW5jdGlvbiB0cmFja09wZXJhdGlvblRpbWluZzxUPihldmVudE5hbWU6IHN0cmluZywgb3BlcmF0aW9uOiAoKSA9PiBUKTogVCB7XG5cbiAgY29uc3QgdHJhY2tlciA9IHN0YXJ0VHJhY2tpbmcoZXZlbnROYW1lKTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG9wZXJhdGlvbigpO1xuXG4gICAgaWYgKHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpLnByb21pc2VzLmlzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAvLyBBdG9tIHVzZXMgYSBkaWZmZXJlbnQgUHJvbWlzZSBpbXBsZW1lbnRhdGlvbiB0aGFuIE51Y2xpZGUsIHNvIHRoZSBmb2xsb3dpbmcgaXMgbm90IHRydWU6XG4gICAgICAvLyBpbnZhcmlhbnQocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSk7XG5cbiAgICAgIC8vIEZvciB0aGUgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UsIHRyYWNrIHRoZSB0aW1lIGFmdGVyIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkL3JlamVjdGVkLlxuICAgICAgcmV0dXJuIChyZXN1bHQ6IGFueSkudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgIHRyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0sIHJlYXNvbiA9PiB7XG4gICAgICAgIHRyYWNrZXIub25FcnJvcihyZWFzb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlYXNvbiA6IG5ldyBFcnJvcihyZWFzb24pKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRyYWNrZXIub25FcnJvcihlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRyYWNrLFxuICB0cmFja0ltbWVkaWF0ZSxcbiAgdHJhY2tFdmVudCxcbiAgdHJhY2tFdmVudHMsXG4gIHRyYWNrT3BlcmF0aW9uVGltaW5nLFxuICBzdGFydFRyYWNraW5nLFxuICBUaW1pbmdUcmFja2VyLFxuICB0cmFja1RpbWluZyxcbn07XG4iXX0=