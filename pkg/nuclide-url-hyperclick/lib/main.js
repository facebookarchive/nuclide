Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.getHyperclickProvider = getHyperclickProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {}
  }, {
    key: 'getHyperclickProvider',
    value: function getHyperclickProvider() {
      var provider = this._hyperclickProvider;
      if (provider == null) {
        var _require = require('./HyperclickProvider');

        var HyperclickProvider = _require.HyperclickProvider;

        this._hyperclickProvider = provider = new HyperclickProvider();
      }
      return provider;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function getHyperclickProvider() {
  (0, _assert2['default'])(activation);
  return activation.getHyperclickProvider();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7c0JBQ2xCLFFBQVE7Ozs7SUFJeEIsVUFBVTtBQUlILFdBSlAsVUFBVSxDQUlGLEtBQWMsRUFBRTswQkFKeEIsVUFBVTs7QUFLWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0dBQy9DOztlQU5HLFVBQVU7O1dBUU4sb0JBQVMsRUFDaEI7OztXQUVvQixpQ0FBMkI7QUFDOUMsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0FBQ3hDLFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTt1QkFDUyxPQUFPLENBQUMsc0JBQXNCLENBQUM7O1lBQXJELGtCQUFrQixZQUFsQixrQkFBa0I7O0FBQ3pCLFlBQUksQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO09BQ2hFO0FBQ0QsYUFBTyxRQUFRLENBQUM7S0FDakI7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBdEJHLFVBQVU7OztBQXlCaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsY0FBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ3ZCO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQVM7QUFDakMsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0Y7O0FBRU0sU0FBUyxxQkFBcUIsR0FBMkI7QUFDOUQsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQztDQUMzQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tQcm92aWRlciBhcyBIeXBlcmNsaWNrUHJvdmlkZXJUeXBlfSBmcm9tICcuL0h5cGVyY2xpY2tQcm92aWRlcic7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oeXBlcmNsaWNrUHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlclR5cGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgfVxuXG4gIGdldEh5cGVyY2xpY2tQcm92aWRlcigpOiBIeXBlcmNsaWNrUHJvdmlkZXJUeXBlIHtcbiAgICBsZXQgcHJvdmlkZXIgPSB0aGlzLl9oeXBlcmNsaWNrUHJvdmlkZXI7XG4gICAgaWYgKHByb3ZpZGVyID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHtIeXBlcmNsaWNrUHJvdmlkZXJ9ID0gcmVxdWlyZSgnLi9IeXBlcmNsaWNrUHJvdmlkZXInKTtcbiAgICAgIHRoaXMuX2h5cGVyY2xpY2tQcm92aWRlciA9IHByb3ZpZGVyID0gbmV3IEh5cGVyY2xpY2tQcm92aWRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvdmlkZXI7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgYWN0aXZhdGlvbi5hY3RpdmF0ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICBpZiAoYWN0aXZhdGlvbiAhPSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh5cGVyY2xpY2tQcm92aWRlcigpOiBIeXBlcmNsaWNrUHJvdmlkZXJUeXBlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4gYWN0aXZhdGlvbi5nZXRIeXBlcmNsaWNrUHJvdmlkZXIoKTtcbn1cbiJdfQ==