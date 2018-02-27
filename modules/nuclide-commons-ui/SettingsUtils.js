'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeIdentifier = normalizeIdentifier;
exports.isDefaultConfigValue = isDefaultConfigValue;
exports.getDefaultConfigValue = getDefaultConfigValue;
exports.getDefaultConfigValueString = getDefaultConfigValueString;
exports.parseValue = parseValue;
exports.valueToString = valueToString;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConfigValueString(keyPath) {
  const value = (_featureConfig || _load_featureConfig()).default.get(keyPath);
  return valueToString(value);
} /**
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

function normalizeIdentifier(id) {
  return id.replace(/[^A-Za-z0-9_-]/g, '_');
}

function isDefaultConfigValue(keyPath, value_) {
  let value = value_;
  const defaultValue = getDefaultConfigValueString(keyPath);
  if (value) {
    value = valueToString(value);
  } else {
    value = getConfigValueString(keyPath);
  }
  return !value || defaultValue === value;
}

function getDefaultConfigValue(keyPath) {
  const params = { excludeSources: [atom.config.getUserConfigPath()] };
  return (_featureConfig || _load_featureConfig()).default.get(keyPath, params);
}

function getDefaultConfigValueString(keyPath) {
  return valueToString(getDefaultConfigValue(keyPath));
}

function parseValue(type, value) {
  let result = value;
  if (value === '') {
    result = undefined;
  } else if (type === 'number') {
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      result = floatValue;
    }
  } else if (type === 'array') {
    const arrayValue = (value ? value : '').split(',');
    result = arrayValue.filter(item => Boolean(item)).map(item => item.trim());
  }
  return result;
}

function valueToString(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value != null ? value.toString() : '';
  }
}