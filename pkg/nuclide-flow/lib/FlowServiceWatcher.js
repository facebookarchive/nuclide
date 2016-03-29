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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dTZXJ2aWNlV2F0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2tDQWFxQyxzQkFBc0I7O0lBRTlDLGtCQUFrQjtBQUdsQixXQUhBLGtCQUFrQixHQUdmOzs7MEJBSEgsa0JBQWtCOztBQUkzQixRQUFJLENBQUMsYUFBYSxHQUFHLGlEQUF3QixDQUMxQyxNQUFNLENBQUMsVUFBQyxJQUFRO1VBQVAsTUFBTSxHQUFQLElBQVEsQ0FBUCxNQUFNO2FBQU0sTUFBTSxLQUFLLFFBQVE7S0FBQSxDQUFDLENBQ3pDLFNBQVMsQ0FBQyxVQUFDLEtBQVksRUFBSztVQUFoQixVQUFVLEdBQVgsS0FBWSxDQUFYLFVBQVU7O0FBQ3JCLFlBQUssY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2pDLENBQUMsQ0FBQztHQUNOOztlQVRVLGtCQUFrQjs7V0FXdEIsbUJBQVM7QUFDZCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7V0FFYSx3QkFBQyxVQUFzQixFQUFRO0FBQzNDLFVBQU0sY0FBYyxHQUFHLDBCQUF1QixVQUFVLHFCQUN0RCw0RUFBNEUsR0FDNUUsMkZBQTJGLEdBQzNGLGlDQUFpQyxDQUNsQztBQUNELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUM5QyxjQUFjLEVBQ2Q7QUFDRSxtQkFBVyxFQUFFLElBQUk7QUFDakIsZUFBTyxFQUFFLENBQUM7QUFDUixtQkFBUyxFQUFFLGVBQWU7QUFDMUIsb0JBQVUsRUFBQSxzQkFBRztBQUNYLHdCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLGtDQUFrQyxDQUNuQyxDQUFDO1dBQ0g7QUFDRCxjQUFJLEVBQUUscUJBQXFCO1NBQzVCLENBQUM7T0FDSCxDQUNGLENBQUM7S0FDSDs7O1NBdENVLGtCQUFrQiIsImZpbGUiOiJGbG93U2VydmljZVdhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzfSBmcm9tICcuL0Zsb3dTZXJ2aWNlRmFjdG9yeSc7XG5cbmV4cG9ydCBjbGFzcyBGbG93U2VydmljZVdhdGNoZXIge1xuICBfc3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKClcbiAgICAgIC5maWx0ZXIoKHtzdGF0dXN9KSA9PiBzdGF0dXMgPT09ICdmYWlsZWQnKVxuICAgICAgLnN1YnNjcmliZSgoe3BhdGhUb1Jvb3R9KSA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZUZhaWx1cmUocGF0aFRvUm9vdCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVGYWlsdXJlKHBhdGhUb1Jvb3Q6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBmYWlsdXJlTWVzc2FnZSA9IGBGbG93IGhhcyBmYWlsZWQgaW4gJyR7cGF0aFRvUm9vdH0nLjxici8+PGJyLz5gICtcbiAgICAgICdGbG93IGZlYXR1cmVzIHdpbGwgYmUgZGlzYWJsZWQgZm9yIHRoZSByZW1haW5kZXIgb2YgdGhpcyBOdWNsaWRlIHNlc3Npb24uICcgK1xuICAgICAgJ1lvdSBtYXkgcmUtZW5hYmxlIHRoZW0gYnkgY2xpY2tpbmcgYmVsb3cgb3IgYnkgcnVubmluZyB0aGUgXCJSZXN0YXJ0IEZsb3cgU2VydmVyXCIgY29tbWFuZCAnICtcbiAgICAgICdmcm9tIHRoZSBjb21tYW5kIHBhbGV0dGUgbGF0ZXIuJ1xuICAgIDtcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICBmYWlsdXJlTWVzc2FnZSxcbiAgICAgIHtcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnaWNvbiBpY29uLXphcCcsXG4gICAgICAgICAgb25EaWRDbGljaygpIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICAgICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgICAgICAgICAnbnVjbGlkZS1mbG93OnJlc3RhcnQtZmxvdy1zZXJ2ZXInLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRleHQ6ICdSZXN0YXJ0IEZsb3cgU2VydmVyJyxcbiAgICAgICAgfV0sXG4gICAgICB9XG4gICAgKTtcbiAgfVxufVxuIl19