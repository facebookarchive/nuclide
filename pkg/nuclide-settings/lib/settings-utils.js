Object.defineProperty(exports, '__esModule', {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

function getConfigValueString(keyPath) {
  var value = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get(keyPath);
  return valueToString(value);
}

function normalizeIdentifier(id) {
  return id.replace(/[^A-Za-z0-9_-]/g, '_');
}

function isDefaultConfigValue(keyPath, value_) {
  var value = value_;
  var defaultValue = getDefaultConfigValueString(keyPath);
  if (value) {
    value = valueToString(value);
  } else {
    value = getConfigValueString(keyPath);
  }
  return !value || defaultValue === value;
}

function getDefaultConfigValue(keyPath) {
  var params = { excludeSources: [atom.config.getUserConfigPath()] };
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get(keyPath, params);
}

function getDefaultConfigValueString(keyPath) {
  return valueToString(getDefaultConfigValue(keyPath));
}

function parseValue(type, value) {
  var result = value;
  if (value === '') {
    result = undefined;
  } else if (type === 'number') {
    var floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      result = floatValue;
    }
  } else if (type === 'array') {
    var arrayValue = (value ? value : '').split(',');
    result = arrayValue.filter(function (item) {
      return Boolean(item);
    }).map(function (item) {
      return item.trim();
    });
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
  return str.replace(/\s+/g, '').replace(/\-+/g, '');
}

/** Returns true if filter matches search string. Return true if filter is empty. */

function matchesFilter(filter, searchString) {
  if (filter.length === 0) {
    return true;
  }
  var needle = strip(filter.toLowerCase());
  var hay = strip(searchString.toLowerCase());
  return hay.indexOf(needle) !== -1;
}