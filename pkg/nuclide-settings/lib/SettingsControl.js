Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = SettingsControl;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _SettingsCheckbox2;

function _SettingsCheckbox() {
  return _SettingsCheckbox2 = _interopRequireDefault(require('./SettingsCheckbox'));
}

var _SettingsInput2;

function _SettingsInput() {
  return _SettingsInput2 = _interopRequireDefault(require('./SettingsInput'));
}

var _SettingsSelect2;

function _SettingsSelect() {
  return _SettingsSelect2 = _interopRequireDefault(require('./SettingsSelect'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

function SettingsControl(props) {
  var keyPath = props.keyPath;
  var value = props.value;
  var onChange = props.onChange;
  var schema = props.schema;
  var description = schema.description;
  var title = schema.title;

  if (schema) {
    if (schema.enum) {
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsSelect2 || _SettingsSelect()).default, {
        description: description,
        keyPath: keyPath,
        onChange: onChange,
        title: title,
        value: value
      });
    } else if (schema.type === 'color') {
      (0, (_assert2 || _assert()).default)(false); // Not implemented.
    } else if (isBoolean(value) || schema.type === 'boolean') {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsCheckbox2 || _SettingsCheckbox()).default, {
          description: description,
          keyPath: keyPath,
          onChange: onChange,
          title: title,
          value: value
        });
      } else if (Array.isArray(value) || schema.type === 'array') {
        if (isEditableArray(value)) {
          return (_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsInput2 || _SettingsInput()).default, {
            description: description,
            keyPath: keyPath,
            onChange: onChange,
            title: title,
            value: value,
            type: 'array'
          });
        }
      } else if (isObject(value) || schema.type === 'object') {
        (0, (_assert2 || _assert()).default)(false); // Not implemented.
      } else {
          var type = isNumber(value) ? 'number' : 'string';
          return (_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsInput2 || _SettingsInput()).default, {
            description: description,
            keyPath: keyPath,
            onChange: onChange,
            title: title,
            value: value,
            type: type
          });
        }
  }

  return null;
}

function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

function isNumber(obj) {
  return toString.call(obj) === '[object Number]';
}

function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && Boolean(obj);
}

function isEditableArray(array) {
  for (var i = 0, len = array.length; i < len; i++) {
    var item = array[i];
    if (typeof item !== 'string') {
      return false;
    }
  }
  return true;
}
module.exports = exports.default;