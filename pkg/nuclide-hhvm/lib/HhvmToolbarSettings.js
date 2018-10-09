"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HhvmToolbarSettings = void 0;

var React = _interopRequireWildcard(require("react"));

function _Modal() {
  const data = require("../../../modules/nuclide-commons-ui/Modal");

  _Modal = function () {
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

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
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
class HhvmToolbarSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      args: this.props.projectStore.getScriptArguments()
    };
  }

  render() {
    return React.createElement(_Modal().Modal, {
      onDismiss: this.props.onDismiss
    }, React.createElement("div", {
      className: "block"
    }, React.createElement("div", {
      className: "block"
    }, React.createElement("h1", null, "Script Debug Settings"), React.createElement("label", null, "Script arguments:"), React.createElement(_AtomInput().AtomInput, {
      autofocus: true,
      value: this.state.args,
      onDidChange: newValue => this.setState({
        args: newValue
      }),
      size: "sm"
    })), React.createElement("div", {
      className: "nuclide-hhvm-toolbar-settings"
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: () => this.props.onDismiss()
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: () => {
        this.props.projectStore.setScriptArguments(this.state.args);
        this.props.onDismiss();
      }
    }, "Save")))));
  }

}

exports.HhvmToolbarSettings = HhvmToolbarSettings;