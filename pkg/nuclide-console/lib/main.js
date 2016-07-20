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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _uiCreateConsoleGadget2;

function _uiCreateConsoleGadget() {
  return _uiCreateConsoleGadget2 = _interopRequireDefault(require('./ui/createConsoleGadget'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics2;

function _reduxEpics() {
  return _reduxEpics2 = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers2;

function _reduxReducers() {
  return _reduxReducers2 = _interopRequireDefault(require('./redux/Reducers'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._rawState = rawState;
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
      return _this._getStore().dispatch((_reduxActions2 || _reduxActions()).clearRecords());
    }), (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
      return _this._getStore().dispatch((_reduxActions2 || _reduxActions()).setMaxMessageCount(maxMessageCount));
    }));
  }

  _createClass(Activation, [{
    key: '_getStore',
    value: function _getStore() {
      if (this._store == null) {
        var initialState = deserializeAppState(this._rawState);
        var epics = Object.keys(_reduxEpics2 || _reduxEpics()).map(function (k) {
          return (_reduxEpics2 || _reduxEpics())[k];
        }).filter(function (epic) {
          return typeof epic === 'function';
        });
        var rootEpic = (0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics));
        this._store = (0, (_redux2 || _redux()).createStore)((_reduxReducers2 || _reduxReducers()).default, initialState, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
      }
      return this._store;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeGadgetsService',
    value: function consumeGadgetsService(gadgetsApi) {
      var OutputGadget = (0, (_uiCreateConsoleGadget2 || _uiCreateConsoleGadget()).default)(this._getStore());
      this._disposables.add(gadgetsApi.registerGadget(OutputGadget));
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      var _this2 = this;

      if (this._outputService == null) {
        (function () {
          // Create a local, nullable reference so that the service consumers don't keep the store
          // instance in memory.
          var store = _this2._getStore();
          _this2._disposables.add(new (_atom2 || _atom()).Disposable(function () {
            store = null;
          }));

          _this2._outputService = {
            registerOutputProvider: function registerOutputProvider(outputProvider) {
              (0, (_assert2 || _assert()).default)(store != null, 'Output service used after deactivation');
              store.dispatch((_reduxActions2 || _reduxActions()).registerOutputProvider(outputProvider));
              return new (_atom2 || _atom()).Disposable(function () {
                if (store != null) {
                  store.dispatch((_reduxActions2 || _reduxActions()).unregisterOutputProvider(outputProvider));
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
          // Create a local, nullable reference so that the service consumers don't keep the store
          // instance in memory.
          var store = _this3._getStore();
          _this3._disposables.add(new (_atom2 || _atom()).Disposable(function () {
            store = null;
          }));

          _this3._registerExecutorFunction = function (executor) {
            (0, (_assert2 || _assert()).default)(store != null, 'Executor registration attempted after deactivation');
            store.dispatch((_reduxActions2 || _reduxActions()).registerExecutor(executor));
            return new (_atom2 || _atom()).Disposable(function () {
              if (store != null) {
                store.dispatch((_reduxActions2 || _reduxActions()).unregisterExecutor(executor));
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
      if (this._store == null) {
        return {};
      }
      return {
        records: this._store.getState().records
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

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;