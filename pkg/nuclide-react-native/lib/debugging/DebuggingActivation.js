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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
      if (_this._startDebuggingSubscription != null) {
        _this._startDebuggingSubscription.unsubscribe();
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
      if (this._startDebuggingSubscription != null) {
        this._startDebuggingSubscription.unsubscribe();
      }

      // Stop any current debugger and show the debugger view.
      var workspace = atom.views.getView(atom.workspace);
      atom.commands.dispatch(workspace, 'nuclide-debugger:stop-debugging');
      atom.commands.dispatch(workspace, 'nuclide-debugger:show');

      var debuggerServiceStream = _reactivexRxjs2['default'].Observable.fromPromise(_nuclideServiceHubPlus2['default'].consumeFirstProvider('nuclide-debugger.remote'));
      var processInfoLists = _reactivexRxjs2['default'].Observable.fromPromise(getProcessInfoList());
      this._startDebuggingSubscription = debuggerServiceStream.combineLatest(processInfoLists).subscribe(function (_ref) {
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
//# sourceMappingURL=data:application/json;base64,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KiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20vbGliL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuXG5pbXBvcnQgc2VydmljZUh1YlBsdXMgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJztcbmltcG9ydCB7UmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuL1JlYWN0TmF0aXZlRGVidWdnZXJJbnN0YW5jZSc7XG5pbXBvcnQge1JlYWN0TmF0aXZlUHJvY2Vzc0luZm99IGZyb20gJy4vUmVhY3ROYXRpdmVQcm9jZXNzSW5mbyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbi8qKlxuICogQ29ubmVjdHMgdGhlIGV4ZWN1dG9yIHRvIHRoZSBkZWJ1Z2dlci5cbiAqL1xuZXhwb3J0IGNsYXNzIERlYnVnZ2luZ0FjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IElEaXNwb3NhYmxlO1xuICBfc3RhcnREZWJ1Z2dpbmdTdWJzY3JpcHRpb246ID9yeCRJU3Vic2NyaXB0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLXJlYWN0LW5hdGl2ZTpzdGFydC1kZWJ1Z2dpbmcnOiAoKSA9PiB0aGlzLl9zdGFydERlYnVnZ2luZygpLFxuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9zdGFydERlYnVnZ2luZ1N1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fc3RhcnREZWJ1Z2dpbmdTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3N0YXJ0RGVidWdnaW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGFydERlYnVnZ2luZ1N1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zdGFydERlYnVnZ2luZ1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIC8vIFN0b3AgYW55IGN1cnJlbnQgZGVidWdnZXIgYW5kIHNob3cgdGhlIGRlYnVnZ2VyIHZpZXcuXG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZSwgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZSwgJ251Y2xpZGUtZGVidWdnZXI6c2hvdycpO1xuXG4gICAgY29uc3QgZGVidWdnZXJTZXJ2aWNlU3RyZWFtID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShcbiAgICAgIHNlcnZpY2VIdWJQbHVzLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpXG4gICAgKTtcbiAgICBjb25zdCBwcm9jZXNzSW5mb0xpc3RzID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShnZXRQcm9jZXNzSW5mb0xpc3QoKSk7XG4gICAgdGhpcy5fc3RhcnREZWJ1Z2dpbmdTdWJzY3JpcHRpb24gPSBkZWJ1Z2dlclNlcnZpY2VTdHJlYW0uY29tYmluZUxhdGVzdChwcm9jZXNzSW5mb0xpc3RzKVxuICAgICAgLnN1YnNjcmliZSgoW2RlYnVnZ2VyU2VydmljZSwgcHJvY2Vzc0luZm9MaXN0XSkgPT4ge1xuICAgICAgICBjb25zdCBwcm9jZXNzSW5mbyA9IHByb2Nlc3NJbmZvTGlzdFswXTtcbiAgICAgICAgaWYgKHByb2Nlc3NJbmZvICE9IG51bGwpIHtcbiAgICAgICAgICBkZWJ1Z2dlclNlcnZpY2Uuc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm8pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHByb3ZpZGVOdWNsaWRlRGVidWdnZXIoKTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ1JlYWN0IE5hdGl2ZScsXG4gICAgICBnZXRQcm9jZXNzSW5mb0xpc3QsXG4gICAgICBSZWFjdE5hdGl2ZURlYnVnZ2VySW5zdGFuY2UsXG4gICAgfTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBVc2UgcHJvamVjdCByb290IGluc3RlYWQgb2YgZmlyc3QgZGlyZWN0b3J5LlxuICBjb25zdCBjdXJyZW50UHJvamVjdERpciA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdO1xuXG4gIC8vIFRPRE86IENoZWNrIGlmIGl0J3MgYW4gUk4gYXBwP1xuICAvLyBUT0RPOiBRdWVyeSBwYWNrYWdlciBmb3IgcnVubmluZyBSTiBhcHA/XG5cbiAgaWYgKGN1cnJlbnRQcm9qZWN0RGlyID09IG51bGwpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldFVyaSA9IGN1cnJlbnRQcm9qZWN0RGlyLmdldFBhdGgoKTtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbbmV3IFJlYWN0TmF0aXZlUHJvY2Vzc0luZm8odGFyZ2V0VXJpKV0pO1xufVxuIl19