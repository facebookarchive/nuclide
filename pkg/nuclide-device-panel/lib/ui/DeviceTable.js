"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTable = void 0;

var React = _interopRequireWildcard(require("react"));

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _DeviceTaskButton() {
  const data = require("./DeviceTaskButton");

  _DeviceTaskButton = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
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
 * 
 * @format
 */
class DeviceTable extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._pendingComponent = () => {
      return React.createElement("div", {
        className: "padded"
      }, React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL"
      }));
    }, this._noDevicesComponent = () => {
      return React.createElement("div", {
        className: "padded"
      }, "No devices connected");
    }, this._handleDeviceWillSelect = (item, selectedIndex, event) => {
      if (event != null) {
        let element = event.target;

        while (element != null) {
          if (element.classList.contains('nuclide-device-panel-device-action-button')) {
            return false;
          }

          element = element.parentElement;
        }
      }

      if (this.props.devices.isValue && this.props.devices.value[selectedIndex].ignoresSelection) {
        return false;
      }

      return true;
    }, this._handleDeviceTableSelection = (item, selectedDeviceIndex) => {
      if (this.props.devices.isValue) {
        this.props.setDevice(this.props.devices.value[selectedDeviceIndex]);
      }
    }, _temp;
  }

  render() {
    const devices = this.props.devices.getOrDefault([]);
    const anyTasks = Array.from(this.props.deviceTasks.values()).some(t => t.length > 0);
    const rows = devices.map(device => {
      const tasks = this.props.deviceTasks.get(device.identifier) || [];
      return {
        data: {
          name: device.displayName,
          actions: tasks.length === 0 ? null : React.createElement(_DeviceTaskButton().DeviceTaskButton, {
            tasks: tasks,
            icon: "device-mobile",
            title: "Device actions"
          })
        }
      };
    });
    const columns = anyTasks ? [{
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
    return React.createElement(_Table().Table, {
      collapsable: false,
      columns: columns,
      fixedHeader: true,
      maxBodyHeight: "99999px",
      emptyComponent: this._getEmptyComponent(),
      selectable: true,
      onSelect: this._handleDeviceTableSelection,
      onWillSelect: this._handleDeviceWillSelect,
      rows: rows
    });
  } // Passes down identical stateless components so === for them works as expected


  _getEmptyComponent() {
    if (this.props.devices.isError) {
      return this._getErrorComponent(this.props.devices.error.message);
    } else if (this.props.devices.isPending) {
      return this._pendingComponent;
    } else {
      return this._noDevicesComponent;
    }
  }

  _getErrorComponent(message) {
    if (this._lastErrorMessage !== message) {
      this._lastErrorMessage = message;

      this._lastErrorComponent = () => React.createElement("div", {
        className: "padded nuclide-device-panel-device-list-error"
      }, message);
    }

    return this._lastErrorComponent;
  }

}

exports.DeviceTable = DeviceTable;