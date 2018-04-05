'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('./AtomInput');
}

var _react = _interopRequireWildcard(require('react'));

var _SettingsUtils;

function _load_SettingsUtils() {
  return _SettingsUtils = require('./SettingsUtils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class SettingsInput extends _react.Component {

  constructor(props) {
    super(props);

    this._handleChange = newValue_ => {
      let newValue = newValue_;
      if (this._ignoreInputCallback) {
        return;
      }

      newValue = (0, (_SettingsUtils || _load_SettingsUtils()).parseValue)(this.props.type, newValue);
      this.props.onChange(newValue);
    };

    this._onFocus = () => {
      const keyPath = this.props.keyPath;
      const input = this._input;

      if (!(input != null)) {
        throw new Error('Invariant violation: "input != null"');
      }

      if ((0, (_SettingsUtils || _load_SettingsUtils()).isDefaultConfigValue)(keyPath)) {
        const defaultValue = (0, (_SettingsUtils || _load_SettingsUtils()).getDefaultConfigValueString)(keyPath);
        this._updateInput(input, defaultValue);
      }
    };

    this._onBlur = () => {
      const keyPath = this.props.keyPath;
      const input = this._input;

      if (!(input != null)) {
        throw new Error('Invariant violation: "input != null"');
      }

      if ((0, (_SettingsUtils || _load_SettingsUtils()).isDefaultConfigValue)(keyPath, input.getText())) {
        this._updateInput(input, '');
      }
    };

    this._ignoreInputCallback = false;
  }

  _updateInput(input, newValue) {
    this._ignoreInputCallback = true;
    input.setText(newValue);
    this._ignoreInputCallback = false;
  }

  _getValue() {
    let value = (0, (_SettingsUtils || _load_SettingsUtils()).valueToString)(this.props.value);

    const defaultValue = (0, (_SettingsUtils || _load_SettingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
    if (defaultValue === value) {
      value = '';
    }

    return value;
  }

  _getPlaceholder() {
    const defaultValue = (0, (_SettingsUtils || _load_SettingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
    return defaultValue ? 'Default: ' + defaultValue : '';
  }

  componentDidUpdate(prevProps) {
    const input = this._input;

    if (!(input != null)) {
      throw new Error('Invariant violation: "input != null"');
    }

    const value = this._getValue();
    if (input.getText() !== value) {
      this._updateInput(input, value);
    }
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_SettingsUtils || _load_SettingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this._getValue();
    const placeholder = this._getPlaceholder();

    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'label',
        { className: 'control-label' },
        _react.createElement(
          'div',
          { className: 'setting-title' },
          title
        ),
        _react.createElement(
          'div',
          { className: 'setting-description' },
          description
        )
      ),
      _react.createElement(
        'div',
        { className: 'controls' },
        _react.createElement(
          'div',
          { className: 'editor-container' },
          _react.createElement(
            'subview',
            null,
            _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
              className: id,
              initialValue: value,
              onDidChange: this._handleChange,
              onFocus: this._onFocus,
              onBlur: this._onBlur,
              placeholderText: placeholder,
              ref: input => {
                this._input = input;
              },
              text: value
            })
          )
        )
      )
    );
  }
}
exports.default = SettingsInput; /**
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