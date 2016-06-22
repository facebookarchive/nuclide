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

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _settingsUtils2;

function _settingsUtils() {
  return _settingsUtils2 = require('./settings-utils');
}

var SettingsInput = (function (_React$Component) {
  _inherits(SettingsInput, _React$Component);

  function SettingsInput(props) {
    _classCallCheck(this, SettingsInput);

    _get(Object.getPrototypeOf(SettingsInput.prototype), 'constructor', this).call(this, props);
    this._ignoreInputCallback = false;

    this._onChanged = this._onChanged.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
  }

  _createClass(SettingsInput, [{
    key: '_updateInput',
    value: function _updateInput(input, newValue) {
      this._ignoreInputCallback = true;
      input.setText(newValue);
      this._ignoreInputCallback = false;
    }
  }, {
    key: '_onChanged',
    value: function _onChanged(newValue) {
      if (this._ignoreInputCallback) {
        return;
      }

      newValue = (0, (_settingsUtils2 || _settingsUtils()).parseValue)(this.props.type, newValue);
      this.props.onChanged({
        keyPath: this.props.keyPath,
        newValue: newValue
      });
    }
  }, {
    key: '_onFocus',
    value: function _onFocus() {
      var keyPath = this.props.keyPath;
      var input = this.refs[keyPath];
      if ((0, (_settingsUtils2 || _settingsUtils()).isDefaultConfigValue)(keyPath)) {
        var defaultValue = (0, (_settingsUtils2 || _settingsUtils()).getDefaultConfigValueString)(keyPath);
        this._updateInput(input, defaultValue);
      }
    }
  }, {
    key: '_onBlur',
    value: function _onBlur() {
      var keyPath = this.props.keyPath;
      var input = this.refs[keyPath];
      if ((0, (_settingsUtils2 || _settingsUtils()).isDefaultConfigValue)(keyPath, input.getText())) {
        this._updateInput(input, '');
      }
    }
  }, {
    key: '_getValue',
    value: function _getValue() {
      var value = (0, (_settingsUtils2 || _settingsUtils()).valueToString)(this.props.value);

      var defaultValue = (0, (_settingsUtils2 || _settingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
      if (defaultValue === value) {
        value = '';
      }

      return value;
    }
  }, {
    key: '_getPlaceholder',
    value: function _getPlaceholder() {
      var defaultValue = (0, (_settingsUtils2 || _settingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
      return defaultValue ? 'Default: ' + defaultValue : '';
    }

    // $FlowIgnore: This method requires declaring State's type
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var input = this.refs[this.props.keyPath];
      var value = this._getValue();
      if (input.getText() !== value) {
        this._updateInput(input, value);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var keyPath = this.props.keyPath;
      var id = (0, (_settingsUtils2 || _settingsUtils()).normalizeIdentifier)(keyPath);
      var title = this.props.title;
      var description = this.props.description;
      var value = this._getValue();
      var placeholder = this._getPlaceholder();

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          { className: 'control-label' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'setting-title' },
            title
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'setting-description' },
            description
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'controls' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'editor-container' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'subview',
              null,
              (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
                className: id,
                initialValue: value,
                onDidChange: this._onChanged,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                placeholderText: placeholder,
                ref: keyPath,
                text: value
              })
            )
          )
        )
      );
    }
  }]);

  return SettingsInput;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SettingsInput;
module.exports = exports.default;