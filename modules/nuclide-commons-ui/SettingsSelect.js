"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _SettingsUtils() {
  const data = require("./SettingsUtils");

  _SettingsUtils = function () {
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
class SettingsSelect extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleChange = event => {
      const value = event.target.value;
      this.props.onChange(value);
    }, _temp;
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, _SettingsUtils().normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    const options = _featureConfig().default.getSchema(keyPath);

    const optionElements = [];

    if (options.enum) {
      options.enum.forEach((option, i) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionDescription = typeof option === 'object' ? option.description : option;
        optionElements.push(React.createElement("option", {
          value: optionValue,
          key: i
        }, optionDescription));
      });
    }

    return React.createElement("div", null, React.createElement("label", {
      className: "control-label"
    }, React.createElement("div", {
      className: "setting-title"
    }, title), React.createElement("div", {
      className: "setting-description"
    }, description)), React.createElement("select", {
      className: "form-control",
      id: id,
      onChange: this._handleChange,
      value: value
    }, optionElements));
  }

}

exports.default = SettingsSelect;