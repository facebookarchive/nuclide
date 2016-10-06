Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var _Icon2;

function _Icon() {
  return _Icon2 = require('./Icon');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _electron2;

function _electron() {
  return _electron2 = _interopRequireDefault(require('electron'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var remote = (_electron2 || _electron()).default.remote;

(0, (_assert2 || _assert()).default)(remote != null);

// For backwards compat, we have to do some conversion here.

var Dropdown = (function (_React$Component) {
  _inherits(Dropdown, _React$Component);

  _createClass(Dropdown, null, [{
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      isFlat: false,
      options: [],
      value: null,
      title: ''
    },
    enumerable: true
  }]);

  function Dropdown(props) {
    _classCallCheck(this, Dropdown);

    _get(Object.getPrototypeOf(Dropdown.prototype), 'constructor', this).call(this, props);
    this._handleDropdownClick = this._handleDropdownClick.bind(this);
  }

  _createClass(Dropdown, [{
    key: '_getButtonSize',
    value: function _getButtonSize(size) {
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
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var selectedOption = this.props.options.find(function (option) {
        return option.type !== 'separator' && option.value === _this.props.value;
      }) || this.props.options[0];

      var ButtonComponent = this.props.buttonComponent || (_Button2 || _Button()).Button;
      var className = (0, (_classnames2 || _classnames()).default)('nuclide-ui-dropdown', this.props.className, {
        'nuclide-ui-dropdown-flat': this.props.isFlat === true
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        ButtonComponent,
        {
          tooltip: this.props.tooltip,
          size: this._getButtonSize(this.props.size),
          className: className,
          disabled: this.props.disabled === true,
          onClick: this._handleDropdownClick },
        this._renderSelectedLabel(selectedOption),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, {
          icon: 'triangle-down',
          className: 'nuclide-ui-dropdown-icon'
        })
      );
    }
  }, {
    key: '_renderSelectedLabel',
    value: function _renderSelectedLabel(option) {
      var text = undefined;
      if (option == null) {
        text = '';
      } else if (option.selectedLabel != null) {
        text = option.selectedLabel;
      } else if (option.label != null) {
        text = option.label;
      }

      if (text == null || text === '') {
        return null;
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: 'nuclide-dropdown-label-text-wrapper' },
        text
      );
    }
  }, {
    key: '_handleDropdownClick',
    value: function _handleDropdownClick(event) {
      var _this2 = this;

      var currentWindow = remote.getCurrentWindow();
      var menu = new remote.Menu();
      this.props.options.forEach(function (option) {
        if (option.type === 'separator') {
          menu.append(new remote.MenuItem({ type: 'separator' }));
          return;
        }
        menu.append(new remote.MenuItem({
          type: 'checkbox',
          checked: _this2.props.value === option.value,
          label: option.label,
          enabled: option.disabled !== true,
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

  return Dropdown;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Dropdown = Dropdown;
exports.ButtonSizes = (_Button2 || _Button()).ButtonSizes;

// Normally, a dropdown is styled like a button. This prop allows you to avoid that.