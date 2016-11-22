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

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let SettingsSelect = class SettingsSelect extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleChange = this._handleChange.bind(this);
  }

  _handleChange(event) {
    const value = event.target.value;
    this.props.onChange(value);
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
        optionElements.push(_reactForAtom.React.createElement(
          'option',
          { value: option, key: i },
          option
        ));
      });
    }

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
};
exports.default = SettingsSelect;
module.exports = exports['default'];