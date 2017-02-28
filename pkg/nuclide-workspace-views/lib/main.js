'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(rawState) {
    this._needToDispatchActivatedAction = false;

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // We don't know if this package is being activated as part of Atom's initial package
    // activation phase or being enabled through the settings later (in which case we would have
    // missed the `onDidActivatePackage` event).
    (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.packages.onDidActivatePackage(cb)).race((_observable || _load_observable()).nextTick).first().subscribe(() => {
      this._needToDispatchActivatedAction = true;
      this._maybeDispatchActivatedAction();
    }));
    this._rawState = rawState;
  }

  _maybeDispatchActivatedAction() {
    if (this._needToDispatchActivatedAction && this._store != null) {
      this._needToDispatchActivatedAction = false;
      this._store.dispatch((_Actions || _load_Actions()).didActivateInitialPackages());
    }
  }

  dispose() {
    this._disposables.dispose();
  }

  _getStore() {
    if (this._store == null) {
      this._store = createPackageStore(this._rawState || {});
      this._rawState = null;
      this._maybeDispatchActivatedAction();
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
      addOpener(opener) {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        pkg._getStore().dispatch((_Actions || _load_Actions()).addOpener(opener));
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._getStore().dispatch((_Actions || _load_Actions()).removeOpener(opener));
          }
        });
      },
      destroyWhere(predicate) {
        if (pkg == null) {
          return;
        }
        pkg._getStore().dispatch((_Actions || _load_Actions()).destroyWhere(predicate));
      },
      open(uri, options) {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        pkg._getStore().dispatch((_Actions || _load_Actions()).open(uri, options));
      },
      toggle(uri, options) {
        if (!(pkg != null)) {
          throw new Error('Viewables API used after deactivation');
        }

        const visible = options != null ? options.visible : undefined;
        pkg._getStore().dispatch((_Actions || _load_Actions()).toggleItemVisibility(uri, visible));
      }
    };
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

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

  return store;
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);