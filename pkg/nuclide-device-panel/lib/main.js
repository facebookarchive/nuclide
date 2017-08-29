'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DevicePanelWorkspaceView;

function _load_DevicePanelWorkspaceView() {
  return _DevicePanelWorkspaceView = require('./DevicePanelWorkspaceView');
}

var _atom = require('atom');

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('../../nuclide-remote-connection/lib/ServerConnection');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
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

var _providers;

function _load_providers() {
  return _providers = require('./providers');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let activation = null; /**
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

  constructor(state) {
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)(), (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((_ServerConnection || _load_ServerConnection()).ServerConnection.observeRemoteConnections().subscribe(conns => {
      const hosts = conns.map(conn => conn.getUriOfRemotePath('/'));
      this._store.dispatch((_Actions || _load_Actions()).setHosts([''].concat(hosts)));
    }), this._registerCommandAndOpener());
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_DevicePanelWorkspaceView || _load_DevicePanelWorkspaceView()).WORKSPACE_VIEW_URI) {
        return new (_DevicePanelWorkspaceView || _load_DevicePanelWorkspaceView()).DevicePanelWorkspaceView(this._store);
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_DevicePanelWorkspaceView || _load_DevicePanelWorkspaceView()).DevicePanelWorkspaceView), atom.commands.add('atom-workspace', 'nuclide-device-panel:toggle', () => {
      atom.workspace.toggle((_DevicePanelWorkspaceView || _load_DevicePanelWorkspaceView()).WORKSPACE_VIEW_URI);
    }));
  }

  deserializeDevicePanelState() {
    return new (_DevicePanelWorkspaceView || _load_DevicePanelWorkspaceView()).DevicePanelWorkspaceView(this._store);
  }

  _refreshDeviceTypes() {
    this._store.dispatch((_Actions || _load_Actions()).setDeviceTypes(Array.from((0, (_providers || _load_providers()).getProviders)().deviceList).map(p => p.getType()).sort((a, b) => a.localeCompare(b))));
  }

  _createProviderRegistration(providers, onDispose) {
    return provider => {
      if (!(activation != null)) {
        throw new Error('Device panel service API used after deactivation');
      }

      providers.add(provider);
      if (onDispose != null) {
        onDispose();
      }
      return new _atom.Disposable(() => {
        if (activation != null) {
          providers.delete(provider);
        }
      });
    };
  }

  provideDevicePanelServiceApi() {
    activation = this;
    this._disposables.add(() => {
      activation = null;
    });
    const providers = (0, (_providers || _load_providers()).getProviders)();
    return {
      registerListProvider: this._createProviderRegistration(providers.deviceList, () => this._refreshDeviceTypes()),
      registerInfoProvider: this._createProviderRegistration(providers.deviceInfo),
      registerProcessesProvider: this._createProviderRegistration(providers.deviceProcesses),
      registerTaskProvider: this._createProviderRegistration(providers.deviceTask),
      registerProcessTaskProvider: this._createProviderRegistration(providers.processTask),
      registerDeviceTypeTaskProvider: this._createProviderRegistration(providers.deviceTypeTask, () => this._refreshDeviceTypes()),
      registerDeviceActionProvider: this._createProviderRegistration(providers.deviceAction)
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);