var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO(jeffreytan): This is duplicated what we have in
// fbobjc/Tools/Nuclide/pkg/nuclide/debugger-utils/lib/main.js.
// It seems like once we move everything over to Tools/Nuclide,
// the nuclide-debugger-utils package can go away because then
// nuclide-debugger-lldb can depend on this nuclide-debugger package directly.

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
  }, {
    key: 'launch',
    value: function launch(launchTarget) {
      throw new Error('abstract method');
    }

    // For debugLLDB().
  }]);

  return DebuggerProcessInfo;
})();

module.exports = DebuggerProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJvY2Vzc0luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNLG1CQUFtQjtBQUdaLFdBSFAsbUJBQW1CLENBR1gsV0FBbUIsRUFBRTswQkFIN0IsbUJBQW1COztBQUlyQixRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztHQUNqQzs7ZUFMRyxtQkFBbUI7O1dBT2Ysb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDekQ7OztXQUVZLHlCQUFXO0FBQ3RCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRWEsMEJBQVc7QUFDdkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFYSx3QkFBQyxLQUF5QixFQUFVO0FBQ2hELFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRUssa0JBQXNDO0FBQzFDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1dBRUssZ0JBQUMsWUFBb0IsRUFBcUM7QUFDOUQsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7OztTQTdCRyxtQkFBbUI7OztBQW9DekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVE9ETyhqZWZmcmV5dGFuKTogVGhpcyBpcyBkdXBsaWNhdGVkIHdoYXQgd2UgaGF2ZSBpblxuLy8gZmJvYmpjL1Rvb2xzL051Y2xpZGUvcGtnL251Y2xpZGUvZGVidWdnZXItdXRpbHMvbGliL21haW4uanMuXG4vLyBJdCBzZWVtcyBsaWtlIG9uY2Ugd2UgbW92ZSBldmVyeXRoaW5nIG92ZXIgdG8gVG9vbHMvTnVjbGlkZSxcbi8vIHRoZSBudWNsaWRlLWRlYnVnZ2VyLXV0aWxzIHBhY2thZ2UgY2FuIGdvIGF3YXkgYmVjYXVzZSB0aGVuXG4vLyBudWNsaWRlLWRlYnVnZ2VyLWxsZGIgY2FuIGRlcGVuZCBvbiB0aGlzIG51Y2xpZGUtZGVidWdnZXIgcGFja2FnZSBkaXJlY3RseS5cblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuY2xhc3MgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIF9zZXJ2aWNlTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZXJ2aWNlTmFtZSA9IHNlcnZpY2VOYW1lO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZU5hbWUgKyAnIDogJyArIHRoaXMuZGlzcGxheVN0cmluZygpO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICBnZXRTZXJ2aWNlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlTmFtZTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOkRlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICBhdHRhY2goKTogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlckluc3RhbmNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgbGF1bmNoKGxhdW5jaFRhcmdldDogc3RyaW5nKTogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlckluc3RhbmNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgLy8gRm9yIGRlYnVnTExEQigpLlxuICBwaWQ6ID9udW1iZXI7XG4gIGJhc2VwYXRoOiA/c3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyUHJvY2Vzc0luZm87XG4iXX0=