'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactForAtom = require('react-for-atom');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _BuckToolbarSettings;

function _load_BuckToolbarSettings() {
  return _BuckToolbarSettings = _interopRequireDefault(require('./ui/BuckToolbarSettings'));
}

var _BuckToolbarTargetSelector;

function _load_BuckToolbarTargetSelector() {
  return _BuckToolbarTargetSelector = _interopRequireDefault(require('./ui/BuckToolbarTargetSelector'));
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class BuckToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleDeploymentTargetChange = this._handleDeploymentTargetChange.bind(this);
    this.state = { settingsVisible: false };
  }

  render() {
    const {
      buildRuleType,
      buildTarget,
      buckRoot,
      isLoadingRule,
      isLoadingPlatforms,
      platformGroups,
      projectRoot,
      selectedDeploymentTarget,
      taskSettings
    } = this.props.appState;

    let status;
    if (isLoadingRule || isLoadingPlatforms) {
      const title = isLoadingRule ? 'Loading target build rule...' : 'Loading available platforms...';
      status = _reactForAtom.React.createElement(
        'div',
        { ref: (0, (_addTooltip || _load_addTooltip()).default)({ title, delay: 0 }) },
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
        title = `Rule "${ buildTarget }" could not be found in ${ buckRoot }.<br />` + `Check your Current Working Root: ${ (0, (_string || _load_string()).maybeToString)(projectRoot) }`;
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
    } else if (platformGroups.length) {
      const options = this._optionsFromPlatformGroups(platformGroups);

      widgets.push(_reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        key: 'simulator-dropdown',
        className: 'inline-block',
        value: selectedDeploymentTarget,
        options: options,
        onChange: this._handleDeploymentTargetChange,
        size: 'sm',
        title: 'Choose a device',
        selectionComparator: (_shallowequal || _load_shallowequal()).default
      }));
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

  _handleDeploymentTargetChange(deploymentTarget) {
    this.props.setDeploymentTarget(deploymentTarget);
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

  _optionsFromPlatformGroups(platformGroups) {
    return platformGroups.reduce((options, platformGroup) => {
      let dropdownGroup = null;
      if (platformGroup.platforms.length === 1) {
        dropdownGroup = this._turnDevicesIntoSelectableOptions(platformGroup.platforms[0]);
      } else {
        dropdownGroup = this._putDevicesIntoSubmenus(platformGroup);
      }

      options.push(dropdownGroup.header);
      return options.concat(dropdownGroup.selectableOptions);
    }, []);
  }

  _turnDevicesIntoSelectableOptions(platform) {
    const header = {
      label: platform.name,
      value: platform.name,
      disabled: true
    };

    const selectableOptions = platform.devices.map(device => {
      return {
        label: `  ${ device.name }`,
        selectedLabel: device.name,
        value: { platform, device }
      };
    });
    return { header, selectableOptions };
  }

  _putDevicesIntoSubmenus(platformGroup) {
    const header = {
      label: platformGroup.name,
      value: platformGroup.name,
      disabled: true
    };

    const selectableOptions = platformGroup.platforms.map(platform => {
      if (platform.devices.length) {
        return {
          type: 'submenu',
          label: `  ${ platform.name }`,
          submenu: platform.devices.map(device => ({
            label: device.name,
            selectedLabel: `${ device.name }`,
            value: { platform, device }
          }))
        };
      } else {
        return {
          label: `  ${ platform.name }`,
          selectedLabel: platform.name,
          value: { platform, device: null }
        };
      }
    });

    return { header, selectableOptions };
  }
}
exports.default = BuckToolbar;
module.exports = exports['default'];