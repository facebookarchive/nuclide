Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _CwdApi = require('./CwdApi');

var _atom = require('atom');

var Activation = (function () {
  function Activation(rawState) {
    _classCallCheck(this, Activation);

    var state = rawState || {};
    var initialCwdPath = state.initialCwdPath;

    this._cwdApi = new _CwdApi.CwdApi(initialCwdPath);
    this._disposables = new _atom.CompositeDisposable(this._cwdApi);
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'provideApi',
    value: function provideApi() {
      return this._cwdApi;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var cwd = this._cwdApi.getCwd();
      return {
        initialCwdPath: cwd == null ? null : cwd.getPath()
      };
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFXcUIsVUFBVTs7b0JBQ0csTUFBTTs7SUFFM0IsVUFBVTtBQUlWLFdBSkEsVUFBVSxDQUlULFFBQWlCLEVBQUU7MEJBSnBCLFVBQVU7O0FBS25CLFFBQU0sS0FBSyxHQUFHLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDdEIsY0FBYyxHQUFJLEtBQUssQ0FBdkIsY0FBYzs7QUFDckIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBVyxjQUFjLENBQUMsQ0FBQztBQUMxQyxRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7R0FDSDs7ZUFYVSxVQUFVOztXQWFkLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRVMsc0JBQVc7QUFDbkIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCOzs7V0FFUSxxQkFBVztBQUNsQixVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xDLGFBQU87QUFDTCxzQkFBYyxFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUU7T0FDbkQsQ0FBQztLQUNIOzs7U0ExQlUsVUFBVSIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDd2RBcGl9IGZyb20gJy4vQ3dkQXBpJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2N3ZEFwaTogQ3dkQXBpO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHJhd1N0YXRlIHx8IHt9O1xuICAgIGNvbnN0IHtpbml0aWFsQ3dkUGF0aH0gPSBzdGF0ZTtcbiAgICB0aGlzLl9jd2RBcGkgPSBuZXcgQ3dkQXBpKGluaXRpYWxDd2RQYXRoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgdGhpcy5fY3dkQXBpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHByb3ZpZGVBcGkoKTogQ3dkQXBpIHtcbiAgICByZXR1cm4gdGhpcy5fY3dkQXBpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgY29uc3QgY3dkID0gdGhpcy5fY3dkQXBpLmdldEN3ZCgpO1xuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsQ3dkUGF0aDogY3dkID09IG51bGwgPyBudWxsIDogY3dkLmdldFBhdGgoKSxcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==