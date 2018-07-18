"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _Modal() {
  const data = require("../../../../../modules/nuclide-commons-ui/Modal");

  _Modal = function () {
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
class SwiftPMSettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configuration: props.configuration,
      Xcc: props.Xcc,
      Xlinker: props.Xlinker,
      Xswiftc: props.Xswiftc,
      buildPath: props.buildPath
    };
  }

  render() {
    return React.createElement(_Modal().Modal, {
      onDismiss: this.props.onDismiss
    }, React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Build configuration:"), React.createElement("div", {
      className: "block"
    }, React.createElement(_Dropdown().Dropdown, {
      className: "inline-block",
      value: this.state.configuration,
      options: [{
        label: 'Debug',
        value: 'debug'
      }, {
        label: 'Release',
        value: 'release'
      }],
      onChange: this._onConfigurationChange.bind(this),
      title: "Choose build configuration"
    })), React.createElement("label", null, "C compiler flags:"), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.Xcc,
      placeholderText: "Flags that are passed through to all C compiler invocations",
      onDidChange: this._onXccChange.bind(this),
      onConfirm: this._onSave.bind(this)
    })), React.createElement("label", null, "Linker flags:"), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.Xlinker,
      placeholderText: "Flags that are passed through to all linker invocations",
      onDidChange: this._onXlinkerChange.bind(this),
      onConfirm: this._onSave.bind(this)
    })), React.createElement("label", null, "Swift compiler flags:"), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.Xswiftc,
      placeholderText: "Flags that are passed through to all Swift compiler invocations",
      onDidChange: this._onXswiftcChange.bind(this),
      onConfirm: this._onSave.bind(this)
    })), React.createElement("label", null, "Build path:"), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.buildPath,
      placeholderText: "Build directory path",
      onDidChange: this._onBuildPathChange.bind(this),
      onConfirm: this._onSave.bind(this)
    })), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: this.props.onDismiss
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._onSave.bind(this)
    }, "Save")))));
  }

  _onConfigurationChange(configuration) {
    this.setState({
      configuration
    });
  }

  _onXccChange(Xcc) {
    this.setState({
      Xcc
    });
  }

  _onXlinkerChange(Xlinker) {
    this.setState({
      Xlinker
    });
  }

  _onXswiftcChange(Xswiftc) {
    this.setState({
      Xswiftc
    });
  }

  _onBuildPathChange(buildPath) {
    this.setState({
      buildPath
    });
  }

  _onSave() {
    this.props.onSave(this.state.configuration, this.state.Xcc, this.state.Xlinker, this.state.Xswiftc, this.state.buildPath);
  }

}

exports.default = SwiftPMSettingsModal;