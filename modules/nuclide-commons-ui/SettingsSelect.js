'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _featureConfig;













function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../nuclide-commons-atom/feature-config'));}var _SettingsUtils;
function _load_SettingsUtils() {return _SettingsUtils = require('./SettingsUtils');}
var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                                                                                                                                      * @format
                                                                                                                                                                                                                                                                                                                                                                                                                      */class SettingsSelect extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this._handleChange = event => {const value = event.target.value;this.props.onChange(value);}, _temp;}

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, (_SettingsUtils || _load_SettingsUtils()).normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    const options = (_featureConfig || _load_featureConfig()).default.getSchema(keyPath);

    const optionElements = [];
    if (options.enum) {
      options.enum.forEach((option, i) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionDescription =
        typeof option === 'object' ? option.description : option;
        optionElements.push(
        _react.createElement('option', { value: optionValue, key: i },
          optionDescription));


      });
    }

    return (
      _react.createElement('div', null,
        _react.createElement('label', { className: 'control-label' },
          _react.createElement('div', { className: 'setting-title' }, title),
          _react.createElement('div', { className: 'setting-description' }, description)),

        _react.createElement('select', {
            className: 'form-control',
            id: id,
            onChange: this._handleChange,
            value: value },
          optionElements)));



  }}exports.default = SettingsSelect;