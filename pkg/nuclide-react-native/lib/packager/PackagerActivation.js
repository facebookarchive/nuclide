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

var _nuclideCommons = require('../../../nuclide-commons');

var _getCommandInfo = require('./getCommandInfo');

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

var _ReactNativeServerManager = require('./ReactNativeServerManager');

var _ReactNativeServerManager2 = _interopRequireDefault(_ReactNativeServerManager);

var _atom = require('atom');

var _flux = require('flux');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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

      this._connectionDisposables = new _atom.CompositeDisposable(new _nuclideCommons.DisposableSubscription(_reactivexRxjs2['default'].Observable.fromPromise((0, _getCommandInfo.getCommandInfo)()).subscribe(function (commandInfo) {
        if (commandInfo == null) {
          atom.notifications.addError("Couldn't find a React Native project", {
            dismissable: true,
            description: 'Make sure that one of the folders in your Atom project (or its ancestor)' + ' contains a "node_modules" directory with react-native installed, or a' + ' .buckconfig file with a "[react-native]" section that has a "server" key.'
          });
          return;
        }
        _this2._actions.startServer(commandInfo);
      })), new _atom.Disposable(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhY2thZ2VyQWN0aXZhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBV3FDLDBCQUEwQjs7OEJBQ2xDLGtCQUFrQjs7d0NBQ1YsNEJBQTRCOzs7O3dDQUM1Qiw0QkFBNEI7Ozs7b0JBQ25CLE1BQU07O29CQUMzQixNQUFNOzs2QkFDaEIsaUJBQWlCOzs7Ozs7Ozs7SUFNbkIsa0JBQWtCO0FBT2xCLFdBUEEsa0JBQWtCLEdBT2Y7OzswQkFQSCxrQkFBa0I7O0FBUTNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDJDQUFxQyxFQUFFO2VBQU0sTUFBSyxRQUFRLEVBQUU7T0FBQTtBQUM1RCwwQ0FBb0MsRUFBRTtlQUFNLE1BQUssS0FBSyxFQUFFO09BQUE7QUFDeEQsNkNBQXVDLEVBQUU7ZUFBTSxNQUFLLFFBQVEsRUFBRTtPQUFBO0tBQy9ELENBQUMsRUFDRixxQkFBZTthQUFNLE1BQUssS0FBSyxFQUFFO0tBQUEsQ0FBQyxDQUNuQyxDQUFDOzs7Ozs7QUFNRixRQUFNLFVBQVUsR0FBRyxzQkFBZ0IsQ0FBQztBQUNwQyxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLDBDQUE2QixVQUFVLENBQUMsQ0FBQztBQUN6RSw4Q0FBNkIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ25EOztlQXhCVSxrQkFBa0I7O1dBMEJ0QixtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVPLG9CQUFTOzs7QUFDZixVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsVUFBSSxDQUFDLHNCQUFzQixHQUFHLDhCQUM1QiwyQ0FDRSwyQkFBRyxVQUFVLENBQUMsV0FBVyxDQUFDLHFDQUFnQixDQUFDLENBQ3hDLFNBQVMsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUN4QixZQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUU7QUFDbEUsdUJBQVcsRUFBRSxJQUFJO0FBQ2pCLHVCQUFXLEVBQ1QsMEVBQTBFLEdBQzFFLHdFQUF3RSxHQUN4RSw0RUFBNEU7V0FDL0UsQ0FBQyxDQUFDO0FBQ0gsaUJBQU87U0FDUjtBQUNELGVBQUssUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUN4QyxDQUFDLENBQ0wsRUFDRCxxQkFBZTtlQUFNLE9BQUssUUFBUSxDQUFDLFVBQVUsRUFBRTtPQUFBLENBQUMsQ0FDakQsQ0FBQztLQUNIOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQy9CLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0tBQ0Y7OztTQTNEVSxrQkFBa0IiLCJmaWxlIjoiUGFja2FnZXJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRDb21tYW5kSW5mb30gZnJvbSAnLi9nZXRDb21tYW5kSW5mbyc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXInO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuLyoqXG4gKiBSdW5zIHRoZSBzZXJ2ZXIgaW4gdGhlIGFwcHJvcHJpYXRlIHBsYWNlLiBUaGlzIGNsYXNzIGVuY2Fwc3VsYXRlcyBhbGwgdGhlIHN0YXRlIG9mIHRoZSBwYWNrYWdlclxuICogc28gYXMgdG8ga2VlcCB0aGUgQWN0aXZhdGlvbiBjbGFzcyAod2hpY2ggYnJpbmdzIHRvZ2V0aGVyIHZhcmlvdXMgUk4gZmVhdHVyZXMpIGNsZWFuLlxuICovXG5leHBvcnQgY2xhc3MgUGFja2FnZXJBY3RpdmF0aW9uIHtcblxuICBfYWN0aW9uczogUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zO1xuICBfY29ubmVjdGlvbkRpc3Bvc2FibGVzOiA/SURpc3Bvc2FibGU7XG4gIF9kaXNwb3NhYmxlczogSURpc3Bvc2FibGU7XG4gIF9zdG9wcGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpzdGFydC1wYWNrYWdlcic6ICgpID0+IHRoaXMuX3Jlc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnN0b3AtcGFja2FnZXInOiAoKSA9PiB0aGlzLl9zdG9wKCksXG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpyZXN0YXJ0LXBhY2thZ2VyJzogKCkgPT4gdGhpcy5fcmVzdGFydCgpLFxuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zdG9wKCkpLFxuICAgICk7XG5cbiAgICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogUmVtb3ZlIGFsbCB0aGlzIGZsdXggc3R1ZmYuIEFsbCB3ZSBuZWVkIGlzIGFuIG9iamVjdCB0aGF0IHJlcHJlc2VudHNcbiAgICAvLyAgIHRoZSBwYWNrYWdlciBzZXJ2ZXIuIFdlIGRvbid0IGFjdHVhbGx5IGhhdmUgYSBzdG9yZSBoZXJlLCB3ZSdyZSBqdXN0IHVzaW5nIHRoZVxuICAgIC8vICAgYWN0aW9ucy9kaXNwYXRjaGVyIGFzIGEgcm91bmRhYm91dCB3YXkgb2YgY2FsbGluZyBtZXRob2RzIG9uIHRoZSBzZXJ2ZXIgc28gd2UgY2FuIGp1c3RcbiAgICAvLyAgIG1lcmdlIHRoYXQgc3R1ZmYgaW50byB0aGlzIGNsYXNzIChhZnRlciByZW1vdmluZyBleHRyYSBsb2dpYywgZXRjKS5cbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5fYWN0aW9ucyA9IG5ldyBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMoZGlzcGF0Y2hlcik7XG4gICAgbmV3IFJlYWN0TmF0aXZlU2VydmVyTWFuYWdlcihkaXNwYXRjaGVyLCBhY3Rpb25zKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3Jlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcCgpO1xuXG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShnZXRDb21tYW5kSW5mbygpKVxuICAgICAgICAgIC5zdWJzY3JpYmUoY29tbWFuZEluZm8gPT4ge1xuICAgICAgICAgICAgaWYgKGNvbW1hbmRJbmZvID09IG51bGwpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIFJlYWN0IE5hdGl2ZSBwcm9qZWN0XCIsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICdNYWtlIHN1cmUgdGhhdCBvbmUgb2YgdGhlIGZvbGRlcnMgaW4geW91ciBBdG9tIHByb2plY3QgKG9yIGl0cyBhbmNlc3RvciknICtcbiAgICAgICAgICAgICAgICAgICcgY29udGFpbnMgYSBcIm5vZGVfbW9kdWxlc1wiIGRpcmVjdG9yeSB3aXRoIHJlYWN0LW5hdGl2ZSBpbnN0YWxsZWQsIG9yIGEnICtcbiAgICAgICAgICAgICAgICAgICcgLmJ1Y2tjb25maWcgZmlsZSB3aXRoIGEgXCJbcmVhY3QtbmF0aXZlXVwiIHNlY3Rpb24gdGhhdCBoYXMgYSBcInNlcnZlclwiIGtleS4nLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5zdGFydFNlcnZlcihjb21tYW5kSW5mbyk7XG4gICAgICAgICAgfSksXG4gICAgICApLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fYWN0aW9ucy5zdG9wU2VydmVyKCkpLFxuICAgICk7XG4gIH1cblxuICBfc3RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxufVxuIl19