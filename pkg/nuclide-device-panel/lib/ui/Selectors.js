'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selectors = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../modules/nuclide-commons-ui/Dropdown');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../../modules/nuclide-commons-ui/ButtonGroup');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FB_HOST_SUFFIX = '.facebook.com'; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         * 
                                         * @format
                                         */

class Selectors extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._getHostSelectorNodes = () => {
      return this.props.hostSelectorComponents.map(component => {
        const Type = component.type;
        return _react.createElement(Type, { key: component.key });
      });
    }, _temp;
  }

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

  _getHostSelector() {
    return _react.createElement(
      'div',
      { className: 'nuclide-device-panel-host-selector' },
      this._getHostSelectorNodes(),
      _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        options: this._getHostOptions(),
        onChange: host => {
          this.props.setHost(host);
          this._updateDeviceType();
        },
        value: this.props.host,
        key: 'connection'
      })
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
      { className: 'block nuclide-device-panel-navigation-row' },
      this._getTypesSelector(),
      this._getHostSelector()
    );
  }
}
exports.Selectors = Selectors;