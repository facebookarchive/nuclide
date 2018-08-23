"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _DevicePanelWorkspaceView() {
  const data = require("./DevicePanelWorkspaceView");

  _DevicePanelWorkspaceView = function () {
    return data;
  };

  return data;
}

function _ServerConnection() {
  const data = require("../../nuclide-remote-connection/lib/ServerConnection");

  _ServerConnection = function () {
    return data;
  };

  return data;
}

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

function _createEmptyAppState() {
  const data = require("./redux/createEmptyAppState");

  _createEmptyAppState = function () {
    return data;
  };

  return data;
}

function Reducers() {
  const data = _interopRequireWildcard(require("./redux/Reducers"));

  Reducers = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./redux/Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

function _providers() {
  const data = require("./providers");

  _providers = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
let activation = null;

class Activation {
  constructor(state) {
    const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');
    this._store = (0, _reduxMin().createStore)(Reducers().app, (0, _createEmptyAppState().createEmptyAppState)(), (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)((0, _reduxObservable().combineEpics)(...epics))));
    this._disposables = new (_UniversalDisposable().default)(_ServerConnection().ServerConnection.observeRemoteConnections().subscribe(conns => {
      const hosts = conns.map(conn => conn.getUriOfRemotePath('/'));

      this._store.dispatch(Actions().setHosts([''].concat(hosts)));
    }), this._registerCommandAndOpener());
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _DevicePanelWorkspaceView().WORKSPACE_VIEW_URI) {
        return new (_DevicePanelWorkspaceView().DevicePanelWorkspaceView)(this._store);
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _DevicePanelWorkspaceView().DevicePanelWorkspaceView), atom.commands.add('atom-workspace', 'nuclide-devices-panel:toggle', () => {
      atom.workspace.toggle(_DevicePanelWorkspaceView().WORKSPACE_VIEW_URI);
    }));
  }

  deserializeDevicePanelState() {
    return new (_DevicePanelWorkspaceView().DevicePanelWorkspaceView)(this._store);
  }

  _refreshDeviceTypes() {
    this._store.dispatch(Actions().setDeviceTypes(Array.from((0, _providers().getProviders)().deviceList).map(p => p.getType()).sort((a, b) => a.localeCompare(b))));
  }

  _refreshDevices() {
    this._store.dispatch(Actions().setDevices(this._store.getState().devices));
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

      return new (_UniversalDisposable().default)(() => {
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

    const providers = (0, _providers().getProviders)();
    return {
      registerListProvider: this._createProviderRegistration(providers.deviceList, () => this._refreshDeviceTypes()),
      registerInfoProvider: this._createProviderRegistration(providers.deviceInfo),
      registerProcessesProvider: this._createProviderRegistration(providers.deviceProcesses),
      registerDeviceTaskProvider: this._createProviderRegistration(providers.deviceTask, () => this._refreshDevices()),
      registerProcessTaskProvider: this._createProviderRegistration(providers.processTask),
      registerDeviceTypeTaskProvider: this._createProviderRegistration(providers.deviceTypeTask, () => this._refreshDeviceTypes()),
      registerAppInfoProvider: this._createProviderRegistration(providers.appInfo),
      registerDeviceTypeComponentProvider: this._createProviderRegistration(providers.deviceTypeComponent)
    };
  }

}

(0, _createPackage().default)(module.exports, Activation);