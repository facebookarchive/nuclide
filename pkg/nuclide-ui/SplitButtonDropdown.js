'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonSizes = exports.SplitButtonDropdown = undefined;

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('./Dropdown');
}

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { remote } = _electron.default; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       */

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

class SplitButtonDropdown extends _react.default.Component {

  render() {
    const selectedOption = this._findSelectedOption(this.props.options) || this.props.options[0];

    if (!(selectedOption.type !== 'separator')) {
      throw new Error('Invariant violation: "selectedOption.type !== \'separator\'"');
    }

    const ButtonComponent = this.props.buttonComponent || (_Button || _load_Button()).Button;

    const dropdownOptions = this.props.options.map(option => Object.assign({}, option, {
      selectedLabel: ''
    }));

    return _react.default.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { className: 'nuclide-ui-split-button-dropdown' },
      _react.default.createElement(
        ButtonComponent,
        {
          size: this.props.size == null ? undefined : this.props.size,
          disabled: this.props.confirmDisabled === true,
          icon: selectedOption.icon || undefined,
          onClick: this.props.onConfirm },
        selectedOption.selectedLabel || selectedOption.label || ''
      ),
      _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        size: this._getDropdownSize(this.props.size),
        disabled: this.props.changeDisabled === true,
        options: dropdownOptions,
        value: this.props.value,
        onChange: this.props.onChange
      })
    );
  }

  _getDropdownSize(size) {
    switch (size) {
      case (_Button || _load_Button()).ButtonSizes.EXTRA_SMALL:
        return 'xs';
      case (_Button || _load_Button()).ButtonSizes.SMALL:
        return 'sm';
      case (_Button || _load_Button()).ButtonSizes.LARGE:
        return 'lg';
      default:
        return 'sm';
    }
  }

  _findSelectedOption(options) {
    let result = null;
    for (const option of options) {
      if (option.type === 'separator') {
        continue;
      } else if (option.type === 'submenu') {
        const submenu = option.submenu;
        result = this._findSelectedOption(submenu);
      } else if (option.value === this.props.value) {
        result = option;
      }

      if (result) {
        break;
      }
    }
    return result;
  }
}

exports.SplitButtonDropdown = SplitButtonDropdown;
exports.ButtonSizes = (_Button || _load_Button()).ButtonSizes;