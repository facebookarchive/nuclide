Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

var _commons = require('../../../commons');

var _reactNativeNodeExecutorLibDebuggerProxyClient = require('../../../react-native-node-executor/lib/DebuggerProxyClient');

var _serviceHubPlus = require('../../../service-hub-plus');

var _serviceHubPlus2 = _interopRequireDefault(_serviceHubPlus);

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var observableFromSubscribeFunction = _commons.event.observableFromSubscribeFunction;

/**
 * Connects the executor to the debugger.
 */

var DebuggingActivation = (function () {
  function DebuggingActivation() {
    var _this = this;

    _classCallCheck(this, DebuggingActivation);

    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-debugging': function nuclideReactNativeStartDebugging() {
        return _this._startDebugging();
      },
      'nuclide-react-native:stop-debugging': function nuclideReactNativeStopDebugging() {
        return _this._stopDebugging();
      }
    }), new _atom.Disposable(function () {
      return _this._stopDebugging();
    }));
  }

  _createClass(DebuggingActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      if (this._connectionDisposables != null) {
        this._connectionDisposables.dispose();
      }
    }
  }, {
    key: '_startDebugging',
    value: function _startDebugging() {
      this._stopDebugging();
      var client = new _reactNativeNodeExecutorLibDebuggerProxyClient.DebuggerProxyClient();
      this._connectionDisposables = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        return client.disconnect();
      }),
      // $FlowIgnore: Not sure how to annotate combineLatest
      _rx2['default'].Observable.combineLatest(observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client)), _rx2['default'].Observable.fromPromise(_serviceHubPlus2['default'].consumeFirstProvider('nuclide-debugger.remote'))).subscribe(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var pid = _ref2[0];
        var debuggerService = _ref2[1];

        debuggerService.debugNode(pid);
      }));
      client.connect();
    }
  }, {
    key: '_stopDebugging',
    value: function _stopDebugging() {
      if (this._connectionDisposables == null) {
        return;
      }
      this._connectionDisposables.dispose();
      this._connectionDisposables = null;
    }
  }]);

  return DebuggingActivation;
})();

exports.DebuggingActivation = DebuggingActivation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2luZ0FjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBV2dDLGtCQUFrQjs7NkRBQ2hCLDZEQUE2RDs7OEJBQ3hFLDJCQUEyQjs7OztvQkFDSixNQUFNOztrQkFDckMsSUFBSTs7OztJQUVaLCtCQUErQixrQkFBL0IsK0JBQStCOzs7Ozs7SUFLekIsbUJBQW1CO0FBS25CLFdBTEEsbUJBQW1CLEdBS2hCOzs7MEJBTEgsbUJBQW1COztBQU01QixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyw0Q0FBc0MsRUFBRTtlQUFNLE1BQUssZUFBZSxFQUFFO09BQUE7QUFDcEUsMkNBQXFDLEVBQUU7ZUFBTSxNQUFLLGNBQWMsRUFBRTtPQUFBO0tBQ25FLENBQUMsRUFDRixxQkFBZTthQUFNLE1BQUssY0FBYyxFQUFFO0tBQUEsQ0FBQyxDQUM1QyxDQUFDO0dBQ0g7O2VBYlUsbUJBQW1COztXQWV2QixtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsVUFBSSxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN2QztLQUNGOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsVUFBTSxNQUFNLEdBQUcsd0VBQXlCLENBQUM7QUFDekMsVUFBSSxDQUFDLHNCQUFzQixHQUFHLDhCQUM1QixxQkFBZTtlQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUU7T0FBQSxDQUFDOztBQUV6QyxzQkFBRyxVQUFVLENBQUMsYUFBYSxDQUN6QiwrQkFBK0IsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQy9FLGdCQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsNEJBQVcsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUN0RixDQUNFLFNBQVMsQ0FBQyxVQUFDLElBQXNCLEVBQUs7bUNBQTNCLElBQXNCOztZQUFyQixHQUFHO1lBQUUsZUFBZTs7QUFDL0IsdUJBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDaEMsQ0FBQyxDQUNMLENBQUM7QUFDRixZQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEI7OztXQUVhLDBCQUFTO0FBQ3JCLFVBQUksSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksRUFBRTtBQUN2QyxlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMsVUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztLQUNwQzs7O1NBN0NVLG1CQUFtQiIsImZpbGUiOiJEZWJ1Z2dpbmdBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtldmVudCBhcyBldmVudExpYn0gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge0RlYnVnZ2VyUHJveHlDbGllbnR9IGZyb20gJy4uLy4uLy4uL3JlYWN0LW5hdGl2ZS1ub2RlLWV4ZWN1dG9yL2xpYi9EZWJ1Z2dlclByb3h5Q2xpZW50JztcbmltcG9ydCBzZXJ2aWNlSHViIGZyb20gJy4uLy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGV2ZW50TGliO1xuXG4vKipcbiAqIENvbm5lY3RzIHRoZSBleGVjdXRvciB0byB0aGUgZGVidWdnZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dpbmdBY3RpdmF0aW9uIHtcblxuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9jb25uZWN0aW9uRGlzcG9zYWJsZXM6ID9JRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1yZWFjdC1uYXRpdmU6c3RhcnQtZGVidWdnaW5nJzogKCkgPT4gdGhpcy5fc3RhcnREZWJ1Z2dpbmcoKSxcbiAgICAgICAgJ251Y2xpZGUtcmVhY3QtbmF0aXZlOnN0b3AtZGVidWdnaW5nJzogKCkgPT4gdGhpcy5fc3RvcERlYnVnZ2luZygpLFxuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zdG9wRGVidWdnaW5nKCkpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0YXJ0RGVidWdnaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3BEZWJ1Z2dpbmcoKTtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGVidWdnZXJQcm94eUNsaWVudCgpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gY2xpZW50LmRpc2Nvbm5lY3QoKSksXG4gICAgICAvLyAkRmxvd0lnbm9yZTogTm90IHN1cmUgaG93IHRvIGFubm90YXRlIGNvbWJpbmVMYXRlc3RcbiAgICAgIFJ4Lk9ic2VydmFibGUuY29tYmluZUxhdGVzdChcbiAgICAgICAgb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihjbGllbnQub25EaWRFdmFsQXBwbGljYXRpb25TY3JpcHQuYmluZChjbGllbnQpKSxcbiAgICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShzZXJ2aWNlSHViLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpKSxcbiAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoW3BpZCwgZGVidWdnZXJTZXJ2aWNlXSkgPT4ge1xuICAgICAgICAgIGRlYnVnZ2VyU2VydmljZS5kZWJ1Z05vZGUocGlkKTtcbiAgICAgICAgfSksXG4gICAgKTtcbiAgICBjbGllbnQuY29ubmVjdCgpO1xuICB9XG5cbiAgX3N0b3BEZWJ1Z2dpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5lY3Rpb25EaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fY29ubmVjdGlvbkRpc3Bvc2FibGVzID0gbnVsbDtcbiAgfVxuXG59XG4iXX0=