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

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

var _reactForAtom = require('react-for-atom');

let SettingsCheckbox = class SettingsCheckbox extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleChange = this._handleChange.bind(this);
  }

  _handleChange(event) {
    const isChecked = event.target.checked;
    this.props.onChange(isChecked);
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_settingsUtils || _load_settingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    return _reactForAtom.React.createElement(
      'div',
      { className: 'checkbox' },
      _reactForAtom.React.createElement(
        'label',
        { htmlFor: id },
        _reactForAtom.React.createElement('input', {
          checked: value,
          id: id,
          onChange: this._handleChange,
          type: 'checkbox'
        }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'setting-title' },
          title
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'setting-description' },
        description
      )
    );
  }
};
exports.default = SettingsCheckbox;
module.exports = exports['default'];