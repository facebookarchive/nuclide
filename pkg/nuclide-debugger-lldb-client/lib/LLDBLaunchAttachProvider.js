Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _reactForAtom = require('react-for-atom');

var _flux = require('flux');

var _LaunchAttachStore = require('./LaunchAttachStore');

var _LaunchUIComponent = require('./LaunchUIComponent');

var _AttachUIComponent = require('./AttachUIComponent');

var _LaunchAttachActions = require('./LaunchAttachActions');

var LLDBLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(LLDBLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function LLDBLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, LLDBLaunchAttachProvider);

    _get(Object.getPrototypeOf(LLDBLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
    this._dispatcher = new _flux.Dispatcher();
    this._actions = new _LaunchAttachActions.LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new _LaunchAttachStore.LaunchAttachStore(this._dispatcher);
  }

  _createClass(LLDBLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      if (action === 'Launch') {
        return _reactForAtom.React.createElement(_LaunchUIComponent.LaunchUIComponent, { store: this._store, actions: this._actions });
      } else if (action === 'Attach') {
        this._actions.updateAttachTargetList();
        return _reactForAtom.React.createElement(_AttachUIComponent.AttachUIComponent, { store: this._store, actions: this._actions });
      } else {
        return null;
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._store.dispose();
    }
  }]);

  return LLDBLaunchAttachProvider;
})(_nuclideDebuggerAtom.DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxMREJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FXMkMsNkJBQTZCOzs0QkFDcEQsZ0JBQWdCOztvQkFDWCxNQUFNOztpQ0FDQyxxQkFBcUI7O2lDQUNyQixxQkFBcUI7O2lDQUNyQixxQkFBcUI7O21DQUNuQix1QkFBdUI7O0lBRTVDLHdCQUF3QjtZQUF4Qix3QkFBd0I7O0FBS3hCLFdBTEEsd0JBQXdCLENBS3ZCLGlCQUF5QixFQUFFLFNBQWlCLEVBQUU7MEJBTC9DLHdCQUF3Qjs7QUFNakMsK0JBTlMsd0JBQXdCLDZDQU0zQixpQkFBaUIsRUFBRSxTQUFTLEVBQUU7QUFDcEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxzQkFBZ0IsQ0FBQztBQUNwQyxRQUFJLENBQUMsUUFBUSxHQUFHLDZDQUF3QixJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLFFBQUksQ0FBQyxNQUFNLEdBQUcseUNBQXNCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUN2RDs7ZUFWVSx3QkFBd0I7O1dBWXpCLHNCQUFrQjtBQUMxQixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFVyxzQkFBQyxNQUFjLEVBQWtCO0FBQzNDLFVBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUN2QixlQUFPLDBFQUFtQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDLEdBQUcsQ0FBQztPQUMxRSxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixZQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDdkMsZUFBTywwRUFBbUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQyxHQUFHLENBQUM7T0FDMUUsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCOzs7U0E3QlUsd0JBQXdCIiwiZmlsZSI6IkxMREJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7RGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQge0xhdW5jaEF0dGFjaFN0b3JlfSBmcm9tICcuL0xhdW5jaEF0dGFjaFN0b3JlJztcbmltcG9ydCB7TGF1bmNoVUlDb21wb25lbnR9IGZyb20gJy4vTGF1bmNoVUlDb21wb25lbnQnO1xuaW1wb3J0IHtBdHRhY2hVSUNvbXBvbmVudH0gZnJvbSAnLi9BdHRhY2hVSUNvbXBvbmVudCc7XG5pbXBvcnQge0xhdW5jaEF0dGFjaEFjdGlvbnN9IGZyb20gJy4vTGF1bmNoQXR0YWNoQWN0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBMTERCTGF1bmNoQXR0YWNoUHJvdmlkZXIgZXh0ZW5kcyBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyIHtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9hY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xuICBfc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuXG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2luZ1R5cGVOYW1lOiBzdHJpbmcsIHRhcmdldFVyaTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZGVidWdnaW5nVHlwZU5hbWUsIHRhcmdldFVyaSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgdGhpcy5fYWN0aW9ucyA9IG5ldyBMYXVuY2hBdHRhY2hBY3Rpb25zKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIHRoaXMuX3N0b3JlID0gbmV3IExhdW5jaEF0dGFjaFN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIpO1xuICB9XG5cbiAgZ2V0QWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gWydBdHRhY2gnLCAnTGF1bmNoJ107XG4gIH1cblxuICBnZXRDb21wb25lbnQoYWN0aW9uOiBzdHJpbmcpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ0xhdW5jaCcpIHtcbiAgICAgIHJldHVybiA8TGF1bmNoVUlDb21wb25lbnQgc3RvcmU9e3RoaXMuX3N0b3JlfSBhY3Rpb25zPXt0aGlzLl9hY3Rpb25zfSAvPjtcbiAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ0F0dGFjaCcpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlQXR0YWNoVGFyZ2V0TGlzdCgpO1xuICAgICAgcmV0dXJuIDxBdHRhY2hVSUNvbXBvbmVudCBzdG9yZT17dGhpcy5fc3RvcmV9IGFjdGlvbnM9e3RoaXMuX2FjdGlvbnN9IC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19