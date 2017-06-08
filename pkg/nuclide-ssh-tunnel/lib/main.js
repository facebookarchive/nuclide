'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _TunnelsPanel;

function _load_TunnelsPanel() {
  return _TunnelsPanel = require('./ui/TunnelsPanel');
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

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _atom = require('atom');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(rawState) {
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    this._store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_Reducers || _load_Reducers()), (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._closeAllTunnels.bind(this));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_TunnelsPanel || _load_TunnelsPanel()).WORKSPACE_VIEW_URI) {
        return new (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel(this._store);
      }
    }), () => api.destroyWhere(item => item instanceof (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel), atom.commands.add('atom-workspace', 'nuclide-ssh-tunnels-panel:toggle', event => {
      api.toggle((_TunnelsPanel || _load_TunnelsPanel()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  provideSshTunnelService() {
    return {
      openTunnel: tunnel => {
        this._store.dispatch((_Actions || _load_Actions()).openTunnel(tunnel));
        return new _atom.Disposable(() => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel)));
      }
    };
  }

  deserializeSshTunnelsPanel() {
    return new (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel(this._store);
  }

  _closeAllTunnels() {
    const tunnels = this._store.getState().openTunnels;
    tunnels.forEach((_, tunnel) => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel)));
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);