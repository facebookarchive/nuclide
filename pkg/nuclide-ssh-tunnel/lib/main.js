"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _CreateObservables() {
  const data = require("./CreateObservables");

  _CreateObservables = function () {
    return data;
  };

  return data;
}

function _Normalization() {
  const data = require("./Normalization");

  _Normalization = function () {
    return data;
  };

  return data;
}

function _TunnelsPanel() {
  const data = require("./ui/TunnelsPanel");

  _TunnelsPanel = function () {
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

function Reducers() {
  const data = _interopRequireWildcard(require("./redux/Reducers"));

  Reducers = function () {
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

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
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
class Activation {
  constructor(rawState) {
    const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');
    this._store = (0, _reduxMin().createStore)((0, _reduxMin().combineReducers)(Reducers()), (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)((0, _reduxObservable().combineEpics)(...epics))));
    this._disposables = new (_UniversalDisposable().default)(this._closeAllTunnels.bind(this), this._registerCommandAndOpener());
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _TunnelsPanel().WORKSPACE_VIEW_URI) {
        return new (_TunnelsPanel().TunnelsPanel)(this._store);
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _TunnelsPanel().TunnelsPanel), atom.commands.add('atom-workspace', 'nuclide-tunnels-panel:toggle', () => {
      atom.workspace.toggle(_TunnelsPanel().WORKSPACE_VIEW_URI);
    }));
  }

  provideSshTunnelService() {
    return {
      openTunnels: tunnel => (0, _CreateObservables().createObservableForTunnels)(tunnel, this._store),
      getOpenTunnels: () => this._store.getState().tunnels.toList().map(t => t.tunnel).toSet(),
      getAvailableServerPort: async uri => (0, _Normalization().getSocketServiceByHost)((0, _Normalization().getSharedHostUri)(uri)).getAvailableServerPort()
    };
  }

  deserializeSshTunnelsPanel() {
    return new (_TunnelsPanel().TunnelsPanel)(this._store);
  }

  _closeAllTunnels() {
    const tunnels = this._store.getState().tunnels;

    tunnels.toList().forEach(active => this._store.dispatch(Actions().closeTunnel(active.tunnel)));
  }

  consumeCurrentWorkingDirectory(api) {
    this._disposables.add(api.observeCwd(directory => {
      this._store.dispatch(Actions().setCurrentWorkingDirectory(directory));
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'Nuclide tunnels',
      messages: this._store.getState().consoleOutput
    }));
  }

}

(0, _createPackage().default)(module.exports, Activation);