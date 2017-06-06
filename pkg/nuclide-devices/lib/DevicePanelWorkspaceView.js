'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanelWorkspaceView = exports.WORKSPACE_VIEW_URI = undefined;

var _react = _interopRequireDefault(require('react'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _RootPanel;

function _load_RootPanel() {
  return _RootPanel = require('./ui/RootPanel');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _providers;

function _load_providers() {
  return _providers = require('./providers');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/devices';

class DevicePanelWorkspaceView {

  constructor(store) {
    this._store = store;
    // $FlowFixMe: Teach flow about Symbol.observable
    this._deviceObs = _rxjsBundlesRxMinJs.Observable.from(this._store).distinctUntilChanged((stateA, stateB) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host).switchMap(state => {
      if (state.deviceType === null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      for (const fetcher of (0, (_providers || _load_providers()).getProviders)().deviceList) {
        if (fetcher.getType() === state.deviceType) {
          return fetcher.observe(state.host).do(devices => this._store.dispatch((_Actions || _load_Actions()).setDevices(devices)));
        }
      }
    }).ignoreElements();
    // $FlowFixMe: Teach flow about Symbol.observable
    this._processesObs = _rxjsBundlesRxMinJs.Observable.from(this._store).distinctUntilChanged((stateA, stateB) => stateA.deviceType === stateB.deviceType && stateA.host === stateB.host && (0, (_shallowequal || _load_shallowequal()).default)(stateA.device, stateB.device)).switchMap(state => {
      if (state.device === null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const providers = Array.from((0, (_providers || _load_providers()).getProviders)().deviceProcesses).filter(provider => provider.getType() === state.deviceType);
      if (providers[0] != null) {
        return providers[0].observe(state.host, state.device.name);
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).do(processes => this._store.dispatch((_Actions || _load_Actions()).setProcesses(processes)));
  }

  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth() {
    return 400;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'right';
  }

  _appStateToProps(state) {
    const startFetchingDevices = () => {
      return this._deviceObs.subscribe();
    };
    const startFetchingProcesses = () => {
      return this._processesObs.subscribe();
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
      deviceTypes: state.deviceTypes,
      deviceType: state.deviceType,
      device: state.device,
      infoTables: state.infoTables,
      processes: state.processes,
      deviceTasks: state.deviceTasks,
      processTasks: state.processTasks,
      isDeviceConnected: state.isDeviceConnected,
      startFetchingDevices,
      startFetchingProcesses,
      setHost,
      setDeviceType,
      setDevice
    };
  }

  getElement() {
    const PreparedDevicePanel = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    // $FlowFixMe: Teach flow about Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this._store).distinctUntilChanged().map(state => this._appStateToProps(state)), (_RootPanel || _load_RootPanel()).RootPanel);

    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(PreparedDevicePanel, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.DevicePanelState'
    };
  }
}
exports.DevicePanelWorkspaceView = DevicePanelWorkspaceView;