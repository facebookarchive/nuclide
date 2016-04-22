Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeDistractionFreeModeProvider = consumeDistractionFreeModeProvider;
exports.consumeToolBar = consumeToolBar;

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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _DistractionFreeMode = require('./DistractionFreeMode');

var _BuiltinProviders = require('./BuiltinProviders');

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
    this._tunnelVision = new _DistractionFreeMode.DistractionFreeMode(state);
    this._disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-distraction-free-mode:toggle', function () {
      (0, _nuclideAnalytics.track)('distraction-free-mode:toggle');
      _this._tunnelVision.toggleDistractionFreeMode();
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._tunnelVision.serialize();
    }
  }, {
    key: 'consumeDistractionFreeModeProvider',
    value: function consumeDistractionFreeModeProvider(provider) {
      return this._tunnelVision.consumeDistractionFreeModeProvider(provider);
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-distraction-free-mode');
      toolBar.addButton({
        icon: 'eye',
        callback: 'nuclide-distraction-free-mode:toggle',
        tooltip: 'Toggle distraction-free mode',
        priority: 600
      });
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    for (var provider of (0, _BuiltinProviders.getBuiltinProviders)()) {
      activation.consumeDistractionFreeModeProvider(provider);
    }
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  (0, _assert2['default'])(activation != null);
  return activation.serialize();
}

function consumeDistractionFreeModeProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeDistractionFreeModeProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation != null);
  activation.consumeToolBar(getToolBar);
}

// Should be the unique to all providers. Recommended to be the package name.

// Serialize the restore state via an array of provider names.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQVc4QyxNQUFNOztzQkFDOUIsUUFBUTs7OztnQ0FFVix5QkFBeUI7O21DQUVYLHVCQUF1Qjs7Z0NBQ3ZCLG9CQUFvQjs7SUFjaEQsVUFBVTtBQUlILFdBSlAsVUFBVSxDQUlGLEtBQWdDLEVBQUU7OzswQkFKMUMsVUFBVTs7QUFLWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFFBQUksQ0FBQyxhQUFhLEdBQUcsNkNBQXdCLEtBQUssQ0FBQyxDQUFDO0FBQ3BELFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLHNDQUFzQyxFQUN0QyxZQUFNO0FBQ0osbUNBQU0sOEJBQThCLENBQUMsQ0FBQztBQUN0QyxZQUFLLGFBQWEsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0tBQ2hELENBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBZkcsVUFBVTs7V0FpQlAsbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFUSxxQkFBNkI7QUFDcEMsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3ZDOzs7V0FFaUMsNENBQUMsUUFBcUMsRUFBZTtBQUNyRixhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsa0NBQWtDLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDeEU7OztXQUVhLHdCQUFDLFVBQXFDLEVBQVE7QUFDMUQsVUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDNUQsYUFBTyxDQUFDLFNBQVMsQ0FBQztBQUNoQixZQUFJLEVBQUUsS0FBSztBQUNYLGdCQUFRLEVBQUUsc0NBQXNDO0FBQ2hELGVBQU8sRUFBRSw4QkFBOEI7QUFDdkMsZ0JBQVEsRUFBRSxHQUFHO09BQ2QsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBTTtBQUN6QyxlQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDdkIsQ0FBQyxDQUFDLENBQUM7S0FDTDs7O1NBeENHLFVBQVU7OztBQTJDaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBZ0MsRUFBRTtBQUN6RCxNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25DLFNBQUssSUFBTSxRQUFRLElBQUksNENBQXFCLEVBQUU7QUFDNUMsZ0JBQVUsQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN6RDtHQUNGO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0Y7O0FBRU0sU0FBUyxTQUFTLEdBQTZCO0FBQ3BELDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztDQUMvQjs7QUFFTSxTQUFTLGtDQUFrQyxDQUNoRCxRQUFxQyxFQUN4QjtBQUNiLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNoRTs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxVQUFxQyxFQUFRO0FBQzFFLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixZQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3ZDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7RGlzdHJhY3Rpb25GcmVlTW9kZX0gZnJvbSAnLi9EaXN0cmFjdGlvbkZyZWVNb2RlJztcbmltcG9ydCB7Z2V0QnVpbHRpblByb3ZpZGVyc30gZnJvbSAnLi9CdWlsdGluUHJvdmlkZXJzJztcblxuZXhwb3J0IHR5cGUgRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyID0ge1xuICAvLyBTaG91bGQgYmUgdGhlIHVuaXF1ZSB0byBhbGwgcHJvdmlkZXJzLiBSZWNvbW1lbmRlZCB0byBiZSB0aGUgcGFja2FnZSBuYW1lLlxuICBuYW1lOiBzdHJpbmc7XG4gIGlzVmlzaWJsZTogKCkgPT4gYm9vbGVhbjtcbiAgdG9nZ2xlOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlID0ge1xuICAvLyBTZXJpYWxpemUgdGhlIHJlc3RvcmUgc3RhdGUgdmlhIGFuIGFycmF5IG9mIHByb3ZpZGVyIG5hbWVzLlxuICByZXN0b3JlU3RhdGU6ID9BcnJheTxzdHJpbmc+O1xufTtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3R1bm5lbFZpc2lvbjogRGlzdHJhY3Rpb25GcmVlTW9kZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0Rpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl90dW5uZWxWaXNpb24gPSBuZXcgRGlzdHJhY3Rpb25GcmVlTW9kZShzdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRpc3RyYWN0aW9uLWZyZWUtbW9kZTp0b2dnbGUnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0cmFjaygnZGlzdHJhY3Rpb24tZnJlZS1tb2RlOnRvZ2dsZScpO1xuICAgICAgICB0aGlzLl90dW5uZWxWaXNpb24udG9nZ2xlRGlzdHJhY3Rpb25GcmVlTW9kZSgpO1xuICAgICAgfVxuICAgICkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRGlzdHJhY3Rpb25GcmVlTW9kZVN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5fdHVubmVsVmlzaW9uLnNlcmlhbGl6ZSgpO1xuICB9XG5cbiAgY29uc3VtZURpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcihwcm92aWRlcjogRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl90dW5uZWxWaXNpb24uY29uc3VtZURpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcihwcm92aWRlcik7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2V5ZScsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIGRpc3RyYWN0aW9uLWZyZWUgbW9kZScsXG4gICAgICBwcmlvcml0eTogNjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgfSkpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP0Rpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGdldEJ1aWx0aW5Qcm92aWRlcnMoKSkge1xuICAgICAgYWN0aXZhdGlvbi5jb25zdW1lRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IERpc3RyYWN0aW9uRnJlZU1vZGVTdGF0ZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIoXG4gIHByb3ZpZGVyOiBEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXJcbik6IElEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gIT0gbnVsbCk7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgYWN0aXZhdGlvbi5jb25zdW1lVG9vbEJhcihnZXRUb29sQmFyKTtcbn1cbiJdfQ==