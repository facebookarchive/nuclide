"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceAndPackage = void 0;

function _nuclideAdb() {
  const data = require("../nuclide-adb");

  _nuclideAdb = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
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

function _expected() {
  const data = require("../nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _AdbDeviceSelector() {
  const data = require("./AdbDeviceSelector");

  _AdbDeviceSelector = function () {
    return data;
  };

  return data;
}

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
class DeviceAndPackage extends React.Component {
  constructor(props) {
    super(props);

    this._handleDeviceChange = device => {
      const state = {
        selectedDevice: device,
        packages: device == null ? _expected().Expect.value([]) : _expected().Expect.pending()
      };
      const value = this.props.deserialize();

      if (device != null && (this.state.selectedDevice == null || device.serial !== this.state.selectedDevice.serial) && value != null) {
        state.launchPackage = value;
      }

      this.setState(state, () => {
        this._refreshPackageList(device);
      });
    };

    this.state = {
      selectedDevice: null,
      launchPackage: '',
      packages: _expected().Expect.value([])
    };
  }

  async _refreshPackageList(device) {
    if (device != null) {
      const packages = _expected().Expect.value((await (0, _nuclideAdb().getAdbServiceByNuclideUri)(this.props.targetUri).getInstalledPackages(device.serial)).sort());

      this.setState({
        packages
      });
    } else {
      this.setState({
        packages: _expected().Expect.value([])
      });
    }
  }

  setState(partialState, callback) {
    const fullState = Object.assign({}, this.state, partialState);
    super.setState(fullState, () => {
      this.props.onSelect(fullState.selectedDevice, fullState.launchPackage);
      callback && callback();
    });
  }

  render() {
    return React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Device:"), React.createElement(_AdbDeviceSelector().AdbDeviceSelector, {
      onChange: this._handleDeviceChange,
      targetUri: this.props.targetUri
    }), React.createElement("label", null, "Package: "), this.state.packages.isPending ? React.createElement(_LoadingSpinner().LoadingSpinner, {
      size: "EXTRA_SMALL"
    }) : React.createElement(_Dropdown().Dropdown, {
      disabled: this.state.selectedDevice == null,
      options: this.state.packages.getOrDefault([]).map(packageName => {
        return {
          value: packageName,
          label: packageName
        };
      }),
      onChange: value => this.setState({
        launchPackage: value
      }),
      value: this.state.launchPackage
    }));
  }

}

exports.DeviceAndPackage = DeviceAndPackage;