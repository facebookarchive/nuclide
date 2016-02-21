var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerInstance = (function () {
  function DebuggerInstance(processInfo) {
    _classCallCheck(this, DebuggerInstance);

    this._processInfo = processInfo;
  }

  _createClass(DebuggerInstance, [{
    key: 'getDebuggerProcessInfo',
    value: function getDebuggerProcessInfo() {
      return this._processInfo;
    }
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._processInfo.getTargetUri();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      throw new Error('abstract method');
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      throw new Error('abstract method');
    }
  }]);

  return DebuggerInstance;
})();

module.exports = DebuggerInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VySW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBY00sZ0JBQWdCO0FBR1QsV0FIUCxnQkFBZ0IsQ0FHUixXQUFnQyxFQUFFOzBCQUgxQyxnQkFBZ0I7O0FBSWxCLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0dBQ2pDOztlQUxHLGdCQUFnQjs7V0FPRSxrQ0FBd0I7QUFDNUMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDekM7OztXQUVNLG1CQUFTO0FBQ2QsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7V0FFa0IsK0JBQW9CO0FBQ3JDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRVcsc0JBQUMsUUFBb0IsRUFFL0I7QUFDQSxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztTQTNCRyxnQkFBZ0I7OztBQThCdEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckluc3RhbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG5jbGFzcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX3Byb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKSB7XG4gICAgdGhpcy5fcHJvY2Vzc0luZm8gPSBwcm9jZXNzSW5mbztcbiAgfVxuXG4gIGdldERlYnVnZ2VyUHJvY2Vzc0luZm8oKTogRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NJbmZvO1xuICB9XG5cbiAgZ2V0VGFyZ2V0VXJpKCk6IE51Y2xpZGVVcmkge1xuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzSW5mby5nZXRUYXJnZXRVcmkoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKToge1xuICAgIGRpc3Bvc2UoKTogdm9pZDtcbiAgfSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VySW5zdGFuY2U7XG4iXX0=