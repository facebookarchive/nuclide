var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _Commands = require('./Commands');

var _Commands2 = _interopRequireDefault(_Commands);

var _createConsoleGadget = require('./createConsoleGadget');

var _createConsoleGadget2 = _interopRequireDefault(_createConsoleGadget);

var _createStateStream = require('./createStateStream');

var _createStateStream2 = _interopRequireDefault(_createStateStream);

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _OutputService = require('./OutputService');

var _OutputService2 = _interopRequireDefault(_OutputService);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var action$ = new _rx2['default'].Subject();
    this._state$ = (0, _createStateStream2['default'])(action$.asObservable(), deserializeAppState(rawState));
    this._commands = new _Commands2['default'](action$.asObserver(), function () {
      return _this._state$.getValue();
    });
    this._outputService = new _OutputService2['default'](this._commands);
    this._disposables = new _atom.CompositeDisposable(atom.contextMenu.add({
      '.nuclide-console-record': [{
        label: 'Copy Message',
        command: 'nuclide-console:copy-message'
      }]
    }), atom.commands.add('.nuclide-console-record', 'nuclide-console:copy-message', function (event) {
      var el = event.target;
      if (el == null || el.innerText == null) {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), _nuclideFeatureConfig2['default'].observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
      return _this._commands.setMaxMessageCount(maxMessageCount);
    }),

    // Action side-effects
    action$.subscribe(function (action) {
      if (action.type !== ActionTypes.EXECUTE) {
        return;
      }
      var _action$payload = action.payload;
      var executorId = _action$payload.executorId;
      var code = _action$payload.code;

      var executors = _this._state$.getValue().executors;
      var executor = executors.get(executorId);
      (0, _assert2['default'])(executor);
      executor.execute(code);
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeGadgetsService',
    value: function consumeGadgetsService(gadgetsApi) {
      var OutputGadget = (0, _createConsoleGadget2['default'])(this._state$.asObservable(), this._commands);
      return gadgetsApi.registerGadget(OutputGadget);
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      return this._outputService;
    }
  }, {
    key: 'provideRegisterExecutor',
    value: function provideRegisterExecutor() {
      var _this2 = this;

      return function (executor) {
        _this2._commands.registerExecutor(executor);
        return new _atom.Disposable(function () {
          _this2._commands.unregisterExecutor(executor);
        });
      };
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var state = this._state$.getValue();
      return {
        records: state.records
      };
    }
  }]);

  return Activation;
})();

function deserializeAppState(rawState) {
  rawState = rawState || {};
  return {
    executors: new Map(),
    currentExecutorId: null,
    records: rawState.records || [],
    providers: new Map(),
    providerSubscriptions: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,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QSxRQUFRLEVBQUk7QUFDakIsZUFBSyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsZUFBTyxxQkFBZSxZQUFNO0FBQzFCLGlCQUFLLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM3QyxDQUFDLENBQUM7T0FDSixDQUFDO0tBQ0g7OztXQUVRLHFCQUFXO0FBQ2xCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdEMsYUFBTztBQUNMLGVBQU8sRUFBRSxLQUFLLENBQUMsT0FBTztPQUN2QixDQUFDO0tBQ0g7OztTQW5GRyxVQUFVOzs7QUF1RmhCLFNBQVMsbUJBQW1CLENBQUMsUUFBaUIsRUFBWTtBQUN4RCxVQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztBQUMxQixTQUFPO0FBQ0wsYUFBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLHFCQUFpQixFQUFFLElBQUk7QUFDdkIsV0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRTtBQUMvQixhQUFTLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDcEIseUJBQXFCLEVBQUUsSUFBSSxHQUFHLEVBQUU7Ozs7QUFJaEMsbUJBQWUsRUFBRSxNQUFNLENBQUMsaUJBQWlCO0dBQzFDLENBQUM7Q0FDSDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldHNTZXJ2aWNlLCBHYWRnZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtBcHBTdGF0ZSwgUmVnaXN0ZXJFeGVjdXRvckZ1bmN0aW9ufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCAqIGFzIEFjdGlvblR5cGVzIGZyb20gJy4vQWN0aW9uVHlwZXMnO1xuaW1wb3J0IENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IGNyZWF0ZUNvbnNvbGVHYWRnZXQgZnJvbSAnLi9jcmVhdGVDb25zb2xlR2FkZ2V0JztcbmltcG9ydCBjcmVhdGVTdGF0ZVN0cmVhbSBmcm9tICcuL2NyZWF0ZVN0YXRlU3RyZWFtJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IE91dHB1dFNlcnZpY2UgZnJvbSAnLi9PdXRwdXRTZXJ2aWNlJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfY29tbWFuZHM6IENvbW1hbmRzO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9vdXRwdXRTZXJ2aWNlOiBPdXRwdXRTZXJ2aWNlO1xuICBfc3RhdGUkOiBSeC5CZWhhdmlvclN1YmplY3Q8QXBwU3RhdGU+O1xuXG4gIGNvbnN0cnVjdG9yKHJhd1N0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3QgYWN0aW9uJCA9IG5ldyBSeC5TdWJqZWN0KCk7XG4gICAgdGhpcy5fc3RhdGUkID0gY3JlYXRlU3RhdGVTdHJlYW0oXG4gICAgICBhY3Rpb24kLmFzT2JzZXJ2YWJsZSgpLFxuICAgICAgZGVzZXJpYWxpemVBcHBTdGF0ZShyYXdTdGF0ZSksXG4gICAgKTtcbiAgICB0aGlzLl9jb21tYW5kcyA9IG5ldyBDb21tYW5kcyhcbiAgICAgIGFjdGlvbiQuYXNPYnNlcnZlcigpLFxuICAgICAgKCkgPT4gdGhpcy5fc3RhdGUkLmdldFZhbHVlKCksXG4gICAgKTtcbiAgICB0aGlzLl9vdXRwdXRTZXJ2aWNlID0gbmV3IE91dHB1dFNlcnZpY2UodGhpcy5fY29tbWFuZHMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAgICcubnVjbGlkZS1jb25zb2xlLXJlY29yZCc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0NvcHkgTWVzc2FnZScsXG4gICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1jb25zb2xlOmNvcHktbWVzc2FnZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcubnVjbGlkZS1jb25zb2xlLXJlY29yZCcsXG4gICAgICAgICdudWNsaWRlLWNvbnNvbGU6Y29weS1tZXNzYWdlJyxcbiAgICAgICAgZXZlbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IGVsID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgIGlmIChlbCA9PSBudWxsIHx8IGVsLmlubmVyVGV4dCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGVsLmlubmVyVGV4dCk7XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbnVjbGlkZS1jb25zb2xlLm1heGltdW1NZXNzYWdlQ291bnQnLFxuICAgICAgICBtYXhNZXNzYWdlQ291bnQgPT4gdGhpcy5fY29tbWFuZHMuc2V0TWF4TWVzc2FnZUNvdW50KG1heE1lc3NhZ2VDb3VudCksXG4gICAgICApLFxuXG4gICAgICAvLyBBY3Rpb24gc2lkZS1lZmZlY3RzXG4gICAgICBhY3Rpb24kLnN1YnNjcmliZShhY3Rpb24gPT4ge1xuICAgICAgICBpZiAoYWN0aW9uLnR5cGUgIT09IEFjdGlvblR5cGVzLkVYRUNVVEUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge2V4ZWN1dG9ySWQsIGNvZGV9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICAgIGNvbnN0IGV4ZWN1dG9ycyA9IHRoaXMuX3N0YXRlJC5nZXRWYWx1ZSgpLmV4ZWN1dG9ycztcbiAgICAgICAgY29uc3QgZXhlY3V0b3IgPSBleGVjdXRvcnMuZ2V0KGV4ZWN1dG9ySWQpO1xuICAgICAgICBpbnZhcmlhbnQoZXhlY3V0b3IpO1xuICAgICAgICBleGVjdXRvci5leGVjdXRlKGNvZGUpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29uc3VtZUdhZGdldHNTZXJ2aWNlKGdhZGdldHNBcGk6IEdhZGdldHNTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IE91dHB1dEdhZGdldCA9IGNyZWF0ZUNvbnNvbGVHYWRnZXQodGhpcy5fc3RhdGUkLmFzT2JzZXJ2YWJsZSgpLCB0aGlzLl9jb21tYW5kcyk7XG4gICAgcmV0dXJuIGdhZGdldHNBcGkucmVnaXN0ZXJHYWRnZXQoKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCkpO1xuICB9XG5cbiAgcHJvdmlkZU91dHB1dFNlcnZpY2UoKTogT3V0cHV0U2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX291dHB1dFNlcnZpY2U7XG4gIH1cblxuICBwcm92aWRlUmVnaXN0ZXJFeGVjdXRvcigpOiBSZWdpc3RlckV4ZWN1dG9yRnVuY3Rpb24ge1xuICAgIHJldHVybiBleGVjdXRvciA9PiB7XG4gICAgICB0aGlzLl9jb21tYW5kcy5yZWdpc3RlckV4ZWN1dG9yKGV4ZWN1dG9yKTtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbW1hbmRzLnVucmVnaXN0ZXJFeGVjdXRvcihleGVjdXRvcik7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVjb3Jkczogc3RhdGUucmVjb3JkcyxcbiAgICB9O1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVBcHBTdGF0ZShyYXdTdGF0ZTogP09iamVjdCk6IEFwcFN0YXRlIHtcbiAgcmF3U3RhdGUgPSByYXdTdGF0ZSB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICBleGVjdXRvcnM6IG5ldyBNYXAoKSxcbiAgICBjdXJyZW50RXhlY3V0b3JJZDogbnVsbCxcbiAgICByZWNvcmRzOiByYXdTdGF0ZS5yZWNvcmRzIHx8IFtdLFxuICAgIHByb3ZpZGVyczogbmV3IE1hcCgpLFxuICAgIHByb3ZpZGVyU3Vic2NyaXB0aW9uczogbmV3IE1hcCgpLFxuXG4gICAgLy8gVGhpcyB2YWx1ZSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIHZhbHVlIGZvcm0gdGhlIGNvbmZpZy4gV2UganVzdCB1c2UgYFBPU0lUSVZFX0lORklOSVRZYFxuICAgIC8vIGhlcmUgdG8gY29uZm9ybSB0byB0aGUgQXBwU3RhdGUgdHlwZSBkZWZpbnRpb24uXG4gICAgbWF4TWVzc2FnZUNvdW50OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==