Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.provideRecentFilesService = provideRecentFilesService;
exports.serialize = serialize;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._subscriptions = new _atom.CompositeDisposable();
    var RecentFilesService = require('./RecentFilesService');
    this._service = new RecentFilesService(state);
    this._subscriptions.add(new _atom.Disposable(function () {
      _this._service.dispose();
    }));
  }

  _createClass(Activation, [{
    key: 'getService',
    value: function getService() {
      return this._service;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function provideRecentFilesService() {
  (0, _assert2['default'])(activation);
  return activation.getService();
}

function serialize() {
  (0, _assert2['default'])(activation);
  return {
    filelist: activation.getService().getRecentFiles()
  };
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7b0JBRWdCLE1BQU07O0lBSTlDLFVBQVU7QUFJSCxXQUpQLFVBQVUsQ0FJRixLQUFjLEVBQUU7OzswQkFKeEIsVUFBVTs7QUFLWixRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDM0QsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFlLFlBQU07QUFDM0MsWUFBSyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDekIsQ0FBQyxDQUFDLENBQUM7R0FDTDs7ZUFYRyxVQUFVOztXQWFKLHNCQUEyQjtBQUNuQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBbkJHLFVBQVU7OztBQXNCaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7Q0FDRjs7QUFFTSxTQUFTLHlCQUF5QixHQUEyQjtBQUNsRSwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztDQUNoQzs7QUFFTSxTQUFTLFNBQVMsR0FBVztBQUNsQywyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPO0FBQ0wsWUFBUSxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLEVBQUU7R0FDbkQsQ0FBQztDQUNIOztBQUVNLFNBQVMsVUFBVSxHQUFTO0FBQ2pDLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgdHlwZSBSZWNlbnRGaWxlc1NlcnZpY2VUeXBlIGZyb20gJy4vUmVjZW50RmlsZXNTZXJ2aWNlJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc2VydmljZTogUmVjZW50RmlsZXNTZXJ2aWNlVHlwZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IFJlY2VudEZpbGVzU2VydmljZSA9IHJlcXVpcmUoJy4vUmVjZW50RmlsZXNTZXJ2aWNlJyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBSZWNlbnRGaWxlc1NlcnZpY2Uoc3RhdGUpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3NlcnZpY2UuZGlzcG9zZSgpO1xuICAgIH0pKTtcbiAgfVxuXG4gIGdldFNlcnZpY2UoKTogUmVjZW50RmlsZXNTZXJ2aWNlVHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2U7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVJlY2VudEZpbGVzU2VydmljZSgpOiBSZWNlbnRGaWxlc1NlcnZpY2VUeXBlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4gYWN0aXZhdGlvbi5nZXRTZXJ2aWNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICByZXR1cm4ge1xuICAgIGZpbGVsaXN0OiBhY3RpdmF0aW9uLmdldFNlcnZpY2UoKS5nZXRSZWNlbnRGaWxlcygpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19