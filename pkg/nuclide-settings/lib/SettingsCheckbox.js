'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SettingsCheckbox extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleChange = event => {
      const isChecked = event.target.checked;
      this.props.onChange(isChecked);
    }, _temp;
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_settingsUtils || _load_settingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    return _react.default.createElement(
      'div',
      { className: 'checkbox' },
      _react.default.createElement(
        'label',
        { htmlFor: id },
        _react.default.createElement('input', {
          checked: value,
          id: id,
          onChange: this._handleChange,
          type: 'checkbox'
        }),
        _react.default.createElement(
          'div',
          { className: 'setting-title' },
          title
        )
      ),
      _react.default.createElement(
        'div',
        { className: 'setting-description' },
        description
      )
    );
  }
}
exports.default = SettingsCheckbox; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     * @format
                                     */