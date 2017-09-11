'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTable = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _providers;

function _load_providers() {
  return _providers = require('../providers');
}

var _DeviceTaskButton;

function _load_DeviceTaskButton() {
  return _DeviceTaskButton = require('./DeviceTaskButton');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DeviceTable extends _react.Component {

  constructor(props) {
    super(props);

    this._handleDeviceWillSelect = (item, selectedIndex, event) => {
      let element = event.target;
      while (element != null) {
        if (element.classList.contains('nuclide-device-panel-device-action-button')) {
          return false;
        }
        element = element.parentElement;
      }
      return true;
    };

    this._handleDeviceTableSelection = (item, selectedDeviceIndex) => {
      if (!this.props.devices.isError) {
        this.props.setDevice(this.props.devices.value[selectedDeviceIndex]);
      }
    };

    this._emptyComponent = () => {
      if (this.props.devices.isError) {
        return _react.createElement(
          'div',
          { className: 'padded nuclide-device-panel-device-list-error' },
          this.props.devices.error.message
        );
      }
      return _react.createElement(
        'div',
        { className: 'padded' },
        this.props.devices.isPending ? _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL' }) : 'No devices connected'
      );
    };
  }

  _getActionsForDevice(device, actionProviders) {
    const actions = [];
    for (const provider of actionProviders) {
      const deviceActions = provider.getActionsForDevice(device);
      if (deviceActions.length > 0) {
        actions.push(...deviceActions);
      }
    }
    return actions;
  }

  render() {
    const devices = this.props.devices.getOrDefault([]);

    const actionProviders = (0, (_providers || _load_providers()).getProviders)().deviceAction;
    const anyActions = devices.length > 0 && devices.find(device => this._getActionsForDevice(device, actionProviders).length > 0) != null;
    const rows = devices.map(_device => {
      const actions = this._getActionsForDevice(_device, actionProviders);
      return {
        data: {
          name: _device.displayName,
          actions: actions.length === 0 ? null : _react.createElement((_DeviceTaskButton || _load_DeviceTaskButton()).DeviceTaskButton, {
            actions: actions,
            device: _device,
            icon: 'device-mobile',
            title: 'Device actions'
          })
        }
      };
    });
    const columns = anyActions ? [{
      key: 'name',
      title: 'Devices',
      width: 0.7
    }, {
      key: 'actions',
      title: 'Actions',
      width: 0.3
    }] : [{
      key: 'name',
      title: 'Devices',
      width: 1.0
    }];

    return _react.createElement((_Table || _load_Table()).Table, {
      collapsable: false,
      columns: columns,
      fixedHeader: true,
      maxBodyHeight: '99999px',
      emptyComponent: this._emptyComponent,
      selectable: true,
      onSelect: this._handleDeviceTableSelection,
      onWillSelect: this._handleDeviceWillSelect,
      rows: rows
    });
  }

}
exports.DeviceTable = DeviceTable; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */