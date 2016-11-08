'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../nuclide-ui/Button');
}

var _SwiftPMTaskRunnerTaskMetadata;

function _load_SwiftPMTaskRunnerTaskMetadata() {
  return _SwiftPMTaskRunnerTaskMetadata = require('../SwiftPMTaskRunnerTaskMetadata');
}

var _SwiftPMBuildSettingsModal;

function _load_SwiftPMBuildSettingsModal() {
  return _SwiftPMBuildSettingsModal = _interopRequireDefault(require('./SwiftPMBuildSettingsModal'));
}

var _SwiftPMTestSettingsModal;

function _load_SwiftPMTestSettingsModal() {
  return _SwiftPMTestSettingsModal = _interopRequireDefault(require('./SwiftPMTestSettingsModal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let SwiftPMTaskRunnerToolbar = class SwiftPMTaskRunnerToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = { settingsVisible: false };
    this._onChdirChange = this._onChdirChange.bind(this);
  }

  render() {
    const settingsElements = [];
    switch (this.props.activeTaskType) {
      case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerBuildTaskMetadata.type:
        settingsElements.push(_reactForAtom.React.createElement((_SwiftPMBuildSettingsModal || _load_SwiftPMBuildSettingsModal()).default, {
          configuration: this.props.store.getConfiguration(),
          Xcc: this.props.store.getXcc(),
          Xlinker: this.props.store.getXlinker(),
          Xswiftc: this.props.store.getXswiftc(),
          buildPath: this.props.store.getBuildPath(),
          onDismiss: () => this._hideSettings(),
          onSave: (configuration, Xcc, Xlinker, Xswiftc, buildPath) => this._saveBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath)
        }));
        break;
      case (_SwiftPMTaskRunnerTaskMetadata || _load_SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTestTaskMetadata.type:
        settingsElements.push(_reactForAtom.React.createElement((_SwiftPMTestSettingsModal || _load_SwiftPMTestSettingsModal()).default, {
          buildPath: this.props.store.getTestBuildPath(),
          onDismiss: () => this._hideSettings(),
          onSave: buildPath => this._saveTestSettings(buildPath)
        }));
        break;
      default:
        if (this.props.activeTaskType) {
          throw new Error(`Unrecognized task type: ${ this.props.activeTaskType }`);
        }
        break;
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-swift-task-runner-toolbar' },
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        className: 'inline-block',
        size: 'sm',
        initialValue: this.props.store.getChdir(),
        onDidChange: chdir => this._onChdirChange(chdir),
        placeholderText: 'Path to Swift package',
        width: 400
      }),
      _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-swift-settings icon icon-gear',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        disabled: false,
        onClick: () => this._showSettings()
      }),
      this.state.settingsVisible ? settingsElements : null
    );
  }

  _onChdirChange(value) {
    this.props.actions.updateChdir(value);
  }

  _showSettings() {
    this.setState({ settingsVisible: true });
  }

  _hideSettings() {
    this.setState({ settingsVisible: false });
  }

  _saveBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
    this.props.actions.updateBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath);
    this._hideSettings();
  }

  _saveTestSettings(buildPath) {
    this.props.actions.updateTestSettings(buildPath);
    this._hideSettings();
  }
};
exports.default = SwiftPMTaskRunnerToolbar;
module.exports = exports['default'];