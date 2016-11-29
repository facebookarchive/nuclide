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

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _reactForAtom = require('react-for-atom');

var _BuckToolbarSettings;

function _load_BuckToolbarSettings() {
  return _BuckToolbarSettings = _interopRequireDefault(require('./ui/BuckToolbarSettings'));
}

var _BuckToolbarTargetSelector;

function _load_BuckToolbarTargetSelector() {
  return _BuckToolbarTargetSelector = _interopRequireDefault(require('./ui/BuckToolbarTargetSelector'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BuckToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this.state = { settingsVisible: false };
  }

  render() {
    const {
      buildRuleType,
      buildTarget,
      buckRoot,
      devices,
      isLoadingRule,
      projectRoot,
      simulator,
      taskSettings
    } = this.props.appState;
    const isAppleBundle = buildRuleType === 'apple_bundle';
    const isLoading = isLoadingRule || isAppleBundle && devices == null;
    let status;
    if (isLoading) {
      status = _reactForAtom.React.createElement(
        'div',
        { ref: (0, (_addTooltip || _load_addTooltip()).default)({ title: 'Waiting on rule info...', delay: 0 }) },
        _reactForAtom.React.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
          className: 'inline-block',
          size: 'EXTRA_SMALL'
        })
      );
    } else if (buildTarget && buildRuleType == null) {
      let title;
      if (buckRoot == null) {
        if (projectRoot != null) {
          title = `No Buck project found in the Current Working Root:<br />${ projectRoot }`;
        } else {
          title = 'No Current Working Root.';
        }
      } else {
        title = `Rule "${ buildTarget }" could not be found in ${ buckRoot }.<br />` + `Check your Current Working Root: ${ (0, (_nullthrows || _load_nullthrows()).default)(projectRoot) }`;
      }

      status = _reactForAtom.React.createElement('span', {
        className: 'icon icon-alert',
        ref: (0, (_addTooltip || _load_addTooltip()).default)({ title, delay: 0 })
      });
    }

    const widgets = [];
    if (status != null) {
      widgets.push(_reactForAtom.React.createElement(
        'div',
        { key: 'status', className: 'nuclide-buck-status inline-block text-center' },
        status
      ));
    } else {
      if (isAppleBundle && !isLoading && simulator != null && devices != null && devices.length > 0) {
        const options = devices.map(device => ({
          label: `${ device.name } (${ device.os })`,
          value: device.udid
        }));

        widgets.push(_reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          key: 'simulator-dropdown',
          className: 'inline-block',
          value: simulator,
          options: options,
          onChange: this._handleSimulatorChange,
          size: 'sm',
          title: 'Choose a device'
        }));
      }
    }

    const { activeTaskType } = this.props;
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-buck-toolbar' },
      _reactForAtom.React.createElement((_BuckToolbarTargetSelector || _load_BuckToolbarTargetSelector()).default, {
        appState: this.props.appState,
        setBuildTarget: this.props.setBuildTarget
      }),
      _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-buck-settings icon icon-gear',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        disabled: activeTaskType == null || buckRoot == null,
        onClick: () => this._showSettings()
      }),
      widgets,
      this.state.settingsVisible && activeTaskType != null ? _reactForAtom.React.createElement((_BuckToolbarSettings || _load_BuckToolbarSettings()).default, {
        currentBuckRoot: buckRoot,
        settings: taskSettings[activeTaskType] || {},
        buildType: activeTaskType,
        onDismiss: () => this._hideSettings(),
        onSave: settings => this._saveSettings(activeTaskType, settings)
      }) : null
    );
  }

  _handleSimulatorChange(deviceId) {
    this.props.setSimulator(deviceId);
  }

  _showSettings() {
    this.setState({ settingsVisible: true });
  }

  _hideSettings() {
    this.setState({ settingsVisible: false });
  }

  _saveSettings(taskType, settings) {
    this.props.setTaskSettings(taskType, settings);
    this._hideSettings();
  }

}
exports.default = BuckToolbar;
module.exports = exports['default'];