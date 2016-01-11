var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var WebInspector = window.WebInspector;

/**
 * Wrapper around `WebInspector.Object` to act like `atom.Emitter`.
 */

var Emitter = (function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this._underlying = new WebInspector.Object();
  }

  _createClass(Emitter, [{
    key: 'on',
    value: function on(eventType, callback) {
      var _this = this;

      var listener = function listener(event) {
        return callback(event.data);
      };
      this._underlying.addEventListener(eventType, listener);
      return {
        dispose: function dispose() {
          _this._underlying.removeEventListener(eventType, listener);
        }
      };
    }
  }, {
    key: 'emit',
    value: function emit(eventType, value) {
      this._underlying.dispatchEventToListeners(eventType, value);
    }
  }]);

  return Emitter;
})();

module.exports = Emitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtaXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxZQUFpQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7Ozs7OztJQUt4RCxPQUFPO0FBR0EsV0FIUCxPQUFPLEdBR0c7MEJBSFYsT0FBTzs7QUFJVCxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzlDOztlQUxHLE9BQU87O1dBT1QsWUFBQyxTQUFpQixFQUFFLFFBQStCLEVBQXlCOzs7QUFDNUUsVUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUcsS0FBSztlQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQztBQUMvQyxVQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN2RCxhQUFPO0FBQ0wsZUFBTyxFQUFFLG1CQUFNO0FBQ2IsZ0JBQUssV0FBVyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMzRDtPQUNGLENBQUM7S0FDSDs7O1dBRUcsY0FBQyxTQUFpQixFQUFFLEtBQVcsRUFBUTtBQUN6QyxVQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM3RDs7O1NBbkJHLE9BQU87OztBQXNCYixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsImZpbGUiOiJFbWl0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgV2ViSW5zcGVjdG9yOiB0eXBlb2YgV2ViSW5zcGVjdG9yID0gd2luZG93LldlYkluc3BlY3RvcjtcblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBgV2ViSW5zcGVjdG9yLk9iamVjdGAgdG8gYWN0IGxpa2UgYGF0b20uRW1pdHRlcmAuXG4gKi9cbmNsYXNzIEVtaXR0ZXIge1xuICBfdW5kZXJseWluZzogV2ViSW5zcGVjdG9yLk9iamVjdDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl91bmRlcmx5aW5nID0gbmV3IFdlYkluc3BlY3Rvci5PYmplY3QoKTtcbiAgfVxuXG4gIG9uKGV2ZW50VHlwZTogc3RyaW5nLCBjYWxsYmFjazogKHZhbHVlPzogYW55KSA9PiB2b2lkKToge2Rpc3Bvc2U6ICgpID0+IHZvaWR9IHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IGV2ZW50ID0+IGNhbGxiYWNrKGV2ZW50LmRhdGEpO1xuICAgIHRoaXMuX3VuZGVybHlpbmcuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICB0aGlzLl91bmRlcmx5aW5nLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lcik7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBlbWl0KGV2ZW50VHlwZTogc3RyaW5nLCB2YWx1ZT86IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX3VuZGVybHlpbmcuZGlzcGF0Y2hFdmVudFRvTGlzdGVuZXJzKGV2ZW50VHlwZSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcbiJdfQ==