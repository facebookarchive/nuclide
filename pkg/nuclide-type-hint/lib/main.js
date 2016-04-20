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
exports.consumeTypehintProvider = consumeTypehintProvider;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var PACKAGE_NAME = 'nuclide-type-hint';

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
    if (this.typeHintManager == null) {
      var TypeHintManager = require('./TypeHintManager');
      this.typeHintManager = new TypeHintManager();
    }
  }

  _createClass(Activation, [{
    key: 'consumeTypehintProvider',
    value: function consumeTypehintProvider(provider) {
      var _this = this;

      (0, _assert2['default'])(this.typeHintManager);
      this.typeHintManager.addProvider(provider);
      return new _atom.Disposable(function () {
        if (_this.typeHintManager != null) {
          _this.typeHintManager.removeProvider(provider);
        }
      });
    }
  }, {
    key: 'consumeDatatipService',
    value: function consumeDatatipService(service) {
      (0, _assert2['default'])(this.typeHintManager);
      var datatip = this.typeHintManager.datatip.bind(this.typeHintManager);
      var datatipProvider = {
        validForScope: function validForScope() {
          return true;
        },
        providerName: PACKAGE_NAME,
        inclusionPriority: 1,
        datatip: datatip
      };
      this.datatipService = service;
      service.addProvider(datatipProvider);
      var disposable = new _atom.Disposable(function () {
        return service.removeProvider(datatipProvider);
      });
      this._disposables.add(disposable);
      return disposable;
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
  activation = new Activation(state);
}

function consumeTypehintProvider(provider) {
  (0, _assert2['default'])(activation);
  return activation.consumeTypehintProvider(provider);
}

function consumeDatatipService(service) {
  (0, _assert2['default'])(activation);
  return activation.consumeDatatipService(service);
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBa0JzQixRQUFROzs7O29CQUl2QixNQUFNOztBQUViLElBQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDOztJQUVuQyxVQUFVO0FBS0gsV0FMUCxVQUFVLENBS0YsS0FBVyxFQUFFOzBCQUxyQixVQUFVOztBQU1aLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksRUFBRTtBQUNoQyxVQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7S0FDOUM7R0FDRjs7ZUFYRyxVQUFVOztXQWFTLGlDQUFDLFFBQTBCLEVBQWU7OztBQUMvRCwrQkFBVSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLFlBQUksTUFBSyxlQUFlLElBQUksSUFBSSxFQUFFO0FBQ2hDLGdCQUFLLGVBQWUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0M7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRW9CLCtCQUFDLE9BQXVCLEVBQWU7QUFDMUQsK0JBQVUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2hDLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDeEUsVUFBTSxlQUFnQyxHQUFHO0FBQ3ZDLHFCQUFhLEVBQUU7aUJBQU0sSUFBSTtTQUFBO0FBQ3pCLG9CQUFZLEVBQUUsWUFBWTtBQUMxQix5QkFBaUIsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sRUFBUCxPQUFPO09BQ1IsQ0FBQztBQUNGLFVBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0FBQzlCLGFBQU8sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDckMsVUFBTSxVQUFVLEdBQUcscUJBQWU7ZUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNqRixVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsQyxhQUFPLFVBQVUsQ0FBQztLQUNuQjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0F6Q0csVUFBVTs7O0FBNENoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFXLEVBQVE7QUFDMUMsWUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3BDOztBQUVNLFNBQVMsdUJBQXVCLENBQUMsUUFBMEIsRUFBZTtBQUMvRSwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNyRDs7QUFFTSxTQUFTLHFCQUFxQixDQUFDLE9BQXVCLEVBQWU7QUFDMUUsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbEQ7O0FBRU0sU0FBUyxVQUFVLEdBQVM7QUFDakMsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludFByb3ZpZGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLXR5cGUtaGludC1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcFByb3ZpZGVyLFxuICBEYXRhdGlwU2VydmljZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgVHlwZUhpbnRNYW5hZ2VyVHlwZSBmcm9tICcuL1R5cGVIaW50TWFuYWdlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7XG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIERpc3Bvc2FibGUsXG59IGZyb20gJ2F0b20nO1xuXG5jb25zdCBQQUNLQUdFX05BTUUgPSAnbnVjbGlkZS10eXBlLWhpbnQnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBkYXRhdGlwU2VydmljZTogP0RhdGF0aXBTZXJ2aWNlO1xuICB0eXBlSGludE1hbmFnZXI6ID9UeXBlSGludE1hbmFnZXJUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/YW55KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGlmICh0aGlzLnR5cGVIaW50TWFuYWdlciA9PSBudWxsKSB7XG4gICAgICBjb25zdCBUeXBlSGludE1hbmFnZXIgPSByZXF1aXJlKCcuL1R5cGVIaW50TWFuYWdlcicpO1xuICAgICAgdGhpcy50eXBlSGludE1hbmFnZXIgPSBuZXcgVHlwZUhpbnRNYW5hZ2VyKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZVR5cGVoaW50UHJvdmlkZXIocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KHRoaXMudHlwZUhpbnRNYW5hZ2VyKTtcbiAgICB0aGlzLnR5cGVIaW50TWFuYWdlci5hZGRQcm92aWRlcihwcm92aWRlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnR5cGVIaW50TWFuYWdlciAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMudHlwZUhpbnRNYW5hZ2VyLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN1bWVEYXRhdGlwU2VydmljZShzZXJ2aWNlOiBEYXRhdGlwU2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICBpbnZhcmlhbnQodGhpcy50eXBlSGludE1hbmFnZXIpO1xuICAgIGNvbnN0IGRhdGF0aXAgPSB0aGlzLnR5cGVIaW50TWFuYWdlci5kYXRhdGlwLmJpbmQodGhpcy50eXBlSGludE1hbmFnZXIpO1xuICAgIGNvbnN0IGRhdGF0aXBQcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyID0ge1xuICAgICAgdmFsaWRGb3JTY29wZTogKCkgPT4gdHJ1ZSxcbiAgICAgIHByb3ZpZGVyTmFtZTogUEFDS0FHRV9OQU1FLFxuICAgICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG4gICAgICBkYXRhdGlwLFxuICAgIH07XG4gICAgdGhpcy5kYXRhdGlwU2VydmljZSA9IHNlcnZpY2U7XG4gICAgc2VydmljZS5hZGRQcm92aWRlcihkYXRhdGlwUHJvdmlkZXIpO1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiBzZXJ2aWNlLnJlbW92ZVByb3ZpZGVyKGRhdGF0aXBQcm92aWRlcikpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChkaXNwb3NhYmxlKTtcbiAgICByZXR1cm4gZGlzcG9zYWJsZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP2FueSk6IHZvaWQge1xuICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVR5cGVoaW50UHJvdmlkZXIocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZVR5cGVoaW50UHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZURhdGF0aXBTZXJ2aWNlKHNlcnZpY2U6IERhdGF0aXBTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVEYXRhdGlwU2VydmljZShzZXJ2aWNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19