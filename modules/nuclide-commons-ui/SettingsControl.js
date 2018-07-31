"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SettingsControl;

function _SettingsCheckbox() {
  const data = _interopRequireDefault(require("./SettingsCheckbox"));

  _SettingsCheckbox = function () {
    return data;
  };

  return data;
}

function _SettingsInput() {
  const data = _interopRequireDefault(require("./SettingsInput"));

  _SettingsInput = function () {
    return data;
  };

  return data;
}

function _SettingsSelect() {
  const data = _interopRequireDefault(require("./SettingsSelect"));

  _SettingsSelect = function () {
    return data;
  };

  return data;
}

function _SettingsColorInput() {
  const data = _interopRequireDefault(require("./SettingsColorInput"));

  _SettingsColorInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
function SettingsControl(props) {
  const {
    keyPath,
    value,
    onChange,
    schema
  } = props;
  const {
    description,
    title
  } = schema;

  if (schema) {
    if (schema.enum) {
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_SettingsSelect().default, {
          description: description,
          keyPath: keyPath,
          onChange: onChange,
          title: title,
          value: value
        })
      );
    } else if (schema.type === 'color') {
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_SettingsColorInput().default, {
          description: description,
          keyPath: keyPath,
          onChange: onChange,
          title: title,
          value: value
        })
      );
    } else if (isBoolean(value) || schema.type === 'boolean') {
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_SettingsCheckbox().default, {
          description: description,
          keyPath: keyPath,
          onChange: onChange,
          title: title,
          value: value
        })
      );
    } else if (Array.isArray(value) || schema.type === 'array') {
      if (isEditableArray(value)) {
        return (// $FlowFixMe(>=0.53.0) Flow suppress
          React.createElement(_SettingsInput().default, {
            description: description,
            keyPath: keyPath,
            onChange: onChange,
            title: title,
            value: value,
            type: "array"
          })
        );
      }
    } else if (isObject(value) || schema.type === 'object') {
      if (!false) {
        throw new Error("Invariant violation: \"false\"");
      } // Not implemented.

    } else {
      const type = isNumber(value) ? 'number' : 'string';
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_SettingsInput().default, {
          description: description,
          keyPath: keyPath,
          onChange: onChange,
          title: title,
          value: value,
          type: type
        })
      );
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
  const type = typeof obj;
  return type === 'function' || type === 'object' && Boolean(obj);
}

function isEditableArray(array) {
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i];

    if (typeof item !== 'string') {
      return false;
    }
  }

  return true;
}