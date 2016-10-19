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

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _reduxActions;

function _load_reduxActions() {
  return _reduxActions = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics;

function _load_reduxEpics() {
  return _reduxEpics = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers;

function _load_reduxReducers() {
  return _reduxReducers = _interopRequireDefault(require('./redux/Reducers'));
}

var _uiConsoleContainer;

function _load_uiConsoleContainer() {
  return _uiConsoleContainer = require('./ui/ConsoleContainer');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._rawState = rawState;
    this._disposables = new (_atom || _load_atom()).CompositeDisposable(atom.contextMenu.add({
      '.nuclide-console-record': [{
        label: 'Copy Message',
        command: 'nuclide-console:copy-message'
      }]
    }), atom.commands.add('.nuclide-console-record', 'nuclide-console:copy-message', function (event) {
      var el = event.target;
      if (el == null || typeof el.innerText !== 'string') {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), atom.commands.add('atom-workspace', 'nuclide-console:clear', function () {
      return _this._getStore().dispatch((_reduxActions || _load_reduxActions()).clearRecords());
    }), (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
      return _this._getStore().dispatch((_reduxActions || _load_reduxActions()).setMaxMessageCount(maxMessageCount));
    }));
  }

  _createClass(Activation, [{
    key: '_getStore',
    value: function _getStore() {
      if (this._store == null) {
        var initialState = deserializeAppState(this._rawState);
        var epics = Object.keys(_reduxEpics || _load_reduxEpics()).map(function (k) {
          return (_reduxEpics || _load_reduxEpics())[k];
        }).filter(function (epic) {
          return typeof epic === 'function';
        });
        var rootEpic = (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics));
        this._store = (0, (_redux || _load_redux()).createStore)((_reduxReducers || _load_reduxReducers()).default, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
      }
      return this._store;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-console');
      toolBar.addButton({
        icon: 'terminal',
        callback: 'nuclide-console:toggle',
        tooltip: 'Toggle Console',
        priority: 700
      });
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: 'consumeWorkspaceViewsService',
    value: function consumeWorkspaceViewsService(api) {
      var _this2 = this;

      this._disposables.add(api.registerFactory({
        id: 'nuclide-console',
        name: 'Console',
        iconName: 'terminal',
        toggleCommand: 'nuclide-console:toggle',
        defaultLocation: 'bottom-panel',
        create: function create() {
          return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_uiConsoleContainer || _load_uiConsoleContainer()).ConsoleContainer, { store: _this2._getStore() }));
        },
        isInstance: function isInstance(item) {
          return item instanceof (_uiConsoleContainer || _load_uiConsoleContainer()).ConsoleContainer;
        }
      }));
    }
  }, {
    key: 'deserializeConsoleContainer',
    value: function deserializeConsoleContainer() {
      return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_uiConsoleContainer || _load_uiConsoleContainer()).ConsoleContainer, { store: this._getStore() }));
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      // Create a local, nullable reference so that the service consumers don't keep the Activation
      // instance in memory.
      var activation = this;
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        activation = null;
      }));

      return {
        registerOutputProvider: function registerOutputProvider(outputProvider) {
          (0, (_assert || _load_assert()).default)(activation != null, 'Output service used after deactivation');
          activation._getStore().dispatch((_reduxActions || _load_reduxActions()).registerOutputProvider(outputProvider));
          return new (_atom || _load_atom()).Disposable(function () {
            if (activation != null) {
              activation._getStore().dispatch((_reduxActions || _load_reduxActions()).unregisterOutputProvider(outputProvider));
            }
          });
        }
      };
    }
  }, {
    key: 'provideRegisterExecutor',
    value: function provideRegisterExecutor() {
      // Create a local, nullable reference so that the service consumers don't keep the Activation
      // instance in memory.
      var activation = this;
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        activation = null;
      }));

      return function (executor) {
        (0, (_assert || _load_assert()).default)(activation != null, 'Executor registration attempted after deactivation');
        activation._getStore().dispatch((_reduxActions || _load_reduxActions()).registerExecutor(executor));
        return new (_atom || _load_atom()).Disposable(function () {
          if (activation != null) {
            activation._getStore().dispatch((_reduxActions || _load_reduxActions()).unregisterExecutor(executor));
          }
        });
      };
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
  return {
    executors: new Map(),
    currentExecutorId: null,
    // For performance reasons, we won't restore records until we've figured out windowing.
    records: [],
    history: [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;