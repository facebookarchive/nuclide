'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _SettingsUtils;













function _load_SettingsUtils() {return _SettingsUtils = require('./SettingsUtils');}
var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}





class SettingsColorInput extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.
    _handleChange = event => {
      const value = event.target.value;
      this.props.onChange(value);
    }, _temp;}

  render() {
    const { keyPath, title, description, value } = this.props;
    const id = (0, (_SettingsUtils || _load_SettingsUtils()).normalizeIdentifier)(keyPath);

    return (
      _react.createElement('div', { className: 'color' },
        _react.createElement('label', { className: 'control-label' },
          _react.createElement('input', {
            id: id,
            type: 'color',
            onChange: this._handleChange,
            value: value.toHexString() }),

          _react.createElement('div', { className: 'setting-title' }, title)),

        _react.createElement('div', { className: 'setting-description' }, description)));


  }}exports.default = SettingsColorInput; /**
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