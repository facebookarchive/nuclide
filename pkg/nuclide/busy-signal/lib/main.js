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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBZThDLE1BQU07O3NCQUM5QixRQUFROzs7OzRCQUNILGdCQUFnQjs7SUFFckMsVUFBVTtBQUtILFdBTFAsVUFBVSxHQUtBOzBCQUxWLFVBQVU7O0FBTVosUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLGdDQUFrQixDQUFDO0dBQ3pDOztlQVJHLFVBQVU7O1dBVVAsbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFZSwwQkFBQyxTQUF5QixFQUFtQjs7O3FCQUNuQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O1VBQTNDLGFBQWEsWUFBYixhQUFhOztBQUNwQixVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDaEUsbUJBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUMxRSxVQUFNLFVBQVUsR0FBRyxxQkFBZSxZQUFNO0FBQ3RDLFlBQUksTUFBSyxjQUFjLEVBQUU7QUFDdkIsZ0JBQUssY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLGdCQUFLLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDNUI7T0FDRixDQUFDLENBQUM7QUFDSCxtQkFBYSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sVUFBVSxDQUFDO0tBQ25COzs7V0FFd0IsbUNBQUMsUUFBNEIsRUFBbUI7QUFDdkUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEUsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztTQWpDRyxVQUFVOzs7QUFvQ2hCLElBQUksVUFBdUIsR0FBRyxJQUFJLENBQUM7O0FBRTVCLFNBQVMsUUFBUSxDQUFDLEtBQWMsRUFBUTtBQUM3QyxZQUFVLEVBQUUsQ0FBQztBQUNiLFlBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0NBQy9COztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsU0FBeUIsRUFBbUI7QUFDM0UsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDL0M7O0FBRU0sU0FBUyx5QkFBeUIsQ0FBQyxRQUE0QixFQUFtQjtBQUN2RiwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN2RDs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQyxNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSB7U3RhdHVzQmFyVGlsZSBhcyBTdGF0dXNCYXJUaWxlVHlwZX0gZnJvbSAnLi9TdGF0dXNCYXJUaWxlJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7TWVzc2FnZVN0b3JlfSBmcm9tICcuL01lc3NhZ2VTdG9yZSc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfc3RhdHVzQmFyVGlsZTogP1N0YXR1c0JhclRpbGVUeXBlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tZXNzYWdlU3RvcmU6IE1lc3NhZ2VTdG9yZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fbWVzc2FnZVN0b3JlID0gbmV3IE1lc3NhZ2VTdG9yZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIGNvbnN0IHtTdGF0dXNCYXJUaWxlfSA9IHJlcXVpcmUoJy4vU3RhdHVzQmFyVGlsZScpO1xuICAgIGNvbnN0IHN0YXR1c0JhclRpbGUgPSB0aGlzLl9zdGF0dXNCYXJUaWxlID0gbmV3IFN0YXR1c0JhclRpbGUoKTtcbiAgICBzdGF0dXNCYXJUaWxlLmNvbnN1bWVNZXNzYWdlU3RyZWFtKHRoaXMuX21lc3NhZ2VTdG9yZS5nZXRNZXNzYWdlU3RyZWFtKCkpO1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fc3RhdHVzQmFyVGlsZSkge1xuICAgICAgICB0aGlzLl9zdGF0dXNCYXJUaWxlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc3RhdHVzQmFyVGlsZS5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG5cbiAgY29uc3VtZUJ1c3lTaWduYWxQcm92aWRlcihwcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5fbWVzc2FnZVN0b3JlLmNvbnN1bWVQcm92aWRlcihwcm92aWRlcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBkZWFjdGl2YXRlKCk7XG4gIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lQnVzeVNpZ25hbFByb3ZpZGVyKHByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXIpOiBhdG9tJERpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCdXN5U2lnbmFsUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19