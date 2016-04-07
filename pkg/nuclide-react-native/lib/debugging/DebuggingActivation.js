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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideServiceHubPlus = require('../../../nuclide-service-hub-plus');

var _nuclideServiceHubPlus2 = _interopRequireDefault(_nuclideServiceHubPlus);

var _ReactNativeDebuggerInstance = require('./ReactNativeDebuggerInstance');

var _ReactNativeProcessInfo = require('./ReactNativeProcessInfo');

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

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
      }
    }), new _atom.Disposable(function () {
      if (_this._startDebuggingDisposable != null) {
        _this._startDebuggingDisposable.dispose();
      }
    }));
  }

  _createClass(DebuggingActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_startDebugging',
    value: function _startDebugging() {
      if (this._startDebuggingDisposable != null) {
        this._startDebuggingDisposable.dispose();
      }

      // Stop any current debugger and show the debugger view.
      var workspace = atom.views.getView(atom.workspace);
      atom.commands.dispatch(workspace, 'nuclide-debugger:stop-debugging');
      atom.commands.dispatch(workspace, 'nuclide-debugger:show');

      var debuggerServiceStream = _rx2['default'].Observable.fromPromise(_nuclideServiceHubPlus2['default'].consumeFirstProvider('nuclide-debugger.remote'));
      var processInfoLists = _rx2['default'].Observable.fromPromise(getProcessInfoList());
      this._startDebuggingDisposable = debuggerServiceStream.combineLatest(processInfoLists).subscribe(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var debuggerService = _ref2[0];
        var processInfoList = _ref2[1];

        var processInfo = processInfoList[0];
        if (processInfo != null) {
          debuggerService.startDebugging(processInfo);
        }
      });
    }
  }, {
    key: 'provideNuclideDebugger',
    value: function provideNuclideDebugger() {
      return {
        name: 'React Native',
        getProcessInfoList: getProcessInfoList,
        ReactNativeDebuggerInstance: _ReactNativeDebuggerInstance.ReactNativeDebuggerInstance
      };
    }
  }]);

  return DebuggingActivation;
})();

exports.DebuggingActivation = DebuggingActivation;

function getProcessInfoList() {
  // TODO(matthewwithanm): Use project root instead of first directory.
  var currentProjectDir = atom.project.getDirectories()[0];

  // TODO: Check if it's an RN app?
  // TODO: Query packager for running RN app?

  if (currentProjectDir == null) {
    return Promise.resolve([]);
  }

  var targetUri = currentProjectDir.getPath();
  return Promise.resolve([new _ReactNativeProcessInfo.ReactNativeProcessInfo(targetUri)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2luZ0FjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBYzJCLG1DQUFtQzs7OzsyQ0FDcEIsK0JBQStCOztzQ0FDcEMsMEJBQTBCOztvQkFDakIsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7Ozs7O0lBS04sbUJBQW1CO0FBSW5CLFdBSkEsbUJBQW1CLEdBSWhCOzs7MEJBSkgsbUJBQW1COztBQUs1QixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyw0Q0FBc0MsRUFBRTtlQUFNLE1BQUssZUFBZSxFQUFFO09BQUE7S0FDckUsQ0FBQyxFQUNGLHFCQUFlLFlBQU07QUFDbkIsVUFBSSxNQUFLLHlCQUF5QixJQUFJLElBQUksRUFBRTtBQUMxQyxjQUFLLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzFDO0tBQ0YsQ0FBQyxDQUNILENBQUM7R0FDSDs7ZUFmVSxtQkFBbUI7O1dBaUJ2QixtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksSUFBSSxDQUFDLHlCQUF5QixJQUFJLElBQUksRUFBRTtBQUMxQyxZQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDMUM7OztBQUdELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztBQUNyRSxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7QUFFM0QsVUFBTSxxQkFBcUIsR0FBRyxnQkFBRyxVQUFVLENBQUMsV0FBVyxDQUNyRCxtQ0FBZSxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUMvRCxDQUFDO0FBQ0YsVUFBTSxnQkFBZ0IsR0FBRyxnQkFBRyxVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztBQUN6RSxVQUFJLENBQUMseUJBQXlCLEdBQUcscUJBQXFCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQ25GLFNBQVMsQ0FBQyxVQUFDLElBQWtDLEVBQUs7bUNBQXZDLElBQWtDOztZQUFqQyxlQUFlO1lBQUUsZUFBZTs7QUFDM0MsWUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2Qix5QkFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM3QztPQUNGLENBQUMsQ0FBQztLQUNOOzs7V0FFcUIsa0NBQTZCO0FBQ2pELGFBQU87QUFDTCxZQUFJLEVBQUUsY0FBYztBQUNwQiwwQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLG1DQUEyQiwwREFBQTtPQUM1QixDQUFDO0tBQ0g7OztTQWxEVSxtQkFBbUI7Ozs7O0FBc0RoQyxTQUFTLGtCQUFrQixHQUF3Qzs7QUFFakUsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztBQUszRCxNQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtBQUM3QixXQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDNUI7O0FBRUQsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUMsU0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsbURBQTJCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqRSIsImZpbGUiOiJEZWJ1Z2dpbmdBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20vbGliL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuXG5pbXBvcnQgc2VydmljZUh1YlBsdXMgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJztcbmltcG9ydCB7UmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuL1JlYWN0TmF0aXZlRGVidWdnZXJJbnN0YW5jZSc7XG5pbXBvcnQge1JlYWN0TmF0aXZlUHJvY2Vzc0luZm99IGZyb20gJy4vUmVhY3ROYXRpdmVQcm9jZXNzSW5mbyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuLyoqXG4gKiBDb25uZWN0cyB0aGUgZXhlY3V0b3IgdG8gdGhlIGRlYnVnZ2VyLlxuICovXG5leHBvcnQgY2xhc3MgRGVidWdnaW5nQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogSURpc3Bvc2FibGU7XG4gIF9zdGFydERlYnVnZ2luZ0Rpc3Bvc2FibGU6ID9JRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1yZWFjdC1uYXRpdmU6c3RhcnQtZGVidWdnaW5nJzogKCkgPT4gdGhpcy5fc3RhcnREZWJ1Z2dpbmcoKSxcbiAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fc3RhcnREZWJ1Z2dpbmdEaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9zdGFydERlYnVnZ2luZ0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfc3RhcnREZWJ1Z2dpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0RGVidWdnaW5nRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zdGFydERlYnVnZ2luZ0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIC8vIFN0b3AgYW55IGN1cnJlbnQgZGVidWdnZXIgYW5kIHNob3cgdGhlIGRlYnVnZ2VyIHZpZXcuXG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZSwgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZSwgJ251Y2xpZGUtZGVidWdnZXI6c2hvdycpO1xuXG4gICAgY29uc3QgZGVidWdnZXJTZXJ2aWNlU3RyZWFtID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShcbiAgICAgIHNlcnZpY2VIdWJQbHVzLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpXG4gICAgKTtcbiAgICBjb25zdCBwcm9jZXNzSW5mb0xpc3RzID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShnZXRQcm9jZXNzSW5mb0xpc3QoKSk7XG4gICAgdGhpcy5fc3RhcnREZWJ1Z2dpbmdEaXNwb3NhYmxlID0gZGVidWdnZXJTZXJ2aWNlU3RyZWFtLmNvbWJpbmVMYXRlc3QocHJvY2Vzc0luZm9MaXN0cylcbiAgICAgIC5zdWJzY3JpYmUoKFtkZWJ1Z2dlclNlcnZpY2UsIHByb2Nlc3NJbmZvTGlzdF0pID0+IHtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0luZm8gPSBwcm9jZXNzSW5mb0xpc3RbMF07XG4gICAgICAgIGlmIChwcm9jZXNzSW5mbyAhPSBudWxsKSB7XG4gICAgICAgICAgZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBwcm92aWRlTnVjbGlkZURlYnVnZ2VyKCk6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdSZWFjdCBOYXRpdmUnLFxuICAgICAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxuICAgICAgUmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlLFxuICAgIH07XG4gIH1cblxufVxuXG5mdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPj4ge1xuICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogVXNlIHByb2plY3Qgcm9vdCBpbnN0ZWFkIG9mIGZpcnN0IGRpcmVjdG9yeS5cbiAgY29uc3QgY3VycmVudFByb2plY3REaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXTtcblxuICAvLyBUT0RPOiBDaGVjayBpZiBpdCdzIGFuIFJOIGFwcD9cbiAgLy8gVE9ETzogUXVlcnkgcGFja2FnZXIgZm9yIHJ1bm5pbmcgUk4gYXBwP1xuXG4gIGlmIChjdXJyZW50UHJvamVjdERpciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gIH1cblxuICBjb25zdCB0YXJnZXRVcmkgPSBjdXJyZW50UHJvamVjdERpci5nZXRQYXRoKCk7XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoW25ldyBSZWFjdE5hdGl2ZVByb2Nlc3NJbmZvKHRhcmdldFVyaSldKTtcbn1cbiJdfQ==