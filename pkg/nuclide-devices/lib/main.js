'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _DevicesPanelState;

function _load_DevicesPanelState() {
  return _DevicesPanelState = require('./DevicesPanelState');
}

var _atom = require('atom');

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('../../nuclide-remote-connection/lib/ServerConnection');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._fetchers = new Set();
    this._deviceInfoProviders = new Set();
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)(this._fetchers, this._deviceInfoProviders), (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((_ServerConnection || _load_ServerConnection()).ServerConnection.observeRemoteConnections().subscribe(conns => {
      const hosts = conns.map(conn => conn.getUriOfRemotePath('/'));
      this._store.dispatch((_Actions || _load_Actions()).setHosts(['local'].concat(hosts)));
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI) {
        return new (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState(this._store);
      }
    }), () => api.destroyWhere(item => item instanceof (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState), atom.commands.add('atom-workspace', 'nuclide-devices:toggle', event => {
      api.toggle((_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  deserializeDevicePanelState() {
    return new (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState(this._store);
  }

  provideDevicePanelServiceApi() {
    let pkg = this;
    this._disposables.add(() => {
      pkg = null;
    });
    return {
      registerDeviceFetcher: fetcher => {
        if (!(pkg != null)) {
          throw new Error('Device panel service API used after deactivation');
        }

        pkg._fetchers.add(fetcher);
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._fetchers.delete(fetcher);
          }
        });
      },
      registerInfoProvider: provider => {
        if (!(pkg != null)) {
          throw new Error('Device panel service API used after deactivation');
        }

        pkg._deviceInfoProviders.add(provider);
        return new _atom.Disposable(() => {
          if (pkg != null) {
            pkg._deviceInfoProviders.delete(provider);
          }
        });
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);