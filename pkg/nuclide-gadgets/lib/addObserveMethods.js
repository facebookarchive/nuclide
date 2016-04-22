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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var _nuclideCommons = require('../../nuclide-commons');

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

  var value$ = new _reactivexRxjs2['default'].Subject();
  var distinctValue$ = value$.distinctUntilChanged(undefined, comparer);
  // Wrap each callback so that we don't leak the fact that subscribe is implemented with
  // observables (by accepting Observers as well as callbacks).
  return {
    observe: function observe(callback) {
      return new _nuclideCommons.DisposableSubscription(distinctValue$.subscribe(function (value) {
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFFOztBQUVmLFVBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDM0IsY0FBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO09BQ3pCO0tBQ0Y7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiYWRkT2JzZXJ2ZU1ldGhvZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCB7RGlzcG9zYWJsZVN1YnNjcmlwdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxudHlwZSBDb21wYXJlciA9IChhOiBtaXhlZCwgYjogbWl4ZWQpID0+IGJvb2xlYW47XG50eXBlIFN1YnNjcmliZUNhbGxiYWNrID0gKC4uLmFyZ3M6IEFycmF5PG1peGVkPikgPT4gbWl4ZWQ7XG50eXBlIFN1YnNjcmliZUZ1bmN0aW9uID0gKGNhbGxiYWNrOiBTdWJzY3JpYmVDYWxsYmFjaykgPT4gSURpc3Bvc2FibGU7XG50eXBlIE5vdGlmeUZ1bmN0aW9uID0gKGdldFZhbHVlOiAoKSA9PiBtaXhlZCkgPT4gdm9pZDtcbnR5cGUgUmVzdWx0ID0ge25vdGlmeTogTm90aWZ5RnVuY3Rpb247IG9ic2VydmU6IFN1YnNjcmliZUZ1bmN0aW9ufTtcbnR5cGUgTWV0aG9kTWFwID0ge1ttZXRob2ROYW1lOiBzdHJpbmddOiAoaW5zdGFuY2U6IE9iamVjdCkgPT4gbWl4ZWR9O1xudHlwZSBEZWNvcmF0b3IgPSAodGFyZ2V0OiBPYmplY3QpID0+IE9iamVjdDtcblxuY29uc3Qgc3RyaWN0RXF1YWxzID0gKGEsIGIpID0+IGEgPT09IGI7XG5cbi8qKlxuICogQSBkZWNvcmF0b3IgZm9yIGFkZGluZyBBdG9tLXN0eWxlIG9ic2VydmF0aW9uIG1ldGhvZHMgdG8gYSBSZWFjdCBjb21wb25lbnQgY2xhc3Mgd2hvc2VcbiAqIHdob3NlIHN1YnNjcmliZXJzIGFyZSBpbnZva2VkIHdoZW5ldmVyIHRoZSBjb21wb25lbnQgdXBkYXRlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkT2JzZXJ2ZU1ldGhvZHMobWV0aG9kTWFwOiBNZXRob2RNYXApOiBEZWNvcmF0b3Ige1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgY29uc3QgcHJvdG8gPSAodGFyZ2V0LnByb3RvdHlwZTogT2JqZWN0KTtcblxuICAgIC8vIEFkZCBhbiBvYnNlcnZhdGlvbiBtZXRob2QgZm9yIGVhY2ggaXRlbSBpbiB0aGUgbWFwLlxuICAgIE9iamVjdC5rZXlzKG1ldGhvZE1hcCkuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgIGNvbnN0IGdldFZhbHVlID0gbWV0aG9kTWFwW21ldGhvZE5hbWVdO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICBwcm90byxcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgY3JlYXRlT2JzZXJ2ZU1ldGhvZERlc2NyaXB0b3IodGFyZ2V0LCBtZXRob2ROYW1lLCBnZXRWYWx1ZSksXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gV3JhcCBgY29tcG9uZW50RGlkVXBkYXRlYCB0byBub3RpZnkgQXRvbSBvZiBjaGFuZ2VzLlxuICAgIGNvbnN0IG9sZE1ldGhvZCA9IHByb3RvLmNvbXBvbmVudERpZFVwZGF0ZTtcbiAgICBwcm90by5jb21wb25lbnREaWRVcGRhdGUgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICBpZiAob2xkTWV0aG9kKSB7XG4gICAgICAgIG9sZE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9ub3RpZmllcnMpIHtcbiAgICAgICAgdGhpcy5fbm90aWZpZXJzLmZvckVhY2gobm90aWZ5ID0+IG5vdGlmeSgpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVzY3JpcHRvciB0aGF0IG92ZXJ3cml0ZXMgaXRzZWxmIG9uIGZpcnN0IGFjY2VzcyB3aXRoIGEgbWV0aG9kIGZvciBvYnNlcnZpbmcgY2hhbmdlc1xuICogb2YgYSBzcGVjaWZpYyBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT2JzZXJ2ZU1ldGhvZERlc2NyaXB0b3IodGFyZ2V0LCBrZXksIGdldFZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldCgpIHtcbiAgICAgIC8vIERvbid0IG92ZXJyaWRlIHdoZW4gYWNjZXNzZWQgdmlhIHByb3RvdHlwZS5cbiAgICAgIGlmICh0aGlzID09PSB0YXJnZXQucHJvdG90eXBlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgaW5zdGFuY2UgZG9lc24ndCBoYXZlIGEgbGlzdCBvZiBub3RpZmllcnMgeWV0LCBjcmVhdGUgb25lLlxuICAgICAgaWYgKCF0aGlzLl9ub3RpZmllcnMpIHtcbiAgICAgICAgdGhpcy5fbm90aWZpZXJzID0gW107XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBtZXRob2Qgd2l0aCBhIG5ldyB2ZXJzaW9uIG9uIGZpcnN0IGFjY2Vzcy5cbiAgICAgIGNvbnN0IHtub3RpZnksIG9ic2VydmV9ID0gY3JlYXRlT2JzZXJ2ZUZ1bmN0aW9uKCk7XG4gICAgICB0aGlzLl9ub3RpZmllcnMucHVzaCgoKSA9PiBub3RpZnkoKCkgPT4gZ2V0VmFsdWUodGhpcykpKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICAgICAgdmFsdWU6IG9ic2VydmUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBvYnNlcnZlO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogQSB1dGlsaXR5IGZvciBjcmVhdGluZyBhbiBBdG9tLXN0eWxlIHN1YnNjcmlwdGlvbiBmdW5jdGlvbiAoYG9uRGlkQ2hhbmdlQmxhaGAsIGBvYnNlcnZlQmxhaGApXG4gKiB3aXRoIGFuIGFzc29jaWF0ZWQgbm90aWZpY2F0aW9uIG1lY2hhbmlzbS4gVGhpcyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhbiBSeEpTIFN1YmplY3QuIFdlXG4gKiBwcm92aWRlIG91ciBvd24gZGVmYXVsdCBjb21wYXJlciBiZWNhdXNlIHdlIHdhbnQgdG8gYmUgbW9yZSBzdHJpY3QgKGJ5IGRlZmF1bHQpIHRoYW4gUnhKUyBpcy5cbiAqIChGb3IgZXhhbXBsZSwgUnhKUyB3aWxsIGNvbnNpZGVyIHNpbWlsYXIgb2JqZWN0cyBlcXVhbC4pXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9ic2VydmVGdW5jdGlvbihjb21wYXJlcjogQ29tcGFyZXIgPSBzdHJpY3RFcXVhbHMpOiBSZXN1bHQge1xuICBjb25zdCB2YWx1ZSQgPSBuZXcgUnguU3ViamVjdCgpO1xuICBjb25zdCBkaXN0aW5jdFZhbHVlJCA9IHZhbHVlJC5kaXN0aW5jdFVudGlsQ2hhbmdlZCh1bmRlZmluZWQsIGNvbXBhcmVyKTtcbiAgLy8gV3JhcCBlYWNoIGNhbGxiYWNrIHNvIHRoYXQgd2UgZG9uJ3QgbGVhayB0aGUgZmFjdCB0aGF0IHN1YnNjcmliZSBpcyBpbXBsZW1lbnRlZCB3aXRoXG4gIC8vIG9ic2VydmFibGVzIChieSBhY2NlcHRpbmcgT2JzZXJ2ZXJzIGFzIHdlbGwgYXMgY2FsbGJhY2tzKS5cbiAgcmV0dXJuIHtcbiAgICBvYnNlcnZlOiBjYWxsYmFjayA9PiBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgIGRpc3RpbmN0VmFsdWUkLnN1YnNjcmliZSh2YWx1ZSA9PiBjYWxsYmFjayh2YWx1ZSkpXG4gICAgKSxcbiAgICBub3RpZnkoZ2V0VmFsdWUpIHtcbiAgICAgIC8vIERvbid0IGNhbGN1bGF0ZSB0aGUgbmV4dCB2YWx1ZSB1bmxlc3Mgc29tZWJvZHkncyBsaXN0ZW5pbmcuXG4gICAgICBpZiAodmFsdWUkLm9ic2VydmVycy5sZW5ndGgpIHtcbiAgICAgICAgdmFsdWUkLm5leHQoZ2V0VmFsdWUoKSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==