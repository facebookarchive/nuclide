"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DropdownButton = DropdownButton;
Object.defineProperty(exports, "ButtonSizes", {
  enumerable: true,
  get: function () {
    return _Button().ButtonSizes;
  }
});
exports.Dropdown = void 0;

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
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

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
} // For backwards compat, we have to do some conversion here.


class Dropdown extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleDropdownClick = event => {
      this._menu = this._menuFromOptions(this.props.options);

      this._menu.popup({
        x: event.clientX,
        y: event.clientY,
        async: true
      });

      event.stopPropagation();
    }, _temp;
  }

  componentWillUnmount() {
    this._closeMenu();
  }

  componentDidUpdate() {
    this._closeMenu();
  }

  _closeMenu() {
    if (this._menu != null) {
      this._menu.closePopup();

      this._menu = null;
    }
  }

  render() {
    const {
      label: providedLabel,
      options,
      placeholder
    } = this.props;
    let label;

    if (providedLabel != null) {
      label = providedLabel;
    } else {
      const selectedOption = this._findSelectedOption(options);

      if (selectedOption == null) {
        if (placeholder != null) {
          label = placeholder;
        } else {
          label = this._renderSelectedLabel(options[0]);
        }
      } else {
        label = this._renderSelectedLabel(selectedOption);
      }
    }

    return React.createElement(DropdownButton, {
      buttonType: this.props.buttonType,
      className: this.props.className,
      disabled: this.props.disabled,
      isFlat: this.props.isFlat,
      buttonComponent: this.props.buttonComponent,
      onExpand: this._handleDropdownClick,
      size: this.props.size,
      tooltip: this.props.tooltip
    }, label);
  }

  _renderSelectedLabel(option) {
    let text = null;

    if (option == null) {
      text = '';
    } else if (typeof option.selectedLabel === 'string') {
      text = option.selectedLabel;
    } else if (typeof option.label === 'string') {
      text = option.label;
    }

    if (text == null || text === '') {
      return null;
    }

    return text;
  }

  _menuFromOptions(options) {
    const menu = new remote.Menu();
    options.forEach(option => {
      if (option.type === 'separator') {
        menu.append(new remote.MenuItem({
          type: 'separator'
        }));
      } else if (option.type === 'submenu') {
        const submenu = option.submenu;
        menu.append(new remote.MenuItem({
          type: 'submenu',
          label: option.label,
          enabled: option.disabled !== true,
          submenu: this._menuFromOptions(submenu)
        }));
      } else {
        menu.append(new remote.MenuItem({
          type: 'checkbox',
          checked: this._optionIsSelected(this.props.value, option.value),
          label: option.label,
          enabled: option.disabled !== true,
          click: () => {
            if (this.props.onChange != null) {
              this.props.onChange(option.value);
            }
          }
        }));
      }
    });
    return menu;
  }

  _optionIsSelected(dropdownValue, optionValue) {
    return this.props.selectionComparator ? this.props.selectionComparator(dropdownValue, optionValue) : dropdownValue === optionValue;
  }

  _findSelectedOption(options) {
    let result = null;

    for (const option of options) {
      if (option.type === 'separator') {
        continue;
      } else if (option.type === 'submenu') {
        const submenu = option.submenu;
        result = this._findSelectedOption(submenu);
      } else if (this._optionIsSelected(this.props.value, option.value)) {
        result = option;
      }

      if (result) {
        break;
      }
    }

    return result;
  }

}

exports.Dropdown = Dropdown;
Dropdown.defaultProps = {
  className: '',
  disabled: false,
  isFlat: false,
  options: [],
  value: null,
  title: ''
};

const noop = () => {};
/**
 * Just the button part. This is useful for when you want to customize the dropdown behavior (e.g.)
 * show it asynchronously.
 */


function DropdownButton(props) {
  const ButtonComponent = props.buttonComponent || _Button().Button;

  const className = (0, _classnames().default)('nuclide-ui-dropdown', props.className, {
    'nuclide-ui-dropdown-flat': props.isFlat === true
  });
  const label = props.children == null ? null : React.createElement("span", {
    className: "nuclide-dropdown-label-text-wrapper"
  }, props.children);
  return React.createElement(ButtonComponent, {
    buttonType: props.buttonType,
    tooltip: props.tooltip,
    size: getButtonSize(props.size),
    className: className,
    disabled: props.disabled === true,
    onClick: props.onExpand || noop
  }, label, React.createElement(_Icon().Icon, {
    icon: "triangle-down",
    className: "nuclide-ui-dropdown-icon"
  }));
}

function getButtonSize(size) {
  switch (size) {
    case 'xs':
      return 'EXTRA_SMALL';

    case 'sm':
      return 'SMALL';

    case 'lg':
      return 'LARGE';

    default:
      return 'SMALL';
  }
}