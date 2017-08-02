'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTable = undefined;

var _react = _interopRequireDefault(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
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

    this._handleDeviceTableSelection = (item, selectedDeviceIndex) => {
      if (!this.props.devices.isError) {
        this.props.setDevice(this.props.devices.value[selectedDeviceIndex]);
      }
    };

    this._emptyComponent = () => {
      if (this.props.devices.isError) {
        return _react.default.createElement(
          'div',
          { className: 'padded nuclide-device-panel-device-list-error' },
          this.props.devices.error.message
        );
      }
      return _react.default.createElement(
        'div',
        { className: 'padded' },
        'No devices connected'
      );
    };
  }

  render() {
    const devices = this.props.devices.getOrDefault([]);

    const rows = devices.map(_device => ({
      data: { name: _device.displayName }
    }));
    const columns = [{
      key: 'name',
      title: 'Devices',
      width: 1.0
    }];

    return _react.default.createElement((_Table || _load_Table()).Table, {
      collapsable: false,
      columns: columns,
      fixedHeader: true,
      maxBodyHeight: '99999px',
      emptyComponent: this._emptyComponent,
      selectable: true,
      onSelect: this._handleDeviceTableSelection,
      rows: rows
    });
  }

}
exports.DeviceTable = DeviceTable;