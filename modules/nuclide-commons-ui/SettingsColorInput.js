"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _SettingsUtils() {
  const data = require("./SettingsUtils");

  _SettingsUtils = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class SettingsColorInput extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleChange = event => {
      const value = event.target.value;
      this.props.onChange(value);
    }, _temp;
  }

  render() {
    const {
      keyPath,
      title,
      description,
      value
    } = this.props;
    const id = (0, _SettingsUtils().normalizeIdentifier)(keyPath);
    return React.createElement("div", {
      className: "color"
    }, React.createElement("label", {
      className: "control-label"
    }, React.createElement("input", {
      id: id,
      type: "color",
      onChange: this._handleChange,
      value: value.toHexString()
    }), React.createElement("div", {
      className: "setting-title"
    }, title)), React.createElement("div", {
      className: "setting-description"
    }, description));
  }

}

exports.default = SettingsColorInput;