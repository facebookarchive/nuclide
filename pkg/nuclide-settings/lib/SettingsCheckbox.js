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

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var SettingsCheckbox = (function (_React$Component) {
  _inherits(SettingsCheckbox, _React$Component);

  function SettingsCheckbox(props) {
    _classCallCheck(this, SettingsCheckbox);

    _get(Object.getPrototypeOf(SettingsCheckbox.prototype), 'constructor', this).call(this, props);
    this._handleChange = this._handleChange.bind(this);
  }

  _createClass(SettingsCheckbox, [{
    key: '_handleChange',
    value: function _handleChange(event) {
      var isChecked = event.target.checked;
      this.props.onChange(isChecked);
    }
  }, {
    key: 'render',
    value: function render() {
      var keyPath = this.props.keyPath;
      var id = (0, (_settingsUtils || _load_settingsUtils()).normalizeIdentifier)(keyPath);
      var title = this.props.title;
      var description = this.props.description;
      var value = this.props.value;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'checkbox' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'label',
          { htmlFor: id },
          (_reactForAtom || _load_reactForAtom()).React.createElement('input', {
            checked: value,
            id: id,
            onChange: this._handleChange,
            type: 'checkbox'
          }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'setting-title' },
            title
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'setting-description' },
          description
        )
      );
    }
  }]);

  return SettingsCheckbox;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = SettingsCheckbox;
module.exports = exports.default;