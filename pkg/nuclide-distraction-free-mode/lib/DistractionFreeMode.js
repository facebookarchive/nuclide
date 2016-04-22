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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var DistractionFreeMode = (function () {
  function DistractionFreeMode(state) {
    _classCallCheck(this, DistractionFreeMode);

    this._providers = new Set();
    this._restoreState = null;
    if (state != null && state.restoreState != null) {
      this._deserializationState = new Set(state.restoreState);
    }
  }

  _createClass(DistractionFreeMode, [{
    key: 'serialize',
    value: function serialize() {
      var restoreState = null;
      if (this._restoreState != null) {
        restoreState = Array.from(this._restoreState, function (provider) {
          return provider.name;
        });
      }
      return {
        restoreState: restoreState
      };
    }
  }, {
    key: 'consumeDistractionFreeModeProvider',
    value: function consumeDistractionFreeModeProvider(provider) {
      var _this = this;

      this._providers.add(provider);
      if (this._deserializationState != null && this._deserializationState.has(provider.name)) {
        this._addToRestoreState(provider);
      }
      return new _atom.Disposable(function () {
        _this._providers['delete'](provider);
      });
    }
  }, {
    key: 'toggleDistractionFreeMode',
    value: function toggleDistractionFreeMode() {
      // Once the user has interacted with distraction-free mode it would be weird if another package
      // loading triggered a change in the state.
      this._deserializationState = null;
      if (this._shouldRestore()) {
        this._exitDistractionFreeMode();
      } else {
        this._enterDistractionFreeMode();
      }
    }
  }, {
    key: '_addToRestoreState',
    value: function _addToRestoreState(provider) {
      var restoreState = this._restoreState;
      if (restoreState == null) {
        this._restoreState = restoreState = new Set();
      }
      restoreState.add(provider);
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
          // distraction-free mode, and intend to enter it.
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_enterDistractionFreeMode',
    value: function _enterDistractionFreeMode() {
      // This will be non-null if the user has entered distraction-free mode without toggling it off,
      // but has manually opened one or more of the providers. In that case, we want to re-enter
      // distraction-free mode, hiding the currently-visible providers, but when we exit we want to
      // restore both the previously-hidden providers and the currently-visible providers.
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
    key: '_exitDistractionFreeMode',
    value: function _exitDistractionFreeMode() {
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

  return DistractionFreeMode;
})();

exports.DistractionFreeMode = DistractionFreeMode;

// Non-null iff we have entered distraction-free mode without explicitly exiting it. See
// _shouldRestore() and _enterDistractionFreeMode() for a more detailed explanation.

// Set of names for providers that were hidden when Nuclide last exited, but have not yet been
// consumed.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpc3RyYWN0aW9uRnJlZU1vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWFzQixRQUFROzs7O29CQUNMLE1BQU07O0lBRWxCLG1CQUFtQjtBQVVuQixXQVZBLG1CQUFtQixDQVVsQixLQUFnQyxFQUFFOzBCQVZuQyxtQkFBbUI7O0FBVzVCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFlBQVksSUFBSSxJQUFJLEVBQUU7QUFDL0MsVUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMxRDtHQUNGOztlQWhCVSxtQkFBbUI7O1dBa0JyQixxQkFBNkI7QUFDcEMsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDOUIsb0JBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBQSxRQUFRO2lCQUFJLFFBQVEsQ0FBQyxJQUFJO1NBQUEsQ0FBQyxDQUFDO09BQzFFO0FBQ0QsYUFBTztBQUNMLG9CQUFZLEVBQVosWUFBWTtPQUNiLENBQUM7S0FDSDs7O1dBRWlDLDRDQUFDLFFBQXFDLEVBQWU7OztBQUNyRixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QixVQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDdkYsWUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ25DO0FBQ0QsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGNBQUssVUFBVSxVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUV3QixxQ0FBUzs7O0FBR2hDLFVBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7QUFDbEMsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDekIsWUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7T0FDakMsTUFBTTtBQUNMLFlBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO09BQ2xDO0tBQ0Y7OztXQUVpQiw0QkFBQyxRQUFxQyxFQUFRO0FBQzlELFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDdEMsVUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7T0FDL0M7QUFDRCxrQkFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM1Qjs7O1dBRWEsMEJBQVk7QUFDeEIsVUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTtBQUM5QixlQUFPLEtBQUssQ0FBQztPQUNkO0FBQ0QsV0FBSyxJQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3RDLFlBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFOzs7QUFHeEIsaUJBQU8sS0FBSyxDQUFDO1NBQ2Q7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUV3QixxQ0FBUzs7Ozs7QUFLaEMsVUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN6QyxVQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUU7QUFDM0IsdUJBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO09BQzdCO0FBQ0QsV0FBSyxJQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3RDLFlBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3hCLGtCQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEIseUJBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0I7T0FDRjtBQUNELFVBQUksQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO0tBQ3RDOzs7V0FFdUIsb0NBQVM7QUFDL0IsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN4QywrQkFBVSxZQUFZLElBQUksSUFBSSxDQUFDLENBQUM7QUFDaEMsV0FBSyxJQUFNLFFBQVEsSUFBSSxZQUFZLEVBQUU7QUFDbkMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUN6QixrQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ25CO09BQ0Y7QUFDRCxVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztLQUMzQjs7O1NBbEdVLG1CQUFtQiIsImZpbGUiOiJEaXN0cmFjdGlvbkZyZWVNb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlciwgRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlfSBmcm9tICcuLic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBjbGFzcyBEaXN0cmFjdGlvbkZyZWVNb2RlIHtcbiAgX3Byb3ZpZGVyczogU2V0PERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcj47XG4gIC8vIE5vbi1udWxsIGlmZiB3ZSBoYXZlIGVudGVyZWQgZGlzdHJhY3Rpb24tZnJlZSBtb2RlIHdpdGhvdXQgZXhwbGljaXRseSBleGl0aW5nIGl0LiBTZWVcbiAgLy8gX3Nob3VsZFJlc3RvcmUoKSBhbmQgX2VudGVyRGlzdHJhY3Rpb25GcmVlTW9kZSgpIGZvciBhIG1vcmUgZGV0YWlsZWQgZXhwbGFuYXRpb24uXG4gIF9yZXN0b3JlU3RhdGU6ID9TZXQ8RGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyPjtcblxuICAvLyBTZXQgb2YgbmFtZXMgZm9yIHByb3ZpZGVycyB0aGF0IHdlcmUgaGlkZGVuIHdoZW4gTnVjbGlkZSBsYXN0IGV4aXRlZCwgYnV0IGhhdmUgbm90IHlldCBiZWVuXG4gIC8vIGNvbnN1bWVkLlxuICBfZGVzZXJpYWxpemF0aW9uU3RhdGU6ID9TZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0Rpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSkge1xuICAgIHRoaXMuX3Byb3ZpZGVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9yZXN0b3JlU3RhdGUgPSBudWxsO1xuICAgIGlmIChzdGF0ZSAhPSBudWxsICYmIHN0YXRlLnJlc3RvcmVTdGF0ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9kZXNlcmlhbGl6YXRpb25TdGF0ZSA9IG5ldyBTZXQoc3RhdGUucmVzdG9yZVN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKTogRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlIHtcbiAgICBsZXQgcmVzdG9yZVN0YXRlID0gbnVsbDtcbiAgICBpZiAodGhpcy5fcmVzdG9yZVN0YXRlICE9IG51bGwpIHtcbiAgICAgIHJlc3RvcmVTdGF0ZSA9IEFycmF5LmZyb20odGhpcy5fcmVzdG9yZVN0YXRlLCBwcm92aWRlciA9PiBwcm92aWRlci5uYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RvcmVTdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3VtZURpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcihwcm92aWRlcjogRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Byb3ZpZGVycy5hZGQocHJvdmlkZXIpO1xuICAgIGlmICh0aGlzLl9kZXNlcmlhbGl6YXRpb25TdGF0ZSAhPSBudWxsICYmIHRoaXMuX2Rlc2VyaWFsaXphdGlvblN0YXRlLmhhcyhwcm92aWRlci5uYW1lKSkge1xuICAgICAgdGhpcy5fYWRkVG9SZXN0b3JlU3RhdGUocHJvdmlkZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fcHJvdmlkZXJzLmRlbGV0ZShwcm92aWRlcik7XG4gICAgfSk7XG4gIH1cblxuICB0b2dnbGVEaXN0cmFjdGlvbkZyZWVNb2RlKCk6IHZvaWQge1xuICAgIC8vIE9uY2UgdGhlIHVzZXIgaGFzIGludGVyYWN0ZWQgd2l0aCBkaXN0cmFjdGlvbi1mcmVlIG1vZGUgaXQgd291bGQgYmUgd2VpcmQgaWYgYW5vdGhlciBwYWNrYWdlXG4gICAgLy8gbG9hZGluZyB0cmlnZ2VyZWQgYSBjaGFuZ2UgaW4gdGhlIHN0YXRlLlxuICAgIHRoaXMuX2Rlc2VyaWFsaXphdGlvblN0YXRlID0gbnVsbDtcbiAgICBpZiAodGhpcy5fc2hvdWxkUmVzdG9yZSgpKSB7XG4gICAgICB0aGlzLl9leGl0RGlzdHJhY3Rpb25GcmVlTW9kZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbnRlckRpc3RyYWN0aW9uRnJlZU1vZGUoKTtcbiAgICB9XG4gIH1cblxuICBfYWRkVG9SZXN0b3JlU3RhdGUocHJvdmlkZXI6IERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcik6IHZvaWQge1xuICAgIGxldCByZXN0b3JlU3RhdGUgPSB0aGlzLl9yZXN0b3JlU3RhdGU7XG4gICAgaWYgKHJlc3RvcmVTdGF0ZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZXN0b3JlU3RhdGUgPSByZXN0b3JlU3RhdGUgPSBuZXcgU2V0KCk7XG4gICAgfVxuICAgIHJlc3RvcmVTdGF0ZS5hZGQocHJvdmlkZXIpO1xuICB9XG5cbiAgX3Nob3VsZFJlc3RvcmUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVTdGF0ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgdGhpcy5fcHJvdmlkZXJzKSB7XG4gICAgICBpZiAocHJvdmlkZXIuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIG1hbnVhbGx5IHNob3duIGFueSBwcm92aWRlciB0aGV5IGhhdmUgcHJvYmFibHkgZm9yZ290dGVuIHRoZXkgYXJlIGluXG4gICAgICAgIC8vIGRpc3RyYWN0aW9uLWZyZWUgbW9kZSwgYW5kIGludGVuZCB0byBlbnRlciBpdC5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9lbnRlckRpc3RyYWN0aW9uRnJlZU1vZGUoKTogdm9pZCB7XG4gICAgLy8gVGhpcyB3aWxsIGJlIG5vbi1udWxsIGlmIHRoZSB1c2VyIGhhcyBlbnRlcmVkIGRpc3RyYWN0aW9uLWZyZWUgbW9kZSB3aXRob3V0IHRvZ2dsaW5nIGl0IG9mZixcbiAgICAvLyBidXQgaGFzIG1hbnVhbGx5IG9wZW5lZCBvbmUgb3IgbW9yZSBvZiB0aGUgcHJvdmlkZXJzLiBJbiB0aGF0IGNhc2UsIHdlIHdhbnQgdG8gcmUtZW50ZXJcbiAgICAvLyBkaXN0cmFjdGlvbi1mcmVlIG1vZGUsIGhpZGluZyB0aGUgY3VycmVudGx5LXZpc2libGUgcHJvdmlkZXJzLCBidXQgd2hlbiB3ZSBleGl0IHdlIHdhbnQgdG9cbiAgICAvLyByZXN0b3JlIGJvdGggdGhlIHByZXZpb3VzbHktaGlkZGVuIHByb3ZpZGVycyBhbmQgdGhlIGN1cnJlbnRseS12aXNpYmxlIHByb3ZpZGVycy5cbiAgICBsZXQgbmV3UmVzdG9yZVN0YXRlID0gdGhpcy5fcmVzdG9yZVN0YXRlO1xuICAgIGlmIChuZXdSZXN0b3JlU3RhdGUgPT0gbnVsbCkge1xuICAgICAgbmV3UmVzdG9yZVN0YXRlID0gbmV3IFNldCgpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIHRoaXMuX3Byb3ZpZGVycykge1xuICAgICAgaWYgKHByb3ZpZGVyLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHByb3ZpZGVyLnRvZ2dsZSgpO1xuICAgICAgICBuZXdSZXN0b3JlU3RhdGUuYWRkKHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcmVzdG9yZVN0YXRlID0gbmV3UmVzdG9yZVN0YXRlO1xuICB9XG5cbiAgX2V4aXREaXN0cmFjdGlvbkZyZWVNb2RlKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlc3RvcmVTdGF0ZSA9IHRoaXMuX3Jlc3RvcmVTdGF0ZTtcbiAgICBpbnZhcmlhbnQocmVzdG9yZVN0YXRlICE9IG51bGwpO1xuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgcmVzdG9yZVN0YXRlKSB7XG4gICAgICBpZiAoIXByb3ZpZGVyLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHByb3ZpZGVyLnRvZ2dsZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9yZXN0b3JlU3RhdGUgPSBudWxsO1xuICB9XG59XG4iXX0=