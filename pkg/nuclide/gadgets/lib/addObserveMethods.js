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
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFLEVBQUU7QUFDekIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO09BQzNCO0tBQ0Y7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoiYWRkT2JzZXJ2ZU1ldGhvZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG50eXBlIENvbXBhcmVyID0gKGE6IG1peGVkLCBiOiBtaXhlZCkgPT4gYm9vbGVhbjtcbnR5cGUgU3Vic2NyaWJlQ2FsbGJhY2sgPSAoLi4uYXJnczogQXJyYXk8bWl4ZWQ+KSA9PiBtaXhlZDtcbnR5cGUgU3Vic2NyaWJlRnVuY3Rpb24gPSAoY2FsbGJhY2s6IFN1YnNjcmliZUNhbGxiYWNrKSA9PiBJRGlzcG9zYWJsZTtcbnR5cGUgTm90aWZ5RnVuY3Rpb24gPSAoZ2V0VmFsdWU6ICgpID0+IG1peGVkKSA9PiB2b2lkO1xudHlwZSBSZXN1bHQgPSB7bm90aWZ5OiBOb3RpZnlGdW5jdGlvbiwgb2JzZXJ2ZTogU3Vic2NyaWJlRnVuY3Rpb259O1xudHlwZSBNZXRob2RNYXAgPSB7W21ldGhvZE5hbWU6IHN0cmluZ106IChpbnN0YW5jZTogT2JqZWN0KSA9PiBtaXhlZH07XG50eXBlIERlY29yYXRvciA9ICh0YXJnZXQ6IE9iamVjdCkgPT4gT2JqZWN0O1xuXG5jb25zdCBzdHJpY3RFcXVhbHMgPSAoYSwgYikgPT4gYSA9PT0gYjtcblxuLyoqXG4gKiBBIGRlY29yYXRvciBmb3IgYWRkaW5nIEF0b20tc3R5bGUgb2JzZXJ2YXRpb24gbWV0aG9kcyB0byBhIFJlYWN0IGNvbXBvbmVudCBjbGFzcyB3aG9zZVxuICogd2hvc2Ugc3Vic2NyaWJlcnMgYXJlIGludm9rZWQgd2hlbmV2ZXIgdGhlIGNvbXBvbmVudCB1cGRhdGVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRPYnNlcnZlTWV0aG9kcyhtZXRob2RNYXA6IE1ldGhvZE1hcCk6IERlY29yYXRvciB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBjb25zdCBwcm90byA9ICh0YXJnZXQucHJvdG90eXBlOiBPYmplY3QpO1xuXG4gICAgLy8gQWRkIGFuIG9ic2VydmF0aW9uIG1ldGhvZCBmb3IgZWFjaCBpdGVtIGluIHRoZSBtYXAuXG4gICAgT2JqZWN0LmtleXMobWV0aG9kTWFwKS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgICAgY29uc3QgZ2V0VmFsdWUgPSBtZXRob2RNYXBbbWV0aG9kTmFtZV07XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgIHByb3RvLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBjcmVhdGVPYnNlcnZlTWV0aG9kRGVzY3JpcHRvcih0YXJnZXQsIG1ldGhvZE5hbWUsIGdldFZhbHVlKSxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBXcmFwIGBjb21wb25lbnREaWRVcGRhdGVgIHRvIG5vdGlmeSBBdG9tIG9mIGNoYW5nZXMuXG4gICAgY29uc3Qgb2xkTWV0aG9kID0gcHJvdG8uY29tcG9uZW50RGlkVXBkYXRlO1xuICAgIHByb3RvLmNvbXBvbmVudERpZFVwZGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIGlmIChvbGRNZXRob2QpIHtcbiAgICAgICAgb2xkTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX25vdGlmaWVycykge1xuICAgICAgICB0aGlzLl9ub3RpZmllcnMuZm9yRWFjaChub3RpZnkgPT4gbm90aWZ5KCkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBkZXNjcmlwdG9yIHRoYXQgb3ZlcndyaXRlcyBpdHNlbGYgb24gZmlyc3QgYWNjZXNzIHdpdGggYSBtZXRob2QgZm9yIG9ic2VydmluZyBjaGFuZ2VzXG4gKiBvZiBhIHNwZWNpZmljIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBjcmVhdGVPYnNlcnZlTWV0aG9kRGVzY3JpcHRvcih0YXJnZXQsIGtleSwgZ2V0VmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0KCkge1xuICAgICAgLy8gRG9uJ3Qgb3ZlcnJpZGUgd2hlbiBhY2Nlc3NlZCB2aWEgcHJvdG90eXBlLlxuICAgICAgaWYgKHRoaXMgPT09IHRhcmdldC5wcm90b3R5cGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBpbnN0YW5jZSBkb2Vzbid0IGhhdmUgYSBsaXN0IG9mIG5vdGlmaWVycyB5ZXQsIGNyZWF0ZSBvbmUuXG4gICAgICBpZiAoIXRoaXMuX25vdGlmaWVycykge1xuICAgICAgICB0aGlzLl9ub3RpZmllcnMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIG1ldGhvZCB3aXRoIGEgbmV3IHZlcnNpb24gb24gZmlyc3QgYWNjZXNzLlxuICAgICAgY29uc3Qge25vdGlmeSwgb2JzZXJ2ZX0gPSBjcmVhdGVPYnNlcnZlRnVuY3Rpb24oKTtcbiAgICAgIHRoaXMuX25vdGlmaWVycy5wdXNoKCgpID0+IG5vdGlmeSgoKSA9PiBnZXRWYWx1ZSh0aGlzKSkpO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICB2YWx1ZTogb2JzZXJ2ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG9ic2VydmU7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBIHV0aWxpdHkgZm9yIGNyZWF0aW5nIGFuIEF0b20tc3R5bGUgc3Vic2NyaXB0aW9uIGZ1bmN0aW9uIChgb25EaWRDaGFuZ2VCbGFoYCwgYG9ic2VydmVCbGFoYClcbiAqIHdpdGggYW4gYXNzb2NpYXRlZCBub3RpZmljYXRpb24gbWVjaGFuaXNtLiBUaGlzIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGFuIFJ4SlMgU3ViamVjdC4gV2VcbiAqIHByb3ZpZGUgb3VyIG93biBkZWZhdWx0IGNvbXBhcmVyIGJlY2F1c2Ugd2Ugd2FudCB0byBiZSBtb3JlIHN0cmljdCAoYnkgZGVmYXVsdCkgdGhhbiBSeEpTIGlzLlxuICogKEZvciBleGFtcGxlLCBSeEpTIHdpbGwgY29uc2lkZXIgc2ltaWxhciBvYmplY3RzIGVxdWFsLilcbiAqL1xuZnVuY3Rpb24gY3JlYXRlT2JzZXJ2ZUZ1bmN0aW9uKGNvbXBhcmVyOiBDb21wYXJlciA9IHN0cmljdEVxdWFscyk6IFJlc3VsdCB7XG4gIGNvbnN0IHZhbHVlJCA9IG5ldyBSeC5TdWJqZWN0KCk7XG4gIGNvbnN0IGRpc3RpbmN0VmFsdWUkID0gdmFsdWUkLmRpc3RpbmN0VW50aWxDaGFuZ2VkKHVuZGVmaW5lZCwgY29tcGFyZXIpO1xuICAvLyBXcmFwIGVhY2ggY2FsbGJhY2sgc28gdGhhdCB3ZSBkb24ndCBsZWFrIHRoZSBmYWN0IHRoYXQgc3Vic2NyaWJlIGlzIGltcGxlbWVudGVkIHdpdGhcbiAgLy8gb2JzZXJ2YWJsZXMgKGJ5IGFjY2VwdGluZyBPYnNlcnZlcnMgYXMgd2VsbCBhcyBjYWxsYmFja3MpLlxuICByZXR1cm4ge1xuICAgIG9ic2VydmU6IGNhbGxiYWNrID0+IGRpc3RpbmN0VmFsdWUkLnN1YnNjcmliZSh2YWx1ZSA9PiBjYWxsYmFjayh2YWx1ZSkpLFxuICAgIG5vdGlmeShnZXRWYWx1ZSkge1xuICAgICAgLy8gRG9uJ3QgY2FsY3VsYXRlIHRoZSBuZXh0IHZhbHVlIHVubGVzcyBzb21lYm9keSdzIGxpc3RlbmluZy5cbiAgICAgIGlmICh2YWx1ZSQuaGFzT2JzZXJ2ZXJzKCkpIHtcbiAgICAgICAgdmFsdWUkLm9uTmV4dChnZXRWYWx1ZSgpKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuIl19