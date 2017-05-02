'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTable = undefined;

var _react = _interopRequireDefault(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('../../../nuclide-ui/Table');
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

class DeviceTable extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = { selectedDeviceIndex: null };
    this._handleDeviceTableSelection = this._handleDeviceTableSelection.bind(this);
    this._emptyComponent = () => _react.default.createElement(
      'div',
      { className: 'padded' },
      'No devices connected'
    );
  }

  componentWillReceiveProps(nextProps) {
    const nextDevice = nextProps.device;
    let selectedDeviceIndex = null;
    if (nextDevice != null) {
      selectedDeviceIndex = nextProps.devices.findIndex(device => device.name === nextDevice.name);
    }
    if (selectedDeviceIndex !== this.state.selectedDeviceIndex) {
      this.setState({ selectedDeviceIndex });
    }
  }

  render() {
    const rows = this.props.devices.map(device => ({
      data: { name: device.displayName }
    }));
    const columns = [{
      key: 'name',
      title: 'Device',
      width: 1.0
    }];

    return _react.default.createElement((_Table || _load_Table()).Table, {
      collapsable: false,
      columns: columns,
      fixedHeader: true,
      maxBodyHeight: '99999px',
      emptyComponent: this._emptyComponent,
      selectable: true,
      selectedIndex: this.state.selectedDeviceIndex,
      onSelect: this._handleDeviceTableSelection,
      rows: rows
    });
  }

  _handleDeviceTableSelection(item, selectedDeviceIndex) {
    this.setState({ selectedDeviceIndex }, this.props.setDevice(this.props.devices[selectedDeviceIndex]));
  }
}
exports.DeviceTable = DeviceTable;