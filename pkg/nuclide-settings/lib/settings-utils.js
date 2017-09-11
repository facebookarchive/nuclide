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
exports.strip = strip;
exports.matchesFilter = matchesFilter;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConfigValueString(keyPath) {
  const value = (_featureConfig || _load_featureConfig()).default.get(keyPath);
  return valueToString(value);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
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

// Remove spaces and hypens
function strip(str) {
  return str.replace(/\s+/g, '').replace(/-+/g, '');
}

/** Returns true if filter matches search string. Return true if filter is empty. */
function matchesFilter(filter, searchString) {
  if (filter.length === 0) {
    return true;
  }
  const needle = strip(filter.toLowerCase());
  const hay = strip(searchString.toLowerCase());
  return hay.indexOf(needle) !== -1;
}