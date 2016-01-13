Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = addObserveMethods;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

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

  var value$ = new _rx2['default'].Subject();
  var distinctValue$ = value$.distinctUntilChanged(undefined, comparer);
  // Wrap each callback so that we don't leak the fact that subscribe is implemented with
  // observables (by accepting Observers as well as callbacks).
  return {
    observe: function observe(callback) {
      return distinctValue$.subscribe(function (value) {
        return callback(value);
      });
    },
    notify: function notify(getValue) {
      // Don't calculate the next value unless somebody's listening.
      if (value$.hasObservers()) {
        value$.onNext(getValue());
      }
    }
  };
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFLEVBQUU7QUFDekIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO09BQzNCO0tBQ0Y7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiYWRkT2JzZXJ2ZU1ldGhvZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG50eXBlIENvbXBhcmVyID0gKGE6IG1peGVkLCBiOiBtaXhlZCkgPT4gYm9vbGVhbjtcbnR5cGUgU3Vic2NyaWJlQ2FsbGJhY2sgPSAoLi4uYXJnczogQXJyYXk8bWl4ZWQ+KSA9PiBtaXhlZDtcbnR5cGUgU3Vic2NyaWJlRnVuY3Rpb24gPSAoY2FsbGJhY2s6IFN1YnNjcmliZUNhbGxiYWNrKSA9PiBhdG9tJElEaXNwb3NhYmxlO1xudHlwZSBOb3RpZnlGdW5jdGlvbiA9IChnZXRWYWx1ZTogKCkgPT4gbWl4ZWQpID0+IHZvaWQ7XG50eXBlIFJlc3VsdCA9IHtub3RpZnk6IE5vdGlmeUZ1bmN0aW9uLCBvYnNlcnZlOiBTdWJzY3JpYmVGdW5jdGlvbn07XG50eXBlIE1ldGhvZE1hcCA9IHtbbWV0aG9kTmFtZTogc3RyaW5nXTogKGluc3RhbmNlOiBPYmplY3QpID0+IG1peGVkfTtcbnR5cGUgRGVjb3JhdG9yID0gKHRhcmdldDogT2JqZWN0KSA9PiBPYmplY3Q7XG5cbmNvbnN0IHN0cmljdEVxdWFscyA9IChhLCBiKSA9PiBhID09PSBiO1xuXG4vKipcbiAqIEEgZGVjb3JhdG9yIGZvciBhZGRpbmcgQXRvbS1zdHlsZSBvYnNlcnZhdGlvbiBtZXRob2RzIHRvIGEgUmVhY3QgY29tcG9uZW50IGNsYXNzIHdob3NlXG4gKiB3aG9zZSBzdWJzY3JpYmVycyBhcmUgaW52b2tlZCB3aGVuZXZlciB0aGUgY29tcG9uZW50IHVwZGF0ZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE9ic2VydmVNZXRob2RzKG1ldGhvZE1hcDogTWV0aG9kTWFwKTogRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGNvbnN0IHByb3RvID0gKHRhcmdldC5wcm90b3R5cGU6IE9iamVjdCk7XG5cbiAgICAvLyBBZGQgYW4gb2JzZXJ2YXRpb24gbWV0aG9kIGZvciBlYWNoIGl0ZW0gaW4gdGhlIG1hcC5cbiAgICBPYmplY3Qua2V5cyhtZXRob2RNYXApLmZvckVhY2gobWV0aG9kTmFtZSA9PiB7XG4gICAgICBjb25zdCBnZXRWYWx1ZSA9IG1ldGhvZE1hcFttZXRob2ROYW1lXTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgcHJvdG8sXG4gICAgICAgIG1ldGhvZE5hbWUsXG4gICAgICAgIGNyZWF0ZU9ic2VydmVNZXRob2REZXNjcmlwdG9yKHRhcmdldCwgbWV0aG9kTmFtZSwgZ2V0VmFsdWUpLFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIFdyYXAgYGNvbXBvbmVudERpZFVwZGF0ZWAgdG8gbm90aWZ5IEF0b20gb2YgY2hhbmdlcy5cbiAgICBjb25zdCBvbGRNZXRob2QgPSBwcm90by5jb21wb25lbnREaWRVcGRhdGU7XG4gICAgcHJvdG8uY29tcG9uZW50RGlkVXBkYXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgaWYgKG9sZE1ldGhvZCkge1xuICAgICAgICBvbGRNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbm90aWZpZXJzKSB7XG4gICAgICAgIHRoaXMuX25vdGlmaWVycy5mb3JFYWNoKG5vdGlmeSA9PiBub3RpZnkoKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlc2NyaXB0b3IgdGhhdCBvdmVyd3JpdGVzIGl0c2VsZiBvbiBmaXJzdCBhY2Nlc3Mgd2l0aCBhIG1ldGhvZCBmb3Igb2JzZXJ2aW5nIGNoYW5nZXNcbiAqIG9mIGEgc3BlY2lmaWMgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9ic2VydmVNZXRob2REZXNjcmlwdG9yKHRhcmdldCwga2V5LCBnZXRWYWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQoKSB7XG4gICAgICAvLyBEb24ndCBvdmVycmlkZSB3aGVuIGFjY2Vzc2VkIHZpYSBwcm90b3R5cGUuXG4gICAgICBpZiAodGhpcyA9PT0gdGFyZ2V0LnByb3RvdHlwZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGluc3RhbmNlIGRvZXNuJ3QgaGF2ZSBhIGxpc3Qgb2Ygbm90aWZpZXJzIHlldCwgY3JlYXRlIG9uZS5cbiAgICAgIGlmICghdGhpcy5fbm90aWZpZXJzKSB7XG4gICAgICAgIHRoaXMuX25vdGlmaWVycyA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSB0aGUgbWV0aG9kIHdpdGggYSBuZXcgdmVyc2lvbiBvbiBmaXJzdCBhY2Nlc3MuXG4gICAgICBjb25zdCB7bm90aWZ5LCBvYnNlcnZlfSA9IGNyZWF0ZU9ic2VydmVGdW5jdGlvbigpO1xuICAgICAgdGhpcy5fbm90aWZpZXJzLnB1c2goKCkgPT4gbm90aWZ5KCgpID0+IGdldFZhbHVlKHRoaXMpKSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgIHZhbHVlOiBvYnNlcnZlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2JzZXJ2ZTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIEEgdXRpbGl0eSBmb3IgY3JlYXRpbmcgYW4gQXRvbS1zdHlsZSBzdWJzY3JpcHRpb24gZnVuY3Rpb24gKGBvbkRpZENoYW5nZUJsYWhgLCBgb2JzZXJ2ZUJsYWhgKVxuICogd2l0aCBhbiBhc3NvY2lhdGVkIG5vdGlmaWNhdGlvbiBtZWNoYW5pc20uIFRoaXMgaXMganVzdCBhIHRoaW4gd3JhcHBlciBhcm91bmQgYW4gUnhKUyBTdWJqZWN0LiBXZVxuICogcHJvdmlkZSBvdXIgb3duIGRlZmF1bHQgY29tcGFyZXIgYmVjYXVzZSB3ZSB3YW50IHRvIGJlIG1vcmUgc3RyaWN0IChieSBkZWZhdWx0KSB0aGFuIFJ4SlMgaXMuXG4gKiAoRm9yIGV4YW1wbGUsIFJ4SlMgd2lsbCBjb25zaWRlciBzaW1pbGFyIG9iamVjdHMgZXF1YWwuKVxuICovXG5mdW5jdGlvbiBjcmVhdGVPYnNlcnZlRnVuY3Rpb24oY29tcGFyZXI6IENvbXBhcmVyID0gc3RyaWN0RXF1YWxzKTogUmVzdWx0IHtcbiAgY29uc3QgdmFsdWUkID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgY29uc3QgZGlzdGluY3RWYWx1ZSQgPSB2YWx1ZSQuZGlzdGluY3RVbnRpbENoYW5nZWQodW5kZWZpbmVkLCBjb21wYXJlcik7XG4gIC8vIFdyYXAgZWFjaCBjYWxsYmFjayBzbyB0aGF0IHdlIGRvbid0IGxlYWsgdGhlIGZhY3QgdGhhdCBzdWJzY3JpYmUgaXMgaW1wbGVtZW50ZWQgd2l0aFxuICAvLyBvYnNlcnZhYmxlcyAoYnkgYWNjZXB0aW5nIE9ic2VydmVycyBhcyB3ZWxsIGFzIGNhbGxiYWNrcykuXG4gIHJldHVybiB7XG4gICAgb2JzZXJ2ZTogY2FsbGJhY2sgPT4gZGlzdGluY3RWYWx1ZSQuc3Vic2NyaWJlKHZhbHVlID0+IGNhbGxiYWNrKHZhbHVlKSksXG4gICAgbm90aWZ5KGdldFZhbHVlKSB7XG4gICAgICAvLyBEb24ndCBjYWxjdWxhdGUgdGhlIG5leHQgdmFsdWUgdW5sZXNzIHNvbWVib2R5J3MgbGlzdGVuaW5nLlxuICAgICAgaWYgKHZhbHVlJC5oYXNPYnNlcnZlcnMoKSkge1xuICAgICAgICB2YWx1ZSQub25OZXh0KGdldFZhbHVlKCkpO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG4iXX0=