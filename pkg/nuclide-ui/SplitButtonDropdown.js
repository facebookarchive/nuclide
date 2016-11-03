'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonSizes = exports.SplitButtonDropdown = undefined;

var _reactForAtom = require('react-for-atom');

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

const remote = _electron.default.remote;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

let SplitButtonDropdown = exports.SplitButtonDropdown = class SplitButtonDropdown extends _reactForAtom.React.Component {

  render() {
    const selectedOption = this.props.options.find(option => option.type !== 'separator' && option.value === this.props.value) || this.props.options[0];

    if (!(selectedOption.type !== 'separator')) {
      throw new Error('Invariant violation: "selectedOption.type !== \'separator\'"');
    }

    const ButtonComponent = this.props.buttonComponent || (_Button || _load_Button()).Button;

    const dropdownOptions = this.props.options.map(option => Object.assign({}, option, {
      selectedLabel: ''
    }));

    return _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { className: 'nuclide-ui-split-button-dropdown' },
      _reactForAtom.React.createElement(
        ButtonComponent,
        {
          size: this.props.size == null ? undefined : this.props.size,
          disabled: this.props.confirmDisabled === true,
          icon: selectedOption.icon || undefined,
          onClick: this.props.onConfirm },
        selectedOption.selectedLabel || selectedOption.label || ''
      ),
      _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
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

};
exports.ButtonSizes = (_Button || _load_Button()).ButtonSizes;