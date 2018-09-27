"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbDeviceSelector = void 0;

function _nuclideAdb() {
  const data = require("../nuclide-adb");

  _nuclideAdb = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Dropdown() {
  const data = require("../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _expected() {
  const data = require("../nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const NO_DEVICES_MSG = 'No adb devices attached!';

class AdbDeviceSelector extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this._handleDeviceListChange = this._handleDeviceListChange.bind(this);
    this._handleDeviceDropdownChange = this._handleDeviceDropdownChange.bind(this);
    this.state = {
      deviceList: _expected().Expect.pending(),
      selectedDevice: null
    };
  }

  componentDidMount() {
    this._disposables.add((0, _nuclideAdb().observeAndroidDevices)(this.props.targetUri).startWith(_expected().Expect.pending()).subscribe(deviceList => this._handleDeviceListChange(deviceList)));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleDeviceListChange(deviceList) {
    const previousDevice = this.state.selectedDevice;
    let selectedDevice = previousDevice == null ? null : deviceList.getOrDefault([]).find(device => device.serial === previousDevice.serial);

    if (selectedDevice == null && deviceList.isValue) {
      selectedDevice = deviceList.value[0];
    }

    this.setState({
      deviceList,
      selectedDevice
    });
    this.props.onChange(selectedDevice);
  }

  _getDeviceItems() {
    if (!this.state.deviceList.isValue) {
      throw new Error("Invariant violation: \"this.state.deviceList.isValue\"");
    }

    if (this.state.deviceList.value.length === 0) {
      return [{
        value: null,
        label: NO_DEVICES_MSG
      }];
    }

    return this.state.deviceList.value.map(device => ({
      value: device,
      label: device.displayName
    }));
  }

  render() {
    if (this.state.deviceList.isPending) {
      return React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL"
      });
    }

    if (this.state.deviceList.isError) {
      return React.createElement("div", {
        className: "nuclide-ui-message-error"
      }, this.state.deviceList.error.toString());
    }

    const deviceItems = this._getDeviceItems();

    return React.createElement(_Dropdown().Dropdown, {
      options: deviceItems,
      onChange: this._handleDeviceDropdownChange,
      value: this.state.selectedDevice
    });
  }

  _handleDeviceDropdownChange(selectedDevice) {
    this.setState({
      selectedDevice
    });
    this.props.onChange(selectedDevice);
  }

}

exports.AdbDeviceSelector = AdbDeviceSelector;