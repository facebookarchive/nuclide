'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootPanel = undefined;

var _DeviceTask;

function _load_DeviceTask() {
  return _DeviceTask = require('../DeviceTask');
}

var _react = _interopRequireDefault(require('react'));

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('nuclide-commons-ui/PanelComponentScroller');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('./Selectors');
}

var _DeviceTable;

function _load_DeviceTable() {
  return _DeviceTable = require('./DeviceTable');
}

var _DevicePanel;

function _load_DevicePanel() {
  return _DevicePanel = require('./DevicePanel');
}

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

class RootPanel extends _react.default.Component {

  constructor(props) {
    super(props);
    this._devicesSubscription = null;

    if (!(props.hosts.length > 0)) {
      throw new Error('Invariant violation: "props.hosts.length > 0"');
    }

    this._goToRootPanel = this._goToRootPanel.bind(this);
  }

  componentDidMount() {
    this._devicesSubscription = this.props.startFetchingDevices();
  }

  componentWillUnmount() {
    if (this._devicesSubscription != null) {
      this._devicesSubscription.unsubscribe();
    }
  }

  _createDeviceTable() {
    if (this.props.deviceType === null) {
      return null;
    }
    return _react.default.createElement((_DeviceTable || _load_DeviceTable()).DeviceTable, {
      devices: this.props.devices,
      device: this.props.device,
      setDevice: this.props.setDevice
    });
  }

  _goToRootPanel() {
    this.props.setDevice(null);
  }

  _getInnerPanel() {
    if (this.props.device != null) {
      return _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement((_DevicePanel || _load_DevicePanel()).DevicePanel, {
          infoTables: this.props.infoTables,
          processes: this.props.processes,
          processTasks: this.props.processTasks,
          deviceTasks: this.props.deviceTasks,
          goToRootPanel: this._goToRootPanel,
          startFetchingProcesses: this.props.startFetchingProcesses,
          isDeviceConnected: this.props.isDeviceConnected
        })
      );
    }
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement((_Selectors || _load_Selectors()).Selectors, {
          deviceType: this.props.deviceType,
          deviceTypes: this.props.deviceTypes,
          hosts: this.props.hosts,
          host: this.props.host,
          setDeviceType: this.props.setDeviceType,
          setHost: this.props.setHost
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        this._createDeviceTable()
      )
    );
  }

  render() {
    return _react.default.createElement(
      (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
      null,
      _react.default.createElement(
        'div',
        { className: 'nuclide-device-panel-container' },
        this._getInnerPanel()
      )
    );
  }
}
exports.RootPanel = RootPanel;