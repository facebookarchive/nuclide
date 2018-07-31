"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanelWorkspaceView = exports.WORKSPACE_VIEW_URI = void 0;

var React = _interopRequireWildcard(require("react"));

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _RootPanel() {
  const data = require("./ui/RootPanel");

  _RootPanel = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/devices';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

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
      this._store.dispatch(Actions().toggleDevicePolling(isActive));
    };

    const toggleProcessPolling = isActive => {
      this._store.dispatch(Actions().toggleProcessPolling(isActive));
    };

    const setHost = host => {
      this._store.dispatch(Actions().setHost(host));
    };

    const setDeviceType = deviceType => {
      this._store.dispatch(Actions().setDeviceType(deviceType));
    };

    const setDevice = device => {
      this._store.dispatch(Actions().setDevice(device));
    };

    return {
      devices: state.devices,
      hosts: state.hosts,
      host: state.host,
      deviceTypes: state.deviceTypes,
      deviceType: state.deviceType,
      device: state.device,
      infoTables: state.infoTables,
      appInfoTables: state.appInfoTables,
      processes: state.processes,
      deviceTasks: state.deviceTasks,
      processTasks: state.processTasks,
      isDeviceConnected: state.isDeviceConnected,
      deviceTypeTasks: state.deviceTypeTasks,
      deviceTypeComponents: state.deviceTypeComponents,
      toggleDevicePolling,
      toggleProcessPolling,
      setHost,
      setDeviceType,
      setDevice
    };
  }

  getElement() {
    const PreparedDevicePanel = (0, _bindObservableAsProps().bindObservableAsProps)( // $FlowFixMe: Teach flow about Symbol.observable
    _RxMin.Observable.from(this._store).distinctUntilChanged().map(state => this._appStateToProps(state)), _RootPanel().RootPanel);
    return (0, _renderReactRoot().renderReactRoot)(React.createElement(PreparedDevicePanel, null));
  }

  serialize() {
    return {
      deserializer: 'nuclide.DevicePanelWorkspaceView'
    };
  }

}

exports.DevicePanelWorkspaceView = DevicePanelWorkspaceView;