'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selectors = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
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

const FB_HOST_SUFFIX = '.facebook.com';

class Selectors extends _react.Component {
  componentDidMount() {
    if (this.props.deviceTypes.length > 0) {
      this._setDeviceType(this.props.deviceTypes[0]);
    }
  }

  _getLabelForHost(host) {
    if (host === '') {
      return 'local';
    }
    const hostName = (_nuclideUri || _load_nuclideUri()).default.getHostname(host);
    return hostName.endsWith(FB_HOST_SUFFIX) ? hostName.substring(0, hostName.length - FB_HOST_SUFFIX.length) : hostName;
  }

  _getHostOptions() {
    return this.props.hosts.map(host => {
      return { value: host, label: this._getLabelForHost(host) };
    });
  }

  _getTypesButtons() {
    return this.props.deviceTypes.map(deviceType => {
      if (deviceType === this.props.deviceType) {
        return _react.createElement(
          (_Button || _load_Button()).Button,
          { key: deviceType, buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY },
          deviceType
        );
      }
      return _react.createElement(
        (_Button || _load_Button()).Button,
        {
          key: deviceType,
          onClick: () => this._setDeviceType(deviceType) },
        deviceType
      );
    });
  }

  _setDeviceType(deviceType) {
    this.props.setDeviceType(deviceType);
    this.props.toggleDevicePolling(true);
  }

  _getTypesSelector() {
    return _react.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
      this._getTypesButtons()
    );
  }

  _updateDeviceType() {
    if (this.props.deviceTypes.length > 0) {
      this._setDeviceType(this.props.deviceType != null ? this.props.deviceType : this.props.deviceTypes[0]);
    }
  }

  render() {
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'nuclide-device-panel-host-selector' },
        _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          options: this._getHostOptions(),
          onChange: host => {
            this.props.setHost(host);
            this._updateDeviceType();
          },
          value: this.props.host,
          key: 'connection'
        })
      ),
      this._getTypesSelector()
    );
  }
}
exports.Selectors = Selectors;