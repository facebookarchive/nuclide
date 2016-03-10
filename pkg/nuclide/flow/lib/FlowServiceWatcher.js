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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FlowServiceFactory = require('./FlowServiceFactory');

var FlowServiceWatcher = (function () {
  function FlowServiceWatcher() {
    var _this = this;

    _classCallCheck(this, FlowServiceWatcher);

    this._subscription = (0, _FlowServiceFactory.getServerStatusUpdates)().filter(function (_ref) {
      var status = _ref.status;
      return status === 'failed';
    }).subscribe(function (_ref2) {
      var pathToRoot = _ref2.pathToRoot;

      _this._handleFailure(pathToRoot);
    });
  }

  _createClass(FlowServiceWatcher, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.dispose();
    }
  }, {
    key: '_handleFailure',
    value: function _handleFailure(pathToRoot) {
      var failureMessage = 'Flow has failed in \'' + pathToRoot + '\'.<br/><br/>' + 'Flow features will be disabled for the remainder of this Nuclide session. ' + 'You may re-enable them by clicking below or by running the "Restart Flow Server" command ' + 'from the command palette later.';
      var notification = atom.notifications.addError(failureMessage, {
        dismissable: true,
        buttons: [{
          className: 'icon icon-zap',
          onDidClick: function onDidClick() {
            notification.dismiss();
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server');
          },
          text: 'Restart Flow Server'
        }]
      });
    }
  }]);

  return FlowServiceWatcher;
})();

exports.FlowServiceWatcher = FlowServiceWatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dTZXJ2aWNlV2F0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2tDQWFxQyxzQkFBc0I7O0lBRTlDLGtCQUFrQjtBQUdsQixXQUhBLGtCQUFrQixHQUdmOzs7MEJBSEgsa0JBQWtCOztBQUkzQixRQUFJLENBQUMsYUFBYSxHQUFHLGlEQUF3QixDQUMxQyxNQUFNLENBQUMsVUFBQyxJQUFRO1VBQVAsTUFBTSxHQUFQLElBQVEsQ0FBUCxNQUFNO2FBQU0sTUFBTSxLQUFLLFFBQVE7S0FBQSxDQUFDLENBQ3pDLFNBQVMsQ0FBQyxVQUFDLEtBQVksRUFBSztVQUFoQixVQUFVLEdBQVgsS0FBWSxDQUFYLFVBQVU7O0FBQ3JCLFlBQUssY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2pDLENBQUMsQ0FBQztHQUNOOztlQVRVLGtCQUFrQjs7V0FXdEIsbUJBQVM7QUFDZCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7V0FFYSx3QkFBQyxVQUFzQixFQUFRO0FBQzNDLFVBQU0sY0FBYyxHQUFHLDBCQUF1QixVQUFVLHFCQUN0RCw0RUFBNEUsR0FDNUUsMkZBQTJGLEdBQzNGLGlDQUFpQyxDQUNsQztBQUNELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUM5QyxjQUFjLEVBQ2Q7QUFDRSxtQkFBVyxFQUFFLElBQUk7QUFDakIsZUFBTyxFQUFFLENBQUM7QUFDUixtQkFBUyxFQUFFLGVBQWU7QUFDMUIsb0JBQVUsRUFBQSxzQkFBRztBQUNYLHdCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLGtDQUFrQyxDQUNuQyxDQUFDO1dBQ0g7QUFDRCxjQUFJLEVBQUUscUJBQXFCO1NBQzVCLENBQUM7T0FDSCxDQUNGLENBQUM7S0FDSDs7O1NBdENVLGtCQUFrQiIsImZpbGUiOiJGbG93U2VydmljZVdhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7Z2V0U2VydmVyU3RhdHVzVXBkYXRlc30gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuXG5leHBvcnQgY2xhc3MgRmxvd1NlcnZpY2VXYXRjaGVyIHtcbiAgX3N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpXG4gICAgICAuZmlsdGVyKCh7c3RhdHVzfSkgPT4gc3RhdHVzID09PSAnZmFpbGVkJylcbiAgICAgIC5zdWJzY3JpYmUoKHtwYXRoVG9Sb290fSkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVGYWlsdXJlKHBhdGhUb1Jvb3QpO1xuICAgICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gIH1cblxuICBfaGFuZGxlRmFpbHVyZShwYXRoVG9Sb290OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgZmFpbHVyZU1lc3NhZ2UgPSBgRmxvdyBoYXMgZmFpbGVkIGluICcke3BhdGhUb1Jvb3R9Jy48YnIvPjxici8+YCArXG4gICAgICAnRmxvdyBmZWF0dXJlcyB3aWxsIGJlIGRpc2FibGVkIGZvciB0aGUgcmVtYWluZGVyIG9mIHRoaXMgTnVjbGlkZSBzZXNzaW9uLiAnICtcbiAgICAgICdZb3UgbWF5IHJlLWVuYWJsZSB0aGVtIGJ5IGNsaWNraW5nIGJlbG93IG9yIGJ5IHJ1bm5pbmcgdGhlIFwiUmVzdGFydCBGbG93IFNlcnZlclwiIGNvbW1hbmQgJyArXG4gICAgICAnZnJvbSB0aGUgY29tbWFuZCBwYWxldHRlIGxhdGVyLidcbiAgICA7XG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgZmFpbHVyZU1lc3NhZ2UsXG4gICAgICB7XG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICBidXR0b25zOiBbe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ2ljb24gaWNvbi16YXAnLFxuICAgICAgICAgIG9uRGlkQ2xpY2soKSB7XG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICAgICAgICAgJ251Y2xpZGUtZmxvdzpyZXN0YXJ0LWZsb3ctc2VydmVyJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0ZXh0OiAnUmVzdGFydCBGbG93IFNlcnZlcicsXG4gICAgICAgIH1dLFxuICAgICAgfVxuICAgICk7XG4gIH1cbn1cbiJdfQ==