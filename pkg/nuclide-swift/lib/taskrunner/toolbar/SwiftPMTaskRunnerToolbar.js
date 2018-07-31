"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _SwiftPMSettingsModal() {
  const data = _interopRequireDefault(require("./SwiftPMSettingsModal"));

  _SwiftPMSettingsModal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class SwiftPMTaskRunnerToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsVisible: false
    };
  }

  render() {
    return React.createElement("div", {
      className: "nuclide-swift-task-runner-toolbar"
    }, React.createElement(_Button().Button, {
      className: "nuclide-swift-settings icon icon-gear",
      size: _Button().ButtonSizes.SMALL,
      onClick: () => this._showSettings()
    }), this.state.settingsVisible ? React.createElement(_SwiftPMSettingsModal().default, {
      configuration: this.props.store.getConfiguration(),
      Xcc: this.props.store.getXcc(),
      Xlinker: this.props.store.getXlinker(),
      Xswiftc: this.props.store.getXswiftc(),
      buildPath: this.props.store.getBuildPath(),
      onDismiss: () => this._hideSettings(),
      onSave: (configuration, Xcc, Xlinker, Xswiftc, buildPath) => this._saveSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath)
    }) : null);
  }

  _showSettings() {
    this.setState({
      settingsVisible: true
    });
  }

  _hideSettings() {
    this.setState({
      settingsVisible: false
    });
  }

  _saveSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
    this.props.actions.updateSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath);

    this._hideSettings();
  }

}

exports.default = SwiftPMTaskRunnerToolbar;