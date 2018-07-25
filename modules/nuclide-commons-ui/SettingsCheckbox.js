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
class SettingsCheckbox extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleChange = event => {
      const isChecked = event.target.checked;
      this.props.onChange(isChecked);
    }, _temp;
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, _SettingsUtils().normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;
    return React.createElement("div", {
      className: "checkbox"
    }, React.createElement("label", {
      htmlFor: id
    }, React.createElement("input", {
      checked: value,
      id: id,
      onChange: this._handleChange,
      type: "checkbox"
    }), React.createElement("div", {
      className: "setting-title"
    }, title)), React.createElement("div", {
      className: "setting-description"
    }, description));
  }

}

exports.default = SettingsCheckbox;