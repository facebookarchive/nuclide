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
            description: 'Make sure that one of the folders in your Atom project (or its ancestor)' + ' contains either a package.json with a "react-native" dependency, or a' + ' .buckconfig file with a "[react-native]" section that has a "server" key.'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhY2thZ2VyQWN0aXZhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBVzZCLGtCQUFrQjs7d0NBQ1YsNEJBQTRCOzs7O3dDQUM1Qiw0QkFBNEI7Ozs7b0JBQ25CLE1BQU07O29CQUMzQixNQUFNOztrQkFDaEIsSUFBSTs7Ozs7Ozs7O0lBTU4sa0JBQWtCO0FBT2xCLFdBUEEsa0JBQWtCLEdBT2Y7OzswQkFQSCxrQkFBa0I7O0FBUTNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDJDQUFxQyxFQUFFO2VBQU0sTUFBSyxRQUFRLEVBQUU7T0FBQTtBQUM1RCwwQ0FBb0MsRUFBRTtlQUFNLE1BQUssS0FBSyxFQUFFO09BQUE7QUFDeEQsNkNBQXVDLEVBQUU7ZUFBTSxNQUFLLFFBQVEsRUFBRTtPQUFBO0tBQy9ELENBQUMsRUFDRixxQkFBZTthQUFNLE1BQUssS0FBSyxFQUFFO0tBQUEsQ0FBQyxDQUNuQyxDQUFDOzs7Ozs7QUFNRixRQUFNLFVBQVUsR0FBRyxzQkFBZ0IsQ0FBQztBQUNwQyxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLDBDQUE2QixVQUFVLENBQUMsQ0FBQztBQUN6RSw4Q0FBNkIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ25EOztlQXhCVSxrQkFBa0I7O1dBMEJ0QixtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVPLG9CQUFTOzs7QUFDZixVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsVUFBSSxDQUFDLHNCQUFzQixHQUFHLDhCQUM1QixnQkFBRyxVQUFVLENBQUMsV0FBVyxDQUFDLHFDQUFnQixDQUFDLENBQ3hDLFNBQVMsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUN4QixZQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUU7QUFDbEUsdUJBQVcsRUFDVCwwRUFBMEUsR0FDMUUsd0VBQXdFLEdBQ3hFLDRFQUE0RTtXQUMvRSxDQUFDLENBQUM7QUFDSCxpQkFBTztTQUNSO0FBQ0QsZUFBSyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ3hDLENBQUMsRUFDSixxQkFBZTtlQUFNLE9BQUssUUFBUSxDQUFDLFVBQVUsRUFBRTtPQUFBLENBQUMsQ0FDakQsQ0FBQztLQUNIOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQy9CLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO09BQ3BDO0tBQ0Y7OztTQXhEVSxrQkFBa0IiLCJmaWxlIjoiUGFja2FnZXJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtnZXRDb21tYW5kSW5mb30gZnJvbSAnLi9nZXRDb21tYW5kSW5mbyc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXIgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlck1hbmFnZXInO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG4vKipcbiAqIFJ1bnMgdGhlIHNlcnZlciBpbiB0aGUgYXBwcm9wcmlhdGUgcGxhY2UuIFRoaXMgY2xhc3MgZW5jYXBzdWxhdGVzIGFsbCB0aGUgc3RhdGUgb2YgdGhlIHBhY2thZ2VyXG4gKiBzbyBhcyB0byBrZWVwIHRoZSBBY3RpdmF0aW9uIGNsYXNzICh3aGljaCBicmluZ3MgdG9nZXRoZXIgdmFyaW91cyBSTiBmZWF0dXJlcykgY2xlYW4uXG4gKi9cbmV4cG9ydCBjbGFzcyBQYWNrYWdlckFjdGl2YXRpb24ge1xuXG4gIF9hY3Rpb25zOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM7XG4gIF9jb25uZWN0aW9uRGlzcG9zYWJsZXM6ID9JRGlzcG9zYWJsZTtcbiAgX2Rpc3Bvc2FibGVzOiBJRGlzcG9zYWJsZTtcbiAgX3N0b3BwZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnN0YXJ0LXBhY2thZ2VyJzogKCkgPT4gdGhpcy5fcmVzdGFydCgpLFxuICAgICAgICAnbnVjbGlkZS1yZWFjdC1uYXRpdmU6c3RvcC1wYWNrYWdlcic6ICgpID0+IHRoaXMuX3N0b3AoKSxcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnJlc3RhcnQtcGFja2FnZXInOiAoKSA9PiB0aGlzLl9yZXN0YXJ0KCksXG4gICAgICB9KSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3N0b3AoKSksXG4gICAgKTtcblxuICAgIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBSZW1vdmUgYWxsIHRoaXMgZmx1eCBzdHVmZi4gQWxsIHdlIG5lZWQgaXMgYW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50c1xuICAgIC8vICAgdGhlIHBhY2thZ2VyIHNlcnZlci4gV2UgZG9uJ3QgYWN0dWFsbHkgaGF2ZSBhIHN0b3JlIGhlcmUsIHdlJ3JlIGp1c3QgdXNpbmcgdGhlXG4gICAgLy8gICBhY3Rpb25zL2Rpc3BhdGNoZXIgYXMgYSByb3VuZGFib3V0IHdheSBvZiBjYWxsaW5nIG1ldGhvZHMgb24gdGhlIHNlcnZlciBzbyB3ZSBjYW4ganVzdFxuICAgIC8vICAgbWVyZ2UgdGhhdCBzdHVmZiBpbnRvIHRoaXMgY2xhc3MgKGFmdGVyIHJlbW92aW5nIGV4dHJhIGxvZ2ljLCBldGMpLlxuICAgIGNvbnN0IGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIGNvbnN0IGFjdGlvbnMgPSB0aGlzLl9hY3Rpb25zID0gbmV3IFJlYWN0TmF0aXZlU2VydmVyQWN0aW9ucyhkaXNwYXRjaGVyKTtcbiAgICBuZXcgUmVhY3ROYXRpdmVTZXJ2ZXJNYW5hZ2VyKGRpc3BhdGNoZXIsIGFjdGlvbnMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfcmVzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wKCk7XG5cbiAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbVByb21pc2UoZ2V0Q29tbWFuZEluZm8oKSlcbiAgICAgICAgLnN1YnNjcmliZShjb21tYW5kSW5mbyA9PiB7XG4gICAgICAgICAgaWYgKGNvbW1hbmRJbmZvID09IG51bGwpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBSZWFjdCBOYXRpdmUgcHJvamVjdFwiLCB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICdNYWtlIHN1cmUgdGhhdCBvbmUgb2YgdGhlIGZvbGRlcnMgaW4geW91ciBBdG9tIHByb2plY3QgKG9yIGl0cyBhbmNlc3RvciknICtcbiAgICAgICAgICAgICAgICAnIGNvbnRhaW5zIGVpdGhlciBhIHBhY2thZ2UuanNvbiB3aXRoIGEgXCJyZWFjdC1uYXRpdmVcIiBkZXBlbmRlbmN5LCBvciBhJyArXG4gICAgICAgICAgICAgICAgJyAuYnVja2NvbmZpZyBmaWxlIHdpdGggYSBcIltyZWFjdC1uYXRpdmVdXCIgc2VjdGlvbiB0aGF0IGhhcyBhIFwic2VydmVyXCIga2V5LicsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5zdGFydFNlcnZlcihjb21tYW5kSW5mbyk7XG4gICAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fYWN0aW9ucy5zdG9wU2VydmVyKCkpLFxuICAgICk7XG4gIH1cblxuICBfc3RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxufVxuIl19