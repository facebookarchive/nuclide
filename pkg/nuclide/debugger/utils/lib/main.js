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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DebuggerProcess = (function () {
  function DebuggerProcess() {
    _classCallCheck(this, DebuggerProcess);
  }

  _createClass(DebuggerProcess, [{
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

  return DebuggerProcess;
})();

exports.DebuggerProcess = DebuggerProcess;

var DebuggerProcessInfo = (function () {
  function DebuggerProcessInfo(serviceName) {
    _classCallCheck(this, DebuggerProcessInfo);

    this._serviceName = serviceName;
  }

  _createClass(DebuggerProcessInfo, [{
    key: 'toString',
    value: function toString() {
      return this._serviceName + ' : ' + this.displayString();
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      throw new Error('abstract method');
    }
  }, {
    key: 'getServiceName',
    value: function getServiceName() {
      return this._serviceName;
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      throw new Error('abstract method');
    }
  }, {
    key: 'attach',
    value: function attach() {
      throw new Error('abstract method');
    }
  }]);

  return DebuggerProcessInfo;
})();

exports.DebuggerProcessInfo = DebuggerProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWdCYSxlQUFlO1dBQWYsZUFBZTswQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUNuQixtQkFBUztBQUNkLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRWtCLCtCQUFvQjtBQUNyQyxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztXQUVXLHNCQUFDLFFBQW9CLEVBRS9CO0FBQ0EsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7U0FiVSxlQUFlOzs7OztJQWdCZixtQkFBbUI7QUFHbkIsV0FIQSxtQkFBbUIsQ0FHbEIsV0FBbUIsRUFBRTswQkFIdEIsbUJBQW1COztBQUk1QixRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztHQUNqQzs7ZUFMVSxtQkFBbUI7O1dBT3RCLG9CQUFXO0FBQ2pCLGFBQVUsSUFBSSxDQUFDLFlBQVksV0FBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUc7S0FDekQ7OztXQUVZLHlCQUFXO0FBQ3RCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRWEsMEJBQVc7QUFDdkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFYSx3QkFBQyxLQUEyQyxFQUFVO0FBQ2xFLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRUssa0JBQXNDO0FBQzFDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBekJVLG1CQUFtQiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VySW5zdGFuY2UsXG4gIG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyxcbn0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUHJvY2VzcyB7XG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKToge1xuICAgIGRpc3Bvc2UoKTogdm9pZDtcbiAgfSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIF9zZXJ2aWNlTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZXJ2aWNlTmFtZSA9IHNlcnZpY2VOYW1lO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fc2VydmljZU5hbWV9IDogJHt0aGlzLmRpc3BsYXlTdHJpbmcoKX1gO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICBnZXRTZXJ2aWNlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlTmFtZTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICBhdHRhY2goKTogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlckluc3RhbmNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG59XG4iXX0=