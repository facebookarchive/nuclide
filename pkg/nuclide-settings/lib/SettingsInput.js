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
exports.default = undefined;

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _reactForAtom = require('react-for-atom');

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

let SettingsInput = class SettingsInput extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._ignoreInputCallback = false;

    this._handleChange = this._handleChange.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
  }

  _updateInput(input, newValue) {
    this._ignoreInputCallback = true;
    input.setText(newValue);
    this._ignoreInputCallback = false;
  }

  _handleChange(newValue_) {
    let newValue = newValue_;
    if (this._ignoreInputCallback) {
      return;
    }

    newValue = (0, (_settingsUtils || _load_settingsUtils()).parseValue)(this.props.type, newValue);
    this.props.onChange(newValue);
  }

  _onFocus() {
    const keyPath = this.props.keyPath;
    const input = this.refs[keyPath];
    if ((0, (_settingsUtils || _load_settingsUtils()).isDefaultConfigValue)(keyPath)) {
      const defaultValue = (0, (_settingsUtils || _load_settingsUtils()).getDefaultConfigValueString)(keyPath);
      this._updateInput(input, defaultValue);
    }
  }

  _onBlur() {
    const keyPath = this.props.keyPath;
    const input = this.refs[keyPath];
    if ((0, (_settingsUtils || _load_settingsUtils()).isDefaultConfigValue)(keyPath, input.getText())) {
      this._updateInput(input, '');
    }
  }

  _getValue() {
    let value = (0, (_settingsUtils || _load_settingsUtils()).valueToString)(this.props.value);

    const defaultValue = (0, (_settingsUtils || _load_settingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
    if (defaultValue === value) {
      value = '';
    }

    return value;
  }

  _getPlaceholder() {
    const defaultValue = (0, (_settingsUtils || _load_settingsUtils()).getDefaultConfigValueString)(this.props.keyPath);
    return defaultValue ? 'Default: ' + defaultValue : '';
  }

  // $FlowIgnore: This method requires declaring State's type
  componentDidUpdate(prevProps, prevState) {
    const input = this.refs[this.props.keyPath];
    const value = this._getValue();
    if (input.getText() !== value) {
      this._updateInput(input, value);
    }
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_settingsUtils || _load_settingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this._getValue();
    const placeholder = this._getPlaceholder();

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'label',
        { className: 'control-label' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'setting-title' },
          title
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'setting-description' },
          description
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'controls' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'editor-container' },
          _reactForAtom.React.createElement(
            'subview',
            null,
            _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
              className: id,
              initialValue: value,
              onDidChange: this._handleChange,
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
};
exports.default = SettingsInput;
module.exports = exports['default'];