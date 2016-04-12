Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _getCommandInfo = require('./getCommandInfo');

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

var _ReactNativeServerManager = require('./ReactNativeServerManager');

var _ReactNativeServerManager2 = _interopRequireDefault(_ReactNativeServerManager);

var _atom = require('atom');

var _flux = require('flux');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */

var PackagerActivation = (function () {
  function PackagerActivation() {
    var _this = this;

    _classCallCheck(this, PackagerActivation);

    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-packager': function nuclideReactNativeStartPackager() {
        return _this._restart();
      },
      'nuclide-react-native:stop-packager': function nuclideReactNativeStopPackager() {
        return _this._stop();
      },
      'nuclide-react-native:restart-packager': function nuclideReactNativeRestartPackager() {
        return _this._restart();
      }
    }), new _atom.Disposable(function () {
      return _this._stop();
    }));

    // TODO(matthewwithanm): Remove all this flux stuff. All we need is an object that represents
    //   the packager server. We don't actually have a store here, we're just using the
    //   actions/dispatcher as a roundabout way of calling methods on the server so we can just
    //   merge that stuff into this class (after removing extra logic, etc).
    var dispatcher = new _flux.Dispatcher();
    var actions = this._actions = new _ReactNativeServerActions2['default'](dispatcher);
    new _ReactNativeServerManager2['default'](dispatcher, actions); // eslint-disable-line no-new
  }

  _createClass(PackagerActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_restart',
    value: function _restart() {
      var _this2 = this;

      this._stop();

      this._connectionDisposables = new _atom.CompositeDisposable(_rx2['default'].Observable.fromPromise((0, _getCommandInfo.getCommandInfo)()).subscribe(function (commandInfo) {
        if (commandInfo == null) {
          atom.notifications.addError("Couldn't find a React Native project", {
            dismissable: true,
            description: 'Make sure that one of the folders in your Atom project (or its ancestor)' + ' contains a "node_modules" directory with react-native installed, or a' + ' .buckconfig file with a "[react-native]" section that has a "server" key.'
          });
          return;
        }
        _this2._actions.startServer(commandInfo);
      }), new _atom.Disposable(function () {
        return _this2._actions.stopServer();
      }));
    }
  }, {
    key: '_stop',
    value: function _stop() {
      if (this._connectionDisposables) {
        this._connectionDisposables.dispose();
        this._connectionDisposables = null;
      }
    }
  }]);

  return PackagerActivation;
})();

exports.PackagerActivation = PackagerActivation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhY2thZ2VyQWN0aXZhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBVzZCLGtCQUFrQjs7d0NBQ1YsNEJBQTRCOzs7O3dDQUM1Qiw0QkFBNEI7Ozs7b0JBQ25CLE1BQU07O29CQUMzQixNQUFNOztrQkFDaEIsSUFBSTs7Ozs7Ozs7O0lBTU4sa0JBQWtCO0FBT2xCLFdBUEEsa0JBQWtCLEdBT2Y7OzswQkFQSCxrQkFBa0I7O0FBUTNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDJDQUFxQyxFQUFFO2VBQU0sTUFBSyxRQUFRLEVBQUU7T0FBQTtBQUM1RCwwQ0FBb0MsRUFBRTtlQUFNLE1BQUssS0FBSyxFQUFFO09BQUE7QUFDeEQsNkNBQXVDLEVBQUU7ZUFBTSxNQUFLLFFBQVEsRUFBRTtPQUFBO0tBQy9ELENBQUMsRUFDRixxQkFBZTthQUFNLE1BQUssS0FBSyxFQUFFO0tBQUEsQ0FBQyxDQUNuQyxDQUFDOzs7Ozs7QUFNRixRQUFNLFVBQVUsR0FBRyxzQkFBZ0IsQ0FBQztBQUNwQyxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLDBDQUE2QixVQUFVLENBQUMsQ0FBQztBQUN6RSw4Q0FBNkIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ25EOztlQXhCVSxrQkFBa0I7O1dBMEJ0QixtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVPLG9CQUFTOzs7QUFDZixVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsVUFBSSxDQUFDLHNCQUFzQixHQUFHLDhCQUM1QixnQkFBRyxVQUFVLENBQUMsV0FBVyxDQUFDLHFDQUFnQixDQUFDLENBQ3hDLFNBQVMsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUN4QixZQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUU7QUFDbEUsdUJBQVcsRUFBRSxJQUFJO0FBQ2pCLHVCQUFXLEVBQ1QsMEVBQTBFLEdBQzFFLHdFQUF3RSxHQUN4RSw0RUFBNEU7V0FDL0UsQ0FBQyxDQUFDO0FBQ0gsaUJBQU87U0FDUjtBQUNELGVBQUssUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUN4QyxDQUFDLEVBQ0oscUJBQWU7ZUFBTSxPQUFLLFFBQVEsQ0FBQyxVQUFVLEVBQUU7T0FBQSxDQUFDLENBQ2pELENBQUM7S0FDSDs7O1dBRUksaUJBQVM7QUFDWixVQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtBQUMvQixZQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMsWUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztPQUNwQztLQUNGOzs7U0F6RFUsa0JBQWtCIiwiZmlsZSI6IlBhY2thZ2VyQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Z2V0Q29tbWFuZEluZm99IGZyb20gJy4vZ2V0Q29tbWFuZEluZm8nO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuLyoqXG4gKiBSdW5zIHRoZSBzZXJ2ZXIgaW4gdGhlIGFwcHJvcHJpYXRlIHBsYWNlLiBUaGlzIGNsYXNzIGVuY2Fwc3VsYXRlcyBhbGwgdGhlIHN0YXRlIG9mIHRoZSBwYWNrYWdlclxuICogc28gYXMgdG8ga2VlcCB0aGUgQWN0aXZhdGlvbiBjbGFzcyAod2hpY2ggYnJpbmdzIHRvZ2V0aGVyIHZhcmlvdXMgUk4gZmVhdHVyZXMpIGNsZWFuLlxuICovXG5leHBvcnQgY2xhc3MgUGFja2FnZXJBY3RpdmF0aW9uIHtcblxuICBfYWN0aW9uczogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zO1xuICBfY29ubmVjdGlvbkRpc3Bvc2FibGVzOiA/SURpc3Bvc2FibGU7XG4gIF9kaXNwb3NhYmxlczogSURpc3Bvc2FibGU7XG4gIF9zdG9wcGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpzdGFydC1wYWNrYWdlcic6ICgpID0+IHRoaXMuX3Jlc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnN0b3AtcGFja2FnZXInOiAoKSA9PiB0aGlzLl9zdG9wKCksXG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpyZXN0YXJ0LXBhY2thZ2VyJzogKCkgPT4gdGhpcy5fcmVzdGFydCgpLFxuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zdG9wKCkpLFxuICAgICk7XG5cbiAgICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogUmVtb3ZlIGFsbCB0aGlzIGZsdXggc3R1ZmYuIEFsbCB3ZSBuZWVkIGlzIGFuIG9iamVjdCB0aGF0IHJlcHJlc2VudHNcbiAgICAvLyAgIHRoZSBwYWNrYWdlciBzZXJ2ZXIuIFdlIGRvbid0IGFjdHVhbGx5IGhhdmUgYSBzdG9yZSBoZXJlLCB3ZSdyZSBqdXN0IHVzaW5nIHRoZVxuICAgIC8vICAgYWN0aW9ucy9kaXNwYXRjaGVyIGFzIGEgcm91bmRhYm91dCB3YXkgb2YgY2FsbGluZyBtZXRob2RzIG9uIHRoZSBzZXJ2ZXIgc28gd2UgY2FuIGp1c3RcbiAgICAvLyAgIG1lcmdlIHRoYXQgc3R1ZmYgaW50byB0aGlzIGNsYXNzIChhZnRlciByZW1vdmluZyBleHRyYSBsb2dpYywgZXRjKS5cbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5fYWN0aW9ucyA9IG5ldyBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMoZGlzcGF0Y2hlcik7XG4gICAgbmV3IFJlYWN0TmF0aXZlU2VydmVyTWFuYWdlcihkaXNwYXRjaGVyLCBhY3Rpb25zKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3Jlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcCgpO1xuXG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBSeC5PYnNlcnZhYmxlLmZyb21Qcm9taXNlKGdldENvbW1hbmRJbmZvKCkpXG4gICAgICAgIC5zdWJzY3JpYmUoY29tbWFuZEluZm8gPT4ge1xuICAgICAgICAgIGlmIChjb21tYW5kSW5mbyA9PSBudWxsKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgUmVhY3QgTmF0aXZlIHByb2plY3RcIiwge1xuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgJ01ha2Ugc3VyZSB0aGF0IG9uZSBvZiB0aGUgZm9sZGVycyBpbiB5b3VyIEF0b20gcHJvamVjdCAob3IgaXRzIGFuY2VzdG9yKScgK1xuICAgICAgICAgICAgICAgICcgY29udGFpbnMgYSBcIm5vZGVfbW9kdWxlc1wiIGRpcmVjdG9yeSB3aXRoIHJlYWN0LW5hdGl2ZSBpbnN0YWxsZWQsIG9yIGEnICtcbiAgICAgICAgICAgICAgICAnIC5idWNrY29uZmlnIGZpbGUgd2l0aCBhIFwiW3JlYWN0LW5hdGl2ZV1cIiBzZWN0aW9uIHRoYXQgaGFzIGEgXCJzZXJ2ZXJcIiBrZXkuJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLnN0YXJ0U2VydmVyKGNvbW1hbmRJbmZvKTtcbiAgICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9hY3Rpb25zLnN0b3BTZXJ2ZXIoKSksXG4gICAgKTtcbiAgfVxuXG4gIF9zdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=