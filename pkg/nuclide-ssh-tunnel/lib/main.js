'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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
  return _reduxObservable = require('nuclide-commons/redux-observable');
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
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    this._store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_Reducers || _load_Reducers()), (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._closeAllTunnels.bind(this), this._registerCommandAndOpener());
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_TunnelsPanel || _load_TunnelsPanel()).WORKSPACE_VIEW_URI) {
        return new (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel(this._store);
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel), atom.commands.add('atom-workspace', 'nuclide-ssh-tunnels-panel:toggle', () => {
      atom.workspace.toggle((_TunnelsPanel || _load_TunnelsPanel()).WORKSPACE_VIEW_URI);
    }));
  }

  provideSshTunnelService() {
    if (this._tunnels == null) {
      // $FlowFixMe: Teach flow about Symbol.observable
      const states = _rxjsBundlesRxMinJs.Observable.from(this._store);
      this._tunnels = states.map(state => state.openTunnels)
      // $FlowFixMe teach mapEqual to accept Immutable.Map
      .distinctUntilChanged((_collection || _load_collection()).mapEqual).map(tunnelMap => tunnelMap.map(openTunnel => openTunnel.state)).publishReplay(1).refCount();
    }

    return {
      openTunnel: (tunnel, onOpen, onClose) => {
        this._store.dispatch((_Actions || _load_Actions()).openTunnel(tunnel, onOpen, onClose));
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel)));
      },
      getOpenTunnels: () => {
        return new Set(this._store.getState().openTunnels.keys());
      },
      observeTunnels: callback => {
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tunnels.subscribe(tunnels => callback(tunnels)));
      },
      getAvailableServerPort: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* (nuclideUri) {
          return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSocketServiceByNuclideUri)(nuclideUri).getAvailableServerPort();
        });

        return function getAvailableServerPort(_x) {
          return _ref.apply(this, arguments);
        };
      })()
    };
  }

  deserializeSshTunnelsPanel() {
    return new (_TunnelsPanel || _load_TunnelsPanel()).TunnelsPanel(this._store);
  }

  _closeAllTunnels() {
    const tunnels = this._store.getState().openTunnels;
    tunnels.forEach((_, tunnel) => this._store.dispatch((_Actions || _load_Actions()).closeTunnel(tunnel)));
  }

  consumeCurrentWorkingDirectory(api) {
    this._disposables.add(api.observeCwd(directory => {
      this._store.dispatch((_Actions || _load_Actions()).setCurrentWorkingDirectory(directory));
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'SSH tunnels',
      messages: this._store.getState().consoleOutput
    }));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);