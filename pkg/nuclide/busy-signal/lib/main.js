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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBZThDLE1BQU07O3NCQUM5QixRQUFROzs7OzRCQUNILGdCQUFnQjs7SUFFckMsVUFBVTtBQUtILFdBTFAsVUFBVSxHQUtBOzBCQUxWLFVBQVU7O0FBTVosUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLGdDQUFrQixDQUFDO0dBQ3pDOztlQVJHLFVBQVU7O1dBVVAsbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFZSwwQkFBQyxTQUF5QixFQUFlOzs7cUJBQy9CLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzs7VUFBM0MsYUFBYSxZQUFiLGFBQWE7O0FBQ3BCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUNoRSxtQkFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLFVBQU0sVUFBVSxHQUFHLHFCQUFlLFlBQU07QUFDdEMsWUFBSSxNQUFLLGNBQWMsRUFBRTtBQUN2QixnQkFBSyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsZ0JBQUssY0FBYyxHQUFHLElBQUksQ0FBQztTQUM1QjtPQUNGLENBQUMsQ0FBQztBQUNILG1CQUFhLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztXQUV3QixtQ0FBQyxRQUE0QixFQUFlO0FBQ25FLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sVUFBVSxDQUFDO0tBQ25COzs7U0FqQ0csVUFBVTs7O0FBb0NoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQVE7QUFDN0MsWUFBVSxFQUFFLENBQUM7QUFDYixZQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztDQUMvQjs7QUFFTSxTQUFTLGdCQUFnQixDQUFDLFNBQXlCLEVBQWU7QUFDdkUsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDL0M7O0FBRU0sU0FBUyx5QkFBeUIsQ0FBQyxRQUE0QixFQUFlO0FBQ25GLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sVUFBVSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3ZEOztBQUVNLFNBQVMsVUFBVSxHQUFTO0FBQ2pDLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlcn0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB0eXBlIHtTdGF0dXNCYXJUaWxlIGFzIFN0YXR1c0JhclRpbGVUeXBlfSBmcm9tICcuL1N0YXR1c0JhclRpbGUnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtNZXNzYWdlU3RvcmV9IGZyb20gJy4vTWVzc2FnZVN0b3JlJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9zdGF0dXNCYXJUaWxlOiA/U3RhdHVzQmFyVGlsZVR5cGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21lc3NhZ2VTdG9yZTogTWVzc2FnZVN0b3JlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9tZXNzYWdlU3RvcmUgPSBuZXcgTWVzc2FnZVN0b3JlKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCB7U3RhdHVzQmFyVGlsZX0gPSByZXF1aXJlKCcuL1N0YXR1c0JhclRpbGUnKTtcbiAgICBjb25zdCBzdGF0dXNCYXJUaWxlID0gdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG5ldyBTdGF0dXNCYXJUaWxlKCk7XG4gICAgc3RhdHVzQmFyVGlsZS5jb25zdW1lTWVzc2FnZVN0cmVhbSh0aGlzLl9tZXNzYWdlU3RvcmUuZ2V0TWVzc2FnZVN0cmVhbSgpKTtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3N0YXR1c0JhclRpbGUpIHtcbiAgICAgICAgdGhpcy5fc3RhdHVzQmFyVGlsZS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3N0YXR1c0JhclRpbGUgPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHN0YXR1c0JhclRpbGUuY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChkaXNwb3NhYmxlKTtcbiAgICByZXR1cm4gZGlzcG9zYWJsZTtcbiAgfVxuXG4gIGNvbnN1bWVCdXN5U2lnbmFsUHJvdmlkZXIocHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5fbWVzc2FnZVN0b3JlLmNvbnN1bWVQcm92aWRlcihwcm92aWRlcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBkZWFjdGl2YXRlKCk7XG4gIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVCdXN5U2lnbmFsUHJvdmlkZXIocHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lQnVzeVNpZ25hbFByb3ZpZGVyKHByb3ZpZGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cbiJdfQ==