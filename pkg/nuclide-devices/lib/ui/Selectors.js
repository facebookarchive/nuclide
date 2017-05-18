'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selectors = undefined;

var _react = _interopRequireDefault(require('react'));

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

class Selectors extends _react.default.Component {

  _getHostOptions() {
    return this.props.hosts.map(host => {
      return host.endsWith(FB_HOST_SUFFIX) ? host.substring(0, host.length - FB_HOST_SUFFIX.length) : host;
    }).map(host => ({ value: host, label: host }));
  }

  _getTypesButtons() {
    return this.props.deviceTypes.map(deviceType => {
      if (deviceType === this.props.deviceType) {
        return _react.default.createElement(
          (_Button || _load_Button()).Button,
          { key: deviceType, buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY },
          deviceType
        );
      }
      return _react.default.createElement(
        (_Button || _load_Button()).Button,
        {
          key: deviceType,
          onClick: () => this.props.setDeviceType(deviceType) },
        deviceType
      );
    });
  }

  _getTypesSelector() {
    return _react.default.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
      this._getTypesButtons()
    );
  }

  render() {
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'div',
        { className: 'nuclide-device-panel-host-selector' },
        _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          options: this._getHostOptions(),
          onChange: this.props.setHost,
          value: this.props.host,
          key: 'connection'
        })
      ),
      this._getTypesSelector()
    );
  }
}
exports.Selectors = Selectors;