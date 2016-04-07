Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTunnelVisionProvider = consumeTunnelVisionProvider;

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
    this._providers = new Set();
    this._restoreState = null;

    atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-tunnel-vision:toggle', this._toggleTunnelVision.bind(this));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeTunnelVisionProvider',
    value: function consumeTunnelVisionProvider(provider) {
      var _this = this;

      this._providers.add(provider);
      return new _atom.Disposable(function () {
        _this._providers['delete'](provider);
      });
    }
  }, {
    key: '_toggleTunnelVision',
    value: function _toggleTunnelVision() {
      if (this._shouldRestore()) {
        this._exitTunnelVision();
      } else {
        this._enterTunnelVision();
      }
    }
  }, {
    key: '_shouldRestore',
    value: function _shouldRestore() {
      if (this._restoreState == null) {
        return false;
      }
      for (var provider of this._providers) {
        if (provider.isVisible()) {
          // If the user has manually shown any provider they have probably forgotten they are in
          // tunnel vision mode, and intend to enter it.
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_enterTunnelVision',
    value: function _enterTunnelVision() {
      // This will be non-null if the user has entered tunnel vision without toggling it off, but has
      // manually opened one or more of the providers. In that case, we want to re-enter tunnel
      // vision, hiding the currently-visible providers, but when we exit we want to restore both the
      // previously-hidden providers and the currently-visible providers.
      var newRestoreState = this._restoreState;
      if (newRestoreState == null) {
        newRestoreState = new Set();
      }
      for (var provider of this._providers) {
        if (provider.isVisible()) {
          provider.toggle();
          newRestoreState.add(provider);
        }
      }
      this._restoreState = newRestoreState;
    }
  }, {
    key: '_exitTunnelVision',
    value: function _exitTunnelVision() {
      var restoreState = this._restoreState;
      (0, _assert2['default'])(restoreState != null);
      for (var provider of restoreState) {
        if (!provider.isVisible()) {
          provider.toggle();
        }
      }
      this._restoreState = null;
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

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeTunnelVisionProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeTunnelVisionProvider(provider);
}

// Non-null iff we have entered tunnel vision mode without explicitly exiting it. See
// _shouldRestore() and _enterTunnelVision() for a more detailed explanation.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFXOEMsTUFBTTs7c0JBQzlCLFFBQVE7Ozs7SUFPeEIsVUFBVTtBQVFILFdBUlAsVUFBVSxDQVFGLEtBQWMsRUFBRTswQkFSeEIsVUFBVTs7QUFTWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs7QUFFMUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyw4QkFBOEIsRUFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDcEMsQ0FBQztHQUNIOztlQWxCRyxVQUFVOztXQW9CUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUUwQixxQ0FBQyxRQUE4QixFQUFlOzs7QUFDdkUsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUIsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGNBQUssVUFBVSxVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVrQiwrQkFBUztBQUMxQixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUN6QixZQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztPQUMxQixNQUFNO0FBQ0wsWUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7T0FDM0I7S0FDRjs7O1dBRWEsMEJBQUc7QUFDZixVQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxXQUFLLElBQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDdEMsWUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUU7OztBQUd4QixpQkFBTyxLQUFLLENBQUM7U0FDZDtPQUNGO0FBQ0QsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRWlCLDhCQUFTOzs7OztBQUt6QixVQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3pDLFVBQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQix1QkFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7T0FDN0I7QUFDRCxXQUFLLElBQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDdEMsWUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDeEIsa0JBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQix5QkFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtPQUNGO0FBQ0QsVUFBSSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7S0FDdEM7OztXQUVnQiw2QkFBUztBQUN4QixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3hDLCtCQUFVLFlBQVksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNoQyxXQUFLLElBQU0sUUFBUSxJQUFJLFlBQVksRUFBRTtBQUNuQyxZQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3pCLGtCQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDbkI7T0FDRjtBQUNELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0tBQzNCOzs7U0FoRkcsVUFBVTs7O0FBbUZoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQUU7QUFDdkMsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNwQztDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztHQUNuQjtDQUNGOztBQUVNLFNBQVMsMkJBQTJCLENBQUMsUUFBOEIsRUFBZTtBQUN2RiwyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxVQUFVLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDekQiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCB0eXBlIFR1bm5lbFZpc2lvblByb3ZpZGVyID0ge1xuICBpc1Zpc2libGU6ICgpID0+IGJvb2xlYW47XG4gIHRvZ2dsZTogKCkgPT4gdm9pZDtcbn07XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX3Byb3ZpZGVyczogU2V0PFR1bm5lbFZpc2lvblByb3ZpZGVyPjtcbiAgLy8gTm9uLW51bGwgaWZmIHdlIGhhdmUgZW50ZXJlZCB0dW5uZWwgdmlzaW9uIG1vZGUgd2l0aG91dCBleHBsaWNpdGx5IGV4aXRpbmcgaXQuIFNlZVxuICAvLyBfc2hvdWxkUmVzdG9yZSgpIGFuZCBfZW50ZXJUdW5uZWxWaXNpb24oKSBmb3IgYSBtb3JlIGRldGFpbGVkIGV4cGxhbmF0aW9uLlxuICBfcmVzdG9yZVN0YXRlOiA/U2V0PFR1bm5lbFZpc2lvblByb3ZpZGVyPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fcmVzdG9yZVN0YXRlID0gbnVsbDtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLXR1bm5lbC12aXNpb246dG9nZ2xlJyxcbiAgICAgIHRoaXMuX3RvZ2dsZVR1bm5lbFZpc2lvbi5iaW5kKHRoaXMpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbnN1bWVUdW5uZWxWaXNpb25Qcm92aWRlcihwcm92aWRlcjogVHVubmVsVmlzaW9uUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fcHJvdmlkZXJzLmFkZChwcm92aWRlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3Byb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgX3RvZ2dsZVR1bm5lbFZpc2lvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkUmVzdG9yZSgpKSB7XG4gICAgICB0aGlzLl9leGl0VHVubmVsVmlzaW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VudGVyVHVubmVsVmlzaW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX3Nob3VsZFJlc3RvcmUoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVTdGF0ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgdGhpcy5fcHJvdmlkZXJzKSB7XG4gICAgICBpZiAocHJvdmlkZXIuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1hbnVhbGx5IHNob3duIGFueSBwcm92aWRlciB0aGV5IGhhdmUgcHJvYmFibHkgZm9yZ290dGVuIHRoZXkgYXJlIGluXG4gICAgICAgIC8vIHR1bm5lbCB2aXNpb24gbW9kZSwgYW5kIGludGVuZCB0byBlbnRlciBpdC5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9lbnRlclR1bm5lbFZpc2lvbigpOiB2b2lkIHtcbiAgICAvLyBUaGlzIHdpbGwgYmUgbm9uLW51bGwgaWYgdGhlIHVzZXIgaGFzIGVudGVyZWQgdHVubmVsIHZpc2lvbiB3aXRob3V0IHRvZ2dsaW5nIGl0IG9mZiwgYnV0IGhhc1xuICAgIC8vIG1hbnVhbGx5IG9wZW5lZCBvbmUgb3IgbW9yZSBvZiB0aGUgcHJvdmlkZXJzLiBJbiB0aGF0IGNhc2UsIHdlIHdhbnQgdG8gcmUtZW50ZXIgdHVubmVsXG4gICAgLy8gdmlzaW9uLCBoaWRpbmcgdGhlIGN1cnJlbnRseS12aXNpYmxlIHByb3ZpZGVycywgYnV0IHdoZW4gd2UgZXhpdCB3ZSB3YW50IHRvIHJlc3RvcmUgYm90aCB0aGVcbiAgICAvLyBwcmV2aW91c2x5LWhpZGRlbiBwcm92aWRlcnMgYW5kIHRoZSBjdXJyZW50bHktdmlzaWJsZSBwcm92aWRlcnMuXG4gICAgbGV0IG5ld1Jlc3RvcmVTdGF0ZSA9IHRoaXMuX3Jlc3RvcmVTdGF0ZTtcbiAgICBpZiAobmV3UmVzdG9yZVN0YXRlID09IG51bGwpIHtcbiAgICAgIG5ld1Jlc3RvcmVTdGF0ZSA9IG5ldyBTZXQoKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLl9wcm92aWRlcnMpIHtcbiAgICAgIGlmIChwcm92aWRlci5pc1Zpc2libGUoKSkge1xuICAgICAgICBwcm92aWRlci50b2dnbGUoKTtcbiAgICAgICAgbmV3UmVzdG9yZVN0YXRlLmFkZChwcm92aWRlcik7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3Jlc3RvcmVTdGF0ZSA9IG5ld1Jlc3RvcmVTdGF0ZTtcbiAgfVxuXG4gIF9leGl0VHVubmVsVmlzaW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlc3RvcmVTdGF0ZSA9IHRoaXMuX3Jlc3RvcmVTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmVzdG9yZVN0YXRlICE9IG51bGwpO1xuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgcmVzdG9yZVN0YXRlKSB7XG4gICAgICBpZiAoIXByb3ZpZGVyLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHByb3ZpZGVyLnRvZ2dsZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9yZXN0b3JlU3RhdGUgPSBudWxsO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24gIT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVHVubmVsVmlzaW9uUHJvdmlkZXIocHJvdmlkZXI6IFR1bm5lbFZpc2lvblByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZVR1bm5lbFZpc2lvblByb3ZpZGVyKHByb3ZpZGVyKTtcbn1cbiJdfQ==