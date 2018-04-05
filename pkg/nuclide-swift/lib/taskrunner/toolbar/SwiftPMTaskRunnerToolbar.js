'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _SwiftPMSettingsModal;

function _load_SwiftPMSettingsModal() {
  return _SwiftPMSettingsModal = _interopRequireDefault(require('./SwiftPMSettingsModal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class SwiftPMTaskRunnerToolbar extends _react.Component {
  constructor(props) {
    super(props);
    this.state = { settingsVisible: false };
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-swift-task-runner-toolbar' },
      _react.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-swift-settings icon icon-gear',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: () => this._showSettings()
      }),
      this.state.settingsVisible ? _react.createElement((_SwiftPMSettingsModal || _load_SwiftPMSettingsModal()).default, {
        configuration: this.props.store.getConfiguration(),
        Xcc: this.props.store.getXcc(),
        Xlinker: this.props.store.getXlinker(),
        Xswiftc: this.props.store.getXswiftc(),
        buildPath: this.props.store.getBuildPath(),
        onDismiss: () => this._hideSettings(),
        onSave: (configuration, Xcc, Xlinker, Xswiftc, buildPath) => this._saveSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath)
      }) : null
    );
  }

  _showSettings() {
    this.setState({ settingsVisible: true });
  }

  _hideSettings() {
    this.setState({ settingsVisible: false });
  }

  _saveSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
    this.props.actions.updateSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath);
    this._hideSettings();
  }
}
exports.default = SwiftPMTaskRunnerToolbar; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */