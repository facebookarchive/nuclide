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

var _syncAtomCommands;

function _load_syncAtomCommands() {
  return _syncAtomCommands = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _AppSerialization;

function _load_AppSerialization() {
  return _AppSerialization = _interopRequireWildcard(require('./AppSerialization'));
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
  return _Reducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _atom = require('atom');

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Activation = class Activation {

  constructor(rawState) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._rawState = rawState;
  }

  dispose() {
    this._disposables.dispose();
  }

  _getStore() {
    if (this._store == null) {
      var _createPackageStore = createPackageStore(this._rawState || {});

      const store = _createPackageStore.store,
            disposables = _createPackageStore.disposables;

      this._rawState = null;
      this._store = store;
      this._disposables.add(disposables);
    }
    return this._store;
  }

  serialize() {
    return (_AppSerialization || _load_AppSerialization()).serialize(this._store.getState());
  }

  provideWorkspaceViewsService() {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(() => {
      pkg = null;
    });

    return {
      registerFactory: viewableFactory => {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        pkg._getStore().dispatch((_Actions || _load_Actions()).registerViewableFactory(viewableFactory));
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._getStore().dispatch((_Actions || _load_Actions()).unregisterViewableFactory(viewableFactory.id));
          }
        });
      },
      registerLocation: locationFactory => {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        pkg._getStore().dispatch((_Actions || _load_Actions()).registerLocationFactory(locationFactory));
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._getStore().dispatch((_Actions || _load_Actions()).unregisterLocation(locationFactory.id));
          }
        });
      },
      getViewableFactories: function (location) {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        return Array.from(pkg._getStore().getState().viewableFactories.values());
      },
      observeViewableFactories: function (location, cb) {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        return new (_UniversalDisposable || _load_UniversalDisposable()).default(
        // $FlowFixMe: Teach flow about Symbol.observable
        _rxjsBundlesRxMinJs.Observable.from(pkg._getStore()).map(state => state.viewableFactories).distinctUntilChanged().map(viewableFactories => new Set(viewableFactories.values())).subscribe(cb));
      }
    };
  }

};


function createPackageStore(rawState) {
  const initialState = (_AppSerialization || _load_AppSerialization()).deserialize(rawState);
  const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
  const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store)
  // Log errors and continue.
  .catch((err, stream) => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(err);
    return stream;
  });
  const store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_Reducers || _load_Reducers()), initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));

  const states = _rxjsBundlesRxMinJs.Observable.from(store);

  // Add a toggle command for every viewable provider. We avoid debouncing here so that commands
  // will immediately be available to packages after they register themselves.
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_syncAtomCommands || _load_syncAtomCommands()).default)(states.map(state => state.viewableFactories).distinctUntilChanged().map(viewableFactories => new Set(Array.from(viewableFactories.values()).filter(viewableFactory => viewableFactory.toggleCommand != null))), viewableFactory => ({
    'atom-workspace': {
      [viewableFactory.toggleCommand]: event => {
        const visible = event.detail == null ? undefined : event.detail.visible;
        store.dispatch((_Actions || _load_Actions()).toggleItemVisibility(viewableFactory.id, visible));
      }
    }
  })));

  return { store: store, disposables: disposables };
}

exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];