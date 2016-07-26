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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _remote2;

function _remote() {
  return _remote2 = _interopRequireDefault(require('remote'));
}

var PromptButton = (function (_React$Component) {
  _inherits(PromptButton, _React$Component);

  function PromptButton(props) {
    _classCallCheck(this, PromptButton);

    _get(Object.getPrototypeOf(PromptButton.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(PromptButton, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: 'nuclide-console-prompt-wrapper', onClick: this._handleClick },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'nuclide-console-prompt-label' },
          this.props.children
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-chevron-right' })
      );
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(event) {
      var _this = this;

      var Menu = (_remote2 || _remote()).default.require('menu');
      var MenuItem = (_remote2 || _remote()).default.require('menu-item');
      var currentWindow = (_remote2 || _remote()).default.getCurrentWindow();
      var menu = new Menu();
      // TODO: Sort alphabetically by label
      this.props.options.forEach(function (option) {
        menu.append(new MenuItem({
          type: 'checkbox',
          checked: _this.props.value === option.id,
          label: option.label,
          click: function click() {
            return _this.props.onChange(option.id);
          }
        }));
      });
      menu.popup(currentWindow, event.clientX, event.clientY);
    }
  }]);

  return PromptButton;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = PromptButton;
module.exports = exports.default;