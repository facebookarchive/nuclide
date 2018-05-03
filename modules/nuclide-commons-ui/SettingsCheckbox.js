'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _SettingsUtils;













function _load_SettingsUtils() {return _SettingsUtils = require('./SettingsUtils');}
var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}





class SettingsCheckbox extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.
    _handleChange = event => {
      const isChecked = event.target.checked;
      this.props.onChange(isChecked);
    }, _temp;}

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_SettingsUtils || _load_SettingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    return (
      _react.createElement('div', { className: 'checkbox' },
        _react.createElement('label', { htmlFor: id },
          _react.createElement('input', {
            checked: value,
            id: id,
            onChange: this._handleChange,
            type: 'checkbox' }),

          _react.createElement('div', { className: 'setting-title' }, title)),

        _react.createElement('div', { className: 'setting-description' }, description)));


  }}exports.default = SettingsCheckbox; /**
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