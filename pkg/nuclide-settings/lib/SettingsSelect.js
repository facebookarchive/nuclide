'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SettingsSelect extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleChange = event => {
      const value = event.target.value;
      this.props.onChange(value);
    }, _temp;
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_settingsUtils || _load_settingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    const options = (_featureConfig || _load_featureConfig()).default.getSchema(keyPath);

    const optionElements = [];
    if (options.enum) {
      options.enum.forEach((option, i) => {
        optionElements.push(_react.default.createElement(
          'option',
          { value: option, key: i },
          option
        ));
      });
    }

    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'label',
        { className: 'control-label' },
        _react.default.createElement(
          'div',
          { className: 'setting-title' },
          title
        ),
        _react.default.createElement(
          'div',
          { className: 'setting-description' },
          description
        )
      ),
      _react.default.createElement(
        'select',
        {
          className: 'form-control',
          id: id,
          onChange: this._handleChange,
          value: value },
        optionElements
      )
    );
  }
}
exports.default = SettingsSelect; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   * @format
                                   */