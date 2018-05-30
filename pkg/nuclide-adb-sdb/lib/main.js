'use strict';

var _Tunneling;

function _load_Tunneling() {
  return _Tunneling = _interopRequireWildcard(require('../../nuclide-adb-sdb-base/lib/Tunneling'));
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('../../nuclide-remote-connection/lib/ServerConnection');
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../../../modules/nuclide-adb');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _ConfigurePathTaskProvider;

function _load_ConfigurePathTaskProvider() {
  return _ConfigurePathTaskProvider = require('./ConfigurePathTaskProvider');
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

var _reduxMin;

function _load_reduxMin() {
  return _reduxMin = require('redux/dist/redux.min.js');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../../modules/nuclide-commons/redux-observable');
}

var _AndroidBridge;

function _load_AndroidBridge() {
  return _AndroidBridge = require('./bridges/AndroidBridge');
}

var _TizenBridge;

function _load_TizenBridge() {
  return _TizenBridge = require('./bridges/TizenBridge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let fbStartTunnelingAdb; /**
                          * Copyright (c) 2015-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the license found in the LICENSE file in
                          * the root directory of this source tree.
                          *
                          * 
                          * @format
                          */

try {
  // $eslint-disable-next-line $FlowFB
  fbStartTunnelingAdb = require('../../nuclide-adb-sdb-base/lib/fb-Tunneling');
} catch (e) {}

class Activation {

  constructor(rawState) {
    const initialState = Object.assign({}, (0, (_AppState || _load_AppState()).createEmptyAppState)(), (0, (_AppState || _load_AppState()).deserialize)(rawState));

    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');

    this._store = (0, (_reduxMin || _load_reduxMin()).createStore)((_Reducers || _load_Reducers()).app, initialState, (0, (_reduxMin || _load_reduxMin()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));

    this._registerCustomDBPaths('local');
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((_ServerConnection || _load_ServerConnection()).ServerConnection.observeRemoteConnections().subscribe(conns => conns.map(conn => {
      this._registerCustomDBPaths(conn.getUriOfRemotePath('/'));
    })));
  }

  _registerCustomDBPaths(host) {
    const state = this._store.getState();
    if (state.customAdbPaths.has(host)) {
      (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(host).registerCustomPath(state.customAdbPaths.get(host));
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
    this._disposables.add(api.registerDeviceTypeTaskProvider(new (_ConfigurePathTaskProvider || _load_ConfigurePathTaskProvider()).ConfigurePathTaskProvider(new (_AndroidBridge || _load_AndroidBridge()).AndroidBridge(this._store))), api.registerDeviceTypeTaskProvider(new (_ConfigurePathTaskProvider || _load_ConfigurePathTaskProvider()).ConfigurePathTaskProvider(new (_TizenBridge || _load_TizenBridge()).TizenBridge(this._store))));
  }

  provideAdbTunnelService() {
    return Object.assign({}, _Tunneling || _load_Tunneling(), {
      startTunnelingAdb: fbStartTunnelingAdb != null ? fbStartTunnelingAdb : (_Tunneling || _load_Tunneling()).startTunnelingAdb
    });
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);