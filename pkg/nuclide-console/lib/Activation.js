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

var _nuclideCommons = require('../../nuclide-commons');

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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var action$ = new _reactivexRxjs2['default'].Subject();
    var initialState = deserializeAppState(rawState);
    this._state$ = new _reactivexRxjs2['default'].BehaviorSubject(initialState);
    (0, _createStateStream2['default'])(action$.asObservable(), initialState).sampleTime(100).subscribe(this._state$);
    this._commands = new _Commands2['default'](action$, function () {
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
    new _nuclideCommons.DisposableSubscription(action$.subscribe(function (action) {
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
    })));
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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUM7QUFDdEYsYUFBTyxVQUFVLENBQUMsY0FBYyxDQUFHLFlBQVksQ0FBZ0IsQ0FBQztLQUNqRTs7O1dBRW1CLGdDQUFrQjtBQUNwQyxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDNUI7OztXQUVzQixtQ0FBNkI7OztBQUNsRCxhQUFPLFVBQUEsUUFBUSxFQUFJO0FBQ2pCLGVBQUssU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLGVBQU8scUJBQWUsWUFBTTtBQUMxQixpQkFBSyxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0MsQ0FBQyxDQUFDO09BQ0osQ0FBQztLQUNIOzs7V0FFUSxxQkFBVztBQUNsQixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3RDLGFBQU87QUFDTCxlQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87T0FDdkIsQ0FBQztLQUNIOzs7U0F6RkcsVUFBVTs7O0FBNkZoQixTQUFTLG1CQUFtQixDQUFDLFFBQWlCLEVBQVk7QUFDeEQsVUFBUSxHQUFHLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDMUIsU0FBTztBQUNMLGFBQVMsRUFBRSxJQUFJLEdBQUcsRUFBRTtBQUNwQixxQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLFdBQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxJQUFJLEVBQUU7QUFDL0IsYUFBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLHlCQUFxQixFQUFFLElBQUksR0FBRyxFQUFFOzs7O0FBSWhDLG1CQUFlLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtHQUMxQyxDQUFDO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXRzU2VydmljZSwgR2FkZ2V0fSBmcm9tICcuLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIFJlZ2lzdGVyRXhlY3V0b3JGdW5jdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7RGlzcG9zYWJsZVN1YnNjcmlwdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCBjcmVhdGVDb25zb2xlR2FkZ2V0IGZyb20gJy4vY3JlYXRlQ29uc29sZUdhZGdldCc7XG5pbXBvcnQgY3JlYXRlU3RhdGVTdHJlYW0gZnJvbSAnLi9jcmVhdGVTdGF0ZVN0cmVhbSc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcbmltcG9ydCBPdXRwdXRTZXJ2aWNlIGZyb20gJy4vT3V0cHV0U2VydmljZSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9jb21tYW5kczogQ29tbWFuZHM7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX291dHB1dFNlcnZpY2U6IE91dHB1dFNlcnZpY2U7XG4gIF9zdGF0ZSQ6IFJ4LkJlaGF2aW9yU3ViamVjdDxBcHBTdGF0ZT47XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBhY3Rpb24kID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSBkZXNlcmlhbGl6ZUFwcFN0YXRlKHJhd1N0YXRlKTtcbiAgICB0aGlzLl9zdGF0ZSQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSk7XG4gICAgY3JlYXRlU3RhdGVTdHJlYW0oXG4gICAgICBhY3Rpb24kLmFzT2JzZXJ2YWJsZSgpLFxuICAgICAgaW5pdGlhbFN0YXRlLFxuICAgIClcbiAgICAgIC5zYW1wbGVUaW1lKDEwMClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fc3RhdGUkKTtcbiAgICB0aGlzLl9jb21tYW5kcyA9IG5ldyBDb21tYW5kcyhcbiAgICAgIGFjdGlvbiQsXG4gICAgICAoKSA9PiB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKSxcbiAgICApO1xuICAgIHRoaXMuX291dHB1dFNlcnZpY2UgPSBuZXcgT3V0cHV0U2VydmljZSh0aGlzLl9jb21tYW5kcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICAgJy5udWNsaWRlLWNvbnNvbGUtcmVjb3JkJzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnQ29weSBNZXNzYWdlJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWNvbnNvbGU6Y29weS1tZXNzYWdlJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJy5udWNsaWRlLWNvbnNvbGUtcmVjb3JkJyxcbiAgICAgICAgJ251Y2xpZGUtY29uc29sZTpjb3B5LW1lc3NhZ2UnLFxuICAgICAgICBldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgZWwgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgaWYgKGVsID09IG51bGwgfHwgZWwuaW5uZXJUZXh0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoZWwuaW5uZXJUZXh0KTtcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgICBmZWF0dXJlQ29uZmlnLm9ic2VydmUoXG4gICAgICAgICdudWNsaWRlLWNvbnNvbGUubWF4aW11bU1lc3NhZ2VDb3VudCcsXG4gICAgICAgIG1heE1lc3NhZ2VDb3VudCA9PiB0aGlzLl9jb21tYW5kcy5zZXRNYXhNZXNzYWdlQ291bnQobWF4TWVzc2FnZUNvdW50KSxcbiAgICAgICksXG5cbiAgICAgIC8vIEFjdGlvbiBzaWRlLWVmZmVjdHNcbiAgICAgIG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKFxuICAgICAgICBhY3Rpb24kLnN1YnNjcmliZShhY3Rpb24gPT4ge1xuICAgICAgICAgIGlmIChhY3Rpb24udHlwZSAhPT0gQWN0aW9uVHlwZXMuRVhFQ1VURSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB7ZXhlY3V0b3JJZCwgY29kZX0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgICAgICBjb25zdCBleGVjdXRvcnMgPSB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKS5leGVjdXRvcnM7XG4gICAgICAgICAgY29uc3QgZXhlY3V0b3IgPSBleGVjdXRvcnMuZ2V0KGV4ZWN1dG9ySWQpO1xuICAgICAgICAgIGludmFyaWFudChleGVjdXRvcik7XG4gICAgICAgICAgZXhlY3V0b3IuZXhlY3V0ZShjb2RlKTtcbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29uc3VtZUdhZGdldHNTZXJ2aWNlKGdhZGdldHNBcGk6IEdhZGdldHNTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IE91dHB1dEdhZGdldCA9IGNyZWF0ZUNvbnNvbGVHYWRnZXQodGhpcy5fc3RhdGUkLmFzT2JzZXJ2YWJsZSgpLCB0aGlzLl9jb21tYW5kcyk7XG4gICAgcmV0dXJuIGdhZGdldHNBcGkucmVnaXN0ZXJHYWRnZXQoKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCkpO1xuICB9XG5cbiAgcHJvdmlkZU91dHB1dFNlcnZpY2UoKTogT3V0cHV0U2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX291dHB1dFNlcnZpY2U7XG4gIH1cblxuICBwcm92aWRlUmVnaXN0ZXJFeGVjdXRvcigpOiBSZWdpc3RlckV4ZWN1dG9yRnVuY3Rpb24ge1xuICAgIHJldHVybiBleGVjdXRvciA9PiB7XG4gICAgICB0aGlzLl9jb21tYW5kcy5yZWdpc3RlckV4ZWN1dG9yKGV4ZWN1dG9yKTtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NvbW1hbmRzLnVucmVnaXN0ZXJFeGVjdXRvcihleGVjdXRvcik7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9zdGF0ZSQuZ2V0VmFsdWUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVjb3Jkczogc3RhdGUucmVjb3JkcyxcbiAgICB9O1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVBcHBTdGF0ZShyYXdTdGF0ZTogP09iamVjdCk6IEFwcFN0YXRlIHtcbiAgcmF3U3RhdGUgPSByYXdTdGF0ZSB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICBleGVjdXRvcnM6IG5ldyBNYXAoKSxcbiAgICBjdXJyZW50RXhlY3V0b3JJZDogbnVsbCxcbiAgICByZWNvcmRzOiByYXdTdGF0ZS5yZWNvcmRzIHx8IFtdLFxuICAgIHByb3ZpZGVyczogbmV3IE1hcCgpLFxuICAgIHByb3ZpZGVyU3Vic2NyaXB0aW9uczogbmV3IE1hcCgpLFxuXG4gICAgLy8gVGhpcyB2YWx1ZSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIHZhbHVlIGZvcm0gdGhlIGNvbmZpZy4gV2UganVzdCB1c2UgYFBPU0lUSVZFX0lORklOSVRZYFxuICAgIC8vIGhlcmUgdG8gY29uZm9ybSB0byB0aGUgQXBwU3RhdGUgdHlwZSBkZWZpbnRpb24uXG4gICAgbWF4TWVzc2FnZUNvdW50OiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==