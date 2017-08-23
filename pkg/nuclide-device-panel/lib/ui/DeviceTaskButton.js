'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTaskButton = undefined;

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _react = _interopRequireDefault(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DeviceTaskButton extends _react.default.Component {

  render() {
    const options = this.props.actions;
    if (options.length === 0) {
      return _react.default.createElement('span', null);
    } else {
      const placeholder = _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: this.props.icon, title: this.props.title });
      return _react.default.createElement(
        'div',
        { className: 'nuclide-device-panel-device-action-button' },
        _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          isFlat: true,
          options: options.map(option => ({
            value: option,
            label: option.name
          })),
          placeholder: placeholder,
          size: 'xs',
          onChange: action => action != null && action.callback(this.props.device)
        })
      );
    }
  }
}
exports.DeviceTaskButton = DeviceTaskButton; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */