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

exports.activate = activate;
exports.consumeStatusBar = consumeStatusBar;
exports.consumeBusySignalProvider = consumeBusySignalProvider;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _MessageStore = require('./MessageStore');

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
    this._messageStore = new _MessageStore.MessageStore();
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var _this = this;

      var _require = require('./StatusBarTile');

      var StatusBarTile = _require.StatusBarTile;

      var statusBarTile = this._statusBarTile = new StatusBarTile();
      statusBarTile.consumeMessageStream(this._messageStore.getMessageStream());
      var disposable = new _atom.Disposable(function () {
        if (_this._statusBarTile) {
          _this._statusBarTile.dispose();
          _this._statusBarTile = null;
        }
      });
      statusBarTile.consumeStatusBar(statusBar);
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'consumeBusySignalProvider',
    value: function consumeBusySignalProvider(provider) {
      var disposable = this._messageStore.consumeProvider(provider);
      this._disposables.add(disposable);
      return disposable;
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  deactivate();
  activation = new Activation();
}

function consumeStatusBar(statusBar) {
  (0, _assert2['default'])(activation);
  return activation.consumeStatusBar(statusBar);
}

function consumeBusySignalProvider(provider) {
  (0, _assert2['default'])(activation);
  return activation.consumeBusySignalProvider(provider);
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBZThDLE1BQU07O3NCQUM5QixRQUFROzs7OzRCQUNILGdCQUFnQjs7SUFFckMsVUFBVTtBQUtILFdBTFAsVUFBVSxHQUtBOzBCQUxWLFVBQVU7O0FBTVosUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLGdDQUFrQixDQUFDO0dBQ3pDOztlQVJHLFVBQVU7O1dBVVAsbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFZSwwQkFBQyxTQUF5QixFQUFlOzs7cUJBQy9CLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzs7VUFBM0MsYUFBYSxZQUFiLGFBQWE7O0FBQ3BCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUNoRSxtQkFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLFVBQU0sVUFBVSxHQUFHLHFCQUFlLFlBQU07QUFDdEMsWUFBSSxNQUFLLGNBQWMsRUFBRTtBQUN2QixnQkFBSyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsZ0JBQUssY0FBYyxHQUFHLElBQUksQ0FBQztTQUM1QjtPQUNGLENBQUMsQ0FBQztBQUNILG1CQUFhLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztXQUV3QixtQ0FBQyxRQUE0QixFQUFlO0FBQ25FLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sVUFBVSxDQUFDO0tBQ25COzs7U0FqQ0csVUFBVTs7O0FBb0NoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQVE7QUFDN0MsWUFBVSxFQUFFLENBQUM7QUFDYixZQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztDQUMvQjs7QUFFTSxTQUFTLGdCQUFnQixDQUFDLFNBQXlCLEVBQWU7QUFDdkUsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDL0M7O0FBRU0sU0FBUyx5QkFBeUIsQ0FBQyxRQUE0QixFQUFlO0FBQ25GLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sVUFBVSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3ZEOztBQUVNLFNBQVMsVUFBVSxHQUFTO0FBQ2pDLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHR5cGUge1N0YXR1c0JhclRpbGUgYXMgU3RhdHVzQmFyVGlsZVR5cGV9IGZyb20gJy4vU3RhdHVzQmFyVGlsZSc7XG5cbmltcG9ydCB7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge01lc3NhZ2VTdG9yZX0gZnJvbSAnLi9NZXNzYWdlU3RvcmUnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX3N0YXR1c0JhclRpbGU6ID9TdGF0dXNCYXJUaWxlVHlwZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbWVzc2FnZVN0b3JlOiBNZXNzYWdlU3RvcmU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX21lc3NhZ2VTdG9yZSA9IG5ldyBNZXNzYWdlU3RvcmUoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IHtTdGF0dXNCYXJUaWxlfSA9IHJlcXVpcmUoJy4vU3RhdHVzQmFyVGlsZScpO1xuICAgIGNvbnN0IHN0YXR1c0JhclRpbGUgPSB0aGlzLl9zdGF0dXNCYXJUaWxlID0gbmV3IFN0YXR1c0JhclRpbGUoKTtcbiAgICBzdGF0dXNCYXJUaWxlLmNvbnN1bWVNZXNzYWdlU3RyZWFtKHRoaXMuX21lc3NhZ2VTdG9yZS5nZXRNZXNzYWdlU3RyZWFtKCkpO1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fc3RhdHVzQmFyVGlsZSkge1xuICAgICAgICB0aGlzLl9zdGF0dXNCYXJUaWxlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc3RhdHVzQmFyVGlsZS5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG5cbiAgY29uc3VtZUJ1c3lTaWduYWxQcm92aWRlcihwcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLl9tZXNzYWdlU3RvcmUuY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoZGlzcG9zYWJsZSk7XG4gICAgcmV0dXJuIGRpc3Bvc2FibGU7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KTogdm9pZCB7XG4gIGRlYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUJ1c3lTaWduYWxQcm92aWRlcihwcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCdXN5U2lnbmFsUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19