var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._subscriptions = new CompositeDisposable();
    var RecentFilesService = require('./RecentFilesService');
    this._service = new RecentFilesService(state);
    this._subscriptions.add(new Disposable(function () {
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

module.exports = {

  activate: function activate(state) {
    if (activation == null) {
      activation = new Activation(state);
    }
  },

  provideRecentFilesService: function provideRecentFilesService() {
    (0, _assert2['default'])(activation);
    return activation.getService();
  },

  serialize: function serialize() {
    (0, _assert2['default'])(activation);
    return {
      filelist: activation.getService().getRecentFiles()
    };
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7ZUFLMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFGakIsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUNuQixVQUFVLFlBQVYsVUFBVTs7SUFLTixVQUFVO0FBSUgsV0FKUCxVQUFVLENBSUYsS0FBYyxFQUFFOzs7MEJBSnhCLFVBQVU7O0FBS1osUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDaEQsUUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsWUFBTTtBQUMzQyxZQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6QixDQUFDLENBQUMsQ0FBQztHQUNMOztlQVhHLFVBQVU7O1dBYUosc0JBQTJCO0FBQ25DLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0FuQkcsVUFBVTs7O0FBc0JoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUVuQyxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQVE7QUFDN0IsUUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGdCQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEM7R0FDRjs7QUFFRCwyQkFBeUIsRUFBQSxxQ0FBMkI7QUFDbEQsNkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsV0FBTyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDaEM7O0FBRUQsV0FBUyxFQUFBLHFCQUFXO0FBQ2xCLDZCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU87QUFDTCxjQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLGNBQWMsRUFBRTtLQUNuRCxDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztDQUVGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxufSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuaW1wb3J0IHR5cGUgUmVjZW50RmlsZXNTZXJ2aWNlVHlwZSBmcm9tICcuL1JlY2VudEZpbGVzU2VydmljZSc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3NlcnZpY2U6IFJlY2VudEZpbGVzU2VydmljZVR5cGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCBSZWNlbnRGaWxlc1NlcnZpY2UgPSByZXF1aXJlKCcuL1JlY2VudEZpbGVzU2VydmljZScpO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgUmVjZW50RmlsZXNTZXJ2aWNlKHN0YXRlKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9zZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgICB9KSk7XG4gIH1cblxuICBnZXRTZXJ2aWNlKCk6IFJlY2VudEZpbGVzU2VydmljZVR5cGUge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICAgIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIHByb3ZpZGVSZWNlbnRGaWxlc1NlcnZpY2UoKTogUmVjZW50RmlsZXNTZXJ2aWNlVHlwZSB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmdldFNlcnZpY2UoKTtcbiAgfSxcblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGVsaXN0OiBhY3RpdmF0aW9uLmdldFNlcnZpY2UoKS5nZXRSZWNlbnRGaWxlcygpLFxuICAgIH07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbn07XG4iXX0=