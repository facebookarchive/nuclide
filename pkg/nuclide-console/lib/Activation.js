var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _Commands2;

function _Commands() {
  return _Commands2 = _interopRequireDefault(require('./Commands'));
}

var _uiCreateConsoleGadget2;

function _uiCreateConsoleGadget() {
  return _uiCreateConsoleGadget2 = _interopRequireDefault(require('./ui/createConsoleGadget'));
}

var _createStateStream2;

function _createStateStream() {
  return _createStateStream2 = _interopRequireDefault(require('./createStateStream'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var action$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
    var initialState = deserializeAppState(rawState);
    this._state$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject(initialState);
    (0, (_createStateStream2 || _createStateStream()).default)(action$.asObservable(), initialState).sampleTime(100).subscribe(this._state$);
    this._commands = new (_Commands2 || _Commands()).default(action$, function () {
      return _this._state$.getValue();
    });
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(atom.contextMenu.add({
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
    }), atom.commands.add('atom-workspace', 'nuclide-console:clear', function () {
      return _this._commands.clearRecords();
    }), (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
      return _this._commands.setMaxMessageCount(maxMessageCount);
    }),

    // Action side-effects
    new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(action$.subscribe(function (action) {
      if (action.type !== (_ActionTypes2 || _ActionTypes()).EXECUTE) {
        return;
      }
      var _action$payload = action.payload;
      var executorId = _action$payload.executorId;
      var code = _action$payload.code;

      var executors = _this._state$.getValue().executors;
      var executor = executors.get(executorId);
      (0, (_assert2 || _assert()).default)(executor);
      executor.send(code);
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
      var OutputGadget = (0, (_uiCreateConsoleGadget2 || _uiCreateConsoleGadget()).default)(this._state$.asObservable(), this._commands);
      this._disposables.add(gadgetsApi.registerGadget(OutputGadget));
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      var _this2 = this;

      if (this._outputService == null) {
        (function () {
          // Create a local, nullable reference so that the service consumers don't keep the `Commands`
          // instance in memory.
          var commands = _this2._commands;
          _this2._disposables.add(new (_atom2 || _atom()).Disposable(function () {
            commands = null;
          }));

          _this2._outputService = {
            registerOutputProvider: function registerOutputProvider(outputProvider) {
              if (commands != null) {
                commands.registerOutputProvider(outputProvider);
              }
              return new (_atom2 || _atom()).Disposable(function () {
                if (commands != null) {
                  commands.removeSource(outputProvider.id);
                }
              });
            }
          };
        })();
      }
      return this._outputService;
    }
  }, {
    key: 'provideRegisterExecutor',
    value: function provideRegisterExecutor() {
      var _this3 = this;

      if (this._registerExecutorFunction == null) {
        (function () {
          // Create a local, nullable reference so that the service consumers don't keep the `Commands`
          // instance in memory.
          var commands = _this3._commands;
          _this3._disposables.add(new (_atom2 || _atom()).Disposable(function () {
            commands = null;
          }));

          _this3._registerExecutorFunction = function (executor) {
            if (commands != null) {
              commands.registerExecutor(executor);
            }
            return new (_atom2 || _atom()).Disposable(function () {
              if (commands != null) {
                commands.unregisterExecutor(executor);
              }
            });
          };
        })();
      }
      return this._registerExecutorFunction;
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
    providerStatuses: new Map(),
    providerSubscriptions: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

module.exports = Activation;