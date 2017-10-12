'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanelWorkspaceView = exports.WORKSPACE_VIEW_URI = undefined;

var _react = _interopRequireWildcard(require('react'));

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    const toggleDevicePolling = isActive => {
      this._store.dispatch((_Actions || _load_Actions()).toggleDevicePolling(isActive));
    };
    const toggleProcessPolling = isActive => {
      this._store.dispatch((_Actions || _load_Actions()).toggleProcessPolling(isActive));
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
      deviceTypeTasks: state.deviceTypeTasks,
      toggleDevicePolling,
      toggleProcessPolling,
      setHost,
      setDeviceType,
      setDevice
    };
  }

  getElement() {
    const PreparedDevicePanel = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    // $FlowFixMe: Teach flow about Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this._store).distinctUntilChanged().map(state => this._appStateToProps(state)), (_RootPanel || _load_RootPanel()).RootPanel);

    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(PreparedDevicePanel, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.DevicePanelWorkspaceView'
    };
  }
}
exports.DevicePanelWorkspaceView = DevicePanelWorkspaceView;