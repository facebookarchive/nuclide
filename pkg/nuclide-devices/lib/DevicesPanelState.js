'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicesPanelState = exports.WORKSPACE_VIEW_URI = undefined;

var _react = _interopRequireDefault(require('react'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _DevicePanel;

function _load_DevicePanel() {
  return _DevicePanel = require('./ui/DevicePanel');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/devices'; /**
                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                   * All rights reserved.
                                                                                   *
                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                   * the root directory of this source tree.
                                                                                   *
                                                                                   * 
                                                                                   */

class DevicesPanelState {

  constructor(deviceFetchers) {
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)(deviceFetchers), (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)((0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics))));
  }

  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth() {
    return 300;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'right';
  }

  _appStateToProps(state) {
    const refreshDevices = host => {
      this._store.dispatch((_Actions || _load_Actions()).refreshDevices());
    };
    const setHost = host => {
      this._store.dispatch((_Actions || _load_Actions()).setHost(host));
    };
    const setDeviceType = deviceType => {
      this._store.dispatch((_Actions || _load_Actions()).setDeviceType(deviceType));
    };
    const setDevice = device => {
      this._store.dispatch((_Actions || _load_Actions()).setDevice(device));
    };
    return {
      devices: state.devices,
      hosts: state.hosts,
      host: state.host,
      deviceType: state.deviceType,
      device: state.device,
      refreshDevices,
      setHost,
      setDeviceType,
      setDevice
    };
  }

  getElement() {
    const PreparedDevicePanel = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    // $FlowFixMe: Teach flow about Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this._store).distinctUntilChanged().map(state => this._appStateToProps(state)), (_DevicePanel || _load_DevicePanel()).DevicePanel);

    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(PreparedDevicePanel, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.DevicePanelState'
    };
  }
}
exports.DevicesPanelState = DevicesPanelState;