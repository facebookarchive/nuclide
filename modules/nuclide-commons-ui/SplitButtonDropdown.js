"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ButtonSizes", {
  enumerable: true,
  get: function () {
    return _Button().ButtonSizes;
  }
});
exports.SplitButtonDropdown = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("./ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("./Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var _electron = _interopRequireDefault(require("electron"));

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
const {
  remote
} = _electron.default;

if (!(remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

class SplitButtonDropdown extends React.Component {
  render() {
    const {
      buttonComponent,
      changeDisabled,
      className,
      confirmDisabled,
      onChange,
      onConfirm,
      options,
      size,
      value,
      selectionComparator
    } = this.props;
    const selectedOption = this._findSelectedOption(options) || options[0];

    if (!(selectedOption.type !== 'separator')) {
      throw new Error("Invariant violation: \"selectedOption.type !== 'separator'\"");
    }

    const ButtonComponent = buttonComponent || _Button().Button; // $FlowFixMe(>=0.53.0) Flow suppress


    const dropdownOptions = options.map(option => Object.assign({}, option, {
      selectedLabel: ''
    }));
    return React.createElement(_ButtonGroup().ButtonGroup, {
      className: (0, _classnames().default)(className, 'nuclide-ui-split-button-dropdown')
    }, React.createElement(ButtonComponent, {
      buttonType: this.props.buttonType,
      size: size == null ? undefined : size,
      disabled: confirmDisabled === true,
      icon: selectedOption.icon || undefined,
      onClick: onConfirm.bind(null, value)
    }, // flowlint-next-line sketchy-null-mixed:off, sketchy-null-string:off
    selectedOption.selectedLabel || selectedOption.label || ''), React.createElement(_Dropdown().Dropdown, {
      buttonType: this.props.buttonType,
      size: this._getDropdownSize(size),
      disabled: changeDisabled === true,
      options: dropdownOptions,
      value: value,
      onChange: onChange,
      selectionComparator: selectionComparator
    }));
  }

  _getDropdownSize(size) {
    switch (size) {
      case _Button().ButtonSizes.EXTRA_SMALL:
        return 'xs';

      case _Button().ButtonSizes.SMALL:
        return 'sm';

      case _Button().ButtonSizes.LARGE:
        return 'lg';

      default:
        return 'sm';
    }
  }

  _findSelectedOption(options) {
    let result = null;
    const selectionComparator = this.props.selectionComparator == null ? (a, b) => a === b : this.props.selectionComparator;

    for (const option of options) {
      if (option.type === 'separator') {
        continue;
      } else if (option.type === 'submenu') {
        const submenu = option.submenu;
        result = this._findSelectedOption(submenu);
      } else if (selectionComparator(option.value, this.props.value)) {
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