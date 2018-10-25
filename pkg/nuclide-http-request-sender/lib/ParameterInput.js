"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParameterInput = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class ParameterInput extends React.Component {
  constructor(props) {
    super(props);
    this._handleUpdateKey = this._handleUpdateKey.bind(this);
    this._handleUpdateValue = this._handleUpdateValue.bind(this);
    this._handleRemoveParameter = this._handleRemoveParameter.bind(this);
    this._getErrorStyle = this._getErrorStyle.bind(this);
  }

  _handleUpdateKey(newKey) {
    this.props.updateParameter(this.props.index, {
      key: newKey,
      value: this.props.paramValue
    });
  }

  _handleUpdateValue(newValue) {
    this.props.updateParameter(this.props.index, {
      key: this.props.paramKey,
      value: newValue
    });
  }

  _handleRemoveParameter() {
    this.props.removeParameter(this.props.index);
  }

  _getErrorStyle() {
    return this.props.isDuplicate ? {
      borderColor: '#ff6347',
      boxShadow: '0 0 0 1px #ff6347',
      backgroundColor: '#312426'
    } : null;
  }

  render() {
    const style = this._getErrorStyle();

    return React.createElement("div", null, React.createElement("div", {
      className: "nuclide-parameter-container"
    }, React.createElement("div", {
      className: "nuclide-parameter-input-container"
    }, React.createElement(_AtomInput().AtomInput, {
      onDidChange: this._handleUpdateKey,
      initialValue: this.props.paramKey,
      style: style
    }), React.createElement(_AtomInput().AtomInput, {
      onDidChange: this._handleUpdateValue,
      initialValue: this.props.paramValue,
      style: style
    })), React.createElement(_Button().Button, {
      className: "nuclide-parameter-button",
      onClick: this._handleRemoveParameter
    }, "X")));
  }

}

exports.ParameterInput = ParameterInput;