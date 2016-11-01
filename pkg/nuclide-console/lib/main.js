'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireDefault(require('./redux/Reducers'));
}

var _ConsoleContainer;

function _load_ConsoleContainer() {
  return _ConsoleContainer = require('./ui/ConsoleContainer');
}

var _reactForAtom = require('react-for-atom');

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Activation = class Activation {

  constructor(rawState) {
    this._rawState = rawState;
    this._disposables = new _atom.CompositeDisposable(atom.contextMenu.add({
      '.nuclide-console-record': [{
        label: 'Copy Message',
        command: 'nuclide-console:copy-message'
      }]
    }), atom.commands.add('.nuclide-console-record', 'nuclide-console:copy-message', event => {
      const el = event.target;
      if (el == null || typeof el.innerText !== 'string') {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), atom.commands.add('atom-workspace', 'nuclide-console:clear', () => this._getStore().dispatch((_Actions || _load_Actions()).clearRecords())), (_featureConfig || _load_featureConfig()).default.observe('nuclide-console.maximumMessageCount', maxMessageCount => this._getStore().dispatch((_Actions || _load_Actions()).setMaxMessageCount(maxMessageCount))));
  }

  _getStore() {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
      const rootEpic = (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics);
      this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).default, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    }
    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton({
      icon: 'terminal',
      callback: 'nuclide-console:toggle',
      tooltip: 'Toggle Console',
      priority: 700
    });
    this._disposables.add(new _atom.Disposable(() => {
      toolBar.removeItems();
    }));
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.registerFactory({
      id: 'nuclide-console',
      name: 'Console',
      iconName: 'terminal',
      toggleCommand: 'nuclide-console:toggle',
      defaultLocation: 'bottom-panel',
      create: () => (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer, { store: this._getStore() })),
      isInstance: item => item instanceof (_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer
    }));
  }

  deserializeConsoleContainer() {
    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer, { store: this._getStore() }));
  }

  provideOutputService() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(new _atom.Disposable(() => {
      activation = null;
    }));

    return {
      registerOutputProvider: function (outputProvider) {
        if (!(activation != null)) {
          throw new Error('Output service used after deactivation');
        }

        activation._getStore().dispatch((_Actions || _load_Actions()).registerOutputProvider(outputProvider));
        return new _atom.Disposable(() => {
          if (activation != null) {
            activation._getStore().dispatch((_Actions || _load_Actions()).unregisterOutputProvider(outputProvider));
          }
        });
      }
    };
  }

  provideRegisterExecutor() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(new _atom.Disposable(() => {
      activation = null;
    }));

    return executor => {
      if (!(activation != null)) {
        throw new Error('Executor registration attempted after deactivation');
      }

      activation._getStore().dispatch((_Actions || _load_Actions()).registerExecutor(executor));
      return new _atom.Disposable(() => {
        if (activation != null) {
          activation._getStore().dispatch((_Actions || _load_Actions()).unregisterExecutor(executor));
        }
      });
    };
  }

  serialize() {
    if (this._store == null) {
      return {};
    }
    return {
      records: this._store.getState().records
    };
  }

};


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

exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];