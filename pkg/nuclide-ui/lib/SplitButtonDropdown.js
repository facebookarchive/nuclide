Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _remote2;

function _remote() {
  return _remote2 = _interopRequireDefault(require('remote'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var _ButtonGroup2;

function _ButtonGroup() {
  return _ButtonGroup2 = require('./ButtonGroup');
}

var Menu = (_remote2 || _remote()).default.require('menu');
var MenuItem = (_remote2 || _remote()).default.require('menu-item');

var SplitButtonDropdown = (function (_React$Component) {
  _inherits(SplitButtonDropdown, _React$Component);

  function SplitButtonDropdown(props) {
    _classCallCheck(this, SplitButtonDropdown);

    _get(Object.getPrototypeOf(SplitButtonDropdown.prototype), 'constructor', this).call(this, props);
    this._handleDropdownClick = this._handleDropdownClick.bind(this);
  }

  _createClass(SplitButtonDropdown, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var selectedOption = this.props.options.find(function (option) {
        return option.value === _this.props.value;
      }) || this.props.options[0];

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        { className: 'nuclide-ui-split-button-dropdown' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          {
            size: this.props.size,
            disabled: this.props.confirmDisabled === true,
            icon: selectedOption.icon,
            onClick: this.props.onConfirm },
          selectedOption.label
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, {
          size: this.props.size,
          className: 'nuclide-ui-split-button-dropdown-toggle',
          disabled: this.props.changeDisabled === true,
          icon: 'triangle-down',
          onClick: this._handleDropdownClick
        })
      );
    }
  }, {
    key: '_handleDropdownClick',
    value: function _handleDropdownClick(event) {
      var _this2 = this;

      var currentWindow = (_remote2 || _remote()).default.getCurrentWindow();
      var menu = new Menu();
      this.props.options.forEach(function (option) {
        menu.append(new MenuItem({
          type: 'checkbox',
          checked: _this2.props.value === option.value,
          label: option.label,
          click: function click() {
            if (_this2.props.onChange != null) {
              _this2.props.onChange(option.value);
            }
          }
        }));
      });
      menu.popup(currentWindow, event.clientX, event.clientY);
    }
  }]);

  return SplitButtonDropdown;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.SplitButtonDropdown = SplitButtonDropdown;
exports.ButtonSizes = (_Button2 || _Button()).ButtonSizes;