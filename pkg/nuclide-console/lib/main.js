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

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../commons-atom/viewableFromReactElement');
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
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

var _uiConsoleContainer2;

function _uiConsoleContainer() {
  return _uiConsoleContainer2 = require('./ui/ConsoleContainer');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
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
      if (el == null || typeof el.innerText !== 'string') {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), atom.commands.add('atom-workspace', 'nuclide-console:clear', function () {
      return _this._getStore().dispatch((_reduxActions2 || _reduxActions()).clearRecords());
    }), (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
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
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-console');
      toolBar.addButton({
        icon: 'terminal',
        callback: 'nuclide-console:toggle',
        tooltip: 'Toggle Console',
        // Chosen to appear beneath the task runner button, given the priorities that are currently
        // used. /:
        priority: 499.75
      });
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
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
          return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_uiConsoleContainer2 || _uiConsoleContainer()).ConsoleContainer, { store: _this2._getStore() }));
        },
        isInstance: function isInstance(item) {
          return item instanceof (_uiConsoleContainer2 || _uiConsoleContainer()).ConsoleContainer;
        }
      }));
    }
  }, {
    key: 'deserializeConsoleContainer',
    value: function deserializeConsoleContainer() {
      return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_uiConsoleContainer2 || _uiConsoleContainer()).ConsoleContainer, { store: this._getStore() }));
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      // Create a local, nullable reference so that the service consumers don't keep the Activation
      // instance in memory.
      var activation = this;
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        activation = null;
      }));

      return {
        registerOutputProvider: function registerOutputProvider(outputProvider) {
          (0, (_assert2 || _assert()).default)(activation != null, 'Output service used after deactivation');
          activation._getStore().dispatch((_reduxActions2 || _reduxActions()).registerOutputProvider(outputProvider));
          return new (_atom2 || _atom()).Disposable(function () {
            if (activation != null) {
              activation._getStore().dispatch((_reduxActions2 || _reduxActions()).unregisterOutputProvider(outputProvider));
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
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        activation = null;
      }));

      return function (executor) {
        (0, (_assert2 || _assert()).default)(activation != null, 'Executor registration attempted after deactivation');
        activation._getStore().dispatch((_reduxActions2 || _reduxActions()).registerExecutor(executor));
        return new (_atom2 || _atom()).Disposable(function () {
          if (activation != null) {
            activation._getStore().dispatch((_reduxActions2 || _reduxActions()).unregisterExecutor(executor));
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
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;