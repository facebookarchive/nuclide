'use strict';

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('../../nuclide-remote-connection/lib/ServerConnection');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _AppState;

function _load_AppState() {
  return _AppState = require('./redux/AppState');
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _Registration;

function _load_Registration() {
  return _Registration = require('./device-panel/Registration');
}

var _AndroidBridge;

function _load_AndroidBridge() {
  return _AndroidBridge = require('./bridges/AndroidBridge');
}

var _TizenBridge;

function _load_TizenBridge() {
  return _TizenBridge = require('./bridges/TizenBridge');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor(rawState) {
    const initialState = Object.assign({}, (0, (_AppState || _load_AppState()).createEmptyAppState)(), (0, (_AppState || _load_AppState()).deserialize)(rawState));

    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');

    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));

    this._registerCustomDBPaths('local');
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((_ServerConnection || _load_ServerConnection()).ServerConnection.observeRemoteConnections().subscribe(conns => conns.map(conn => {
      this._registerCustomDBPaths(conn.getUriOfRemotePath('/'));
    })));
  }

  _registerCustomDBPaths(host) {
    const state = this._store.getState();
    if (state.customAdbPaths.has(host)) {
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getAdbServiceByNuclideUri)(host).registerCustomPath(state.customAdbPaths.get(host));
    }
    if (state.customSdbPaths.has(host)) {
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSdbServiceByNuclideUri)(host).registerCustomPath(state.customSdbPaths.get(host));
    }
  }

  serialize() {
    return (0, (_AppState || _load_AppState()).serialize)(this._store.getState());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add((0, (_Registration || _load_Registration()).registerDevicePanelProviders)(api, new (_AndroidBridge || _load_AndroidBridge()).AndroidBridge(this._store), new (_TizenBridge || _load_TizenBridge()).TizenBridge(this._store)));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);