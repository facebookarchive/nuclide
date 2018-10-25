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
exports.DropdownButton = exports.Dropdown = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

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

function _electronRemote() {
  const data = _interopRequireDefault(require("../nuclide-commons/electron-remote"));

  _electronRemote = function () {
    return data;
  };

  return data;
}

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
if (!(_electronRemote().default != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
} // For backwards compat, we have to do some conversion here.


class Dropdown extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._updateButtonRef = button => {
      this._button = button;
    }, this._openMenu = event => {
      const buttonRect = (0, _nullthrows().default)(this._button).getBoundingClientRect();
      this._menu = this._menuFromOptions(this.props.options);

      this._menu.popup({
        x: Math.floor(buttonRect.left),
        y: Math.floor(buttonRect.bottom),
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
      onButtonDOMNodeChange: this._updateButtonRef,
      isFlat: this.props.isFlat,
      buttonComponent: this.props.buttonComponent,
      onExpand: this._openMenu,
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
    const menu = new (_electronRemote().default.Menu)();
    options.forEach(option => {
      if (option.type === 'separator') {
        menu.append(new (_electronRemote().default.MenuItem)({
          type: 'separator'
        }));
      } else if (option.type === 'submenu') {
        const submenu = option.submenu;
        menu.append(new (_electronRemote().default.MenuItem)({
          type: 'submenu',
          label: option.label,
          enabled: option.disabled !== true,
          submenu: this._menuFromOptions(submenu)
        }));
      } else if (!Boolean(option.hidden)) {
        menu.append(new (_electronRemote().default.MenuItem)({
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


class DropdownButton extends React.Component {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this._handleButtonDOMNodeChange = button => {
      this._button = button;

      if (this.props.onButtonDOMNodeChange != null) {
        this.props.onButtonDOMNodeChange(button);
      }
    }, _temp2;
  }

  componentDidMount() {
    this._disposable = atom.commands.add((0, _nullthrows().default)(this._button), 'core:move-down', ({
      originalEvent
    }) => {
      if (!(originalEvent instanceof KeyboardEvent)) {
        throw new Error("Invariant violation: \"originalEvent instanceof KeyboardEvent\"");
      }

      if (this.props.onExpand != null) {
        this.props.onExpand(originalEvent);
      }
    });
  }

  componentWillUnmount() {
    (0, _nullthrows().default)(this._disposable).dispose();
  }

  render() {
    const {
      buttonComponent,
      buttonType,
      children,
      disabled,
      isFlat,
      onExpand,
      size,
      tooltip
    } = this.props;

    const ButtonComponent = buttonComponent || _Button().Button;

    const className = (0, _classnames().default)('nuclide-ui-dropdown', this.props.className, {
      'nuclide-ui-dropdown-flat': isFlat === true
    });
    const label = children == null ? React.createElement("span", {
      className: "sr-only"
    }, "Open Dropdown") : React.createElement("span", {
      className: "nuclide-dropdown-label-text-wrapper"
    }, children);
    return React.createElement(ButtonComponent, {
      buttonType: buttonType,
      onButtonDOMNodeChange: this._handleButtonDOMNodeChange,
      tooltip: tooltip,
      size: getButtonSize(size),
      className: className,
      disabled: disabled === true,
      onClick: onExpand || noop
    }, label, React.createElement(_Icon().Icon, {
      icon: "triangle-down",
      className: "nuclide-ui-dropdown-icon"
    }));
  }

}

exports.DropdownButton = DropdownButton;

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