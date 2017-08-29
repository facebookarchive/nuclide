'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

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

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function hasMobilePlatform(platformGroups) {
  return platformGroups.some(platformGroup => platformGroup.platforms.some(platform => platform.isMobile));
}

class BuckToolbar extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = { settingsVisible: false }, this._handleDeploymentTargetChange = deploymentTarget => {
      this.props.setDeploymentTarget(deploymentTarget);
    }, _temp;
  }

  render() {
    const {
      buildRuleType,
      buildTarget,
      buckRoot,
      isLoadingRule,
      isLoadingPlatforms,
      platformGroups,
      platformProviderUi,
      selectedDeploymentTarget,
      taskSettings
    } = this.props.appState;

    if (!(buckRoot != null)) {
      throw new Error('Invariant violation: "buckRoot != null"');
    }

    const extraToolbarUi = platformProviderUi != null ? platformProviderUi.toolbar : null;
    const extraSettings = platformProviderUi != null ? platformProviderUi.settings : null;

    let status;
    if (isLoadingRule || isLoadingPlatforms) {
      const title = isLoadingRule ? 'Loading target build rule...' : 'Loading available platforms...';
      status =
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        'div',
        { ref: (0, (_addTooltip || _load_addTooltip()).default)({ title, delay: 0 }) },
        _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
          className: 'inline-block buck-spinner',
          size: 'EXTRA_SMALL'
        })
      );
    } else if (buildTarget && buildRuleType == null) {
      status = _react.createElement('span', {
        className: 'icon icon-alert',
        ref: // $FlowFixMe(v>=0.53.0)
        (0, (_addTooltip || _load_addTooltip()).default)({
          title: `'${buildTarget}' could not be found in ${buckRoot}.<br />` + 'Check your Current Working Root or click to retry',
          delay: 0
        }),
        onClick: () => this.props.setBuildTarget(buildTarget)
      });
    }

    const widgets = [];
    if (status != null) {
      widgets.push(_react.createElement(
        'div',
        {
          key: 'status',
          className: 'nuclide-buck-status inline-block text-center' },
        status
      ));
    } else if (hasMobilePlatform(platformGroups)) {
      const options = this._optionsFromPlatformGroups(platformGroups);

      widgets.push(_react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        key: 'simulator-dropdown',
        className: 'inline-block',
        value: selectedDeploymentTarget,
        options: options,
        onChange: this._handleDeploymentTargetChange,
        size: 'sm',
        title: 'Choose a device',
        selectionComparator: (_shallowequal || _load_shallowequal()).default
      }));

      if (extraToolbarUi) {
        widgets.push(extraToolbarUi);
      }
    }

    return _react.createElement(
      'div',
      { className: 'nuclide-buck-toolbar' },
      _react.createElement((_BuckToolbarTargetSelector || _load_BuckToolbarTargetSelector()).default, {
        appState: this.props.appState,
        setBuildTarget: this.props.setBuildTarget
      }),
      _react.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-buck-settings icon icon-gear',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: () => this._showSettings()
      }),
      widgets,
      this.state.settingsVisible ? _react.createElement((_BuckToolbarSettings || _load_BuckToolbarSettings()).default, {
        buckRoot: buckRoot,
        settings: taskSettings,
        platformProviderSettings: extraSettings,
        onDismiss: () => this._hideSettings(),
        onSave: settings => this._saveSettings(settings)
      }) : null
    );
  }

  _showSettings() {
    this.setState({ settingsVisible: true });
  }

  _hideSettings() {
    this.setState({ settingsVisible: false });
  }

  _saveSettings(settings) {
    this.props.setTaskSettings(settings);
    this._hideSettings();
  }

  _optionsFromPlatformGroups(platformGroups) {
    return platformGroups.reduce((options, platformGroup) => {
      let dropdownGroup = null;
      if (platformGroup.platforms.length === 1 && platformGroup.platforms[0].isMobile && platformGroup.platforms[0].deviceGroups.length < 2) {
        dropdownGroup = this._turnDevicesIntoSelectableOptions(platformGroup);
      } else {
        dropdownGroup = this._putDevicesIntoSubmenus(platformGroup);
      }

      options.push(dropdownGroup.header);
      return options.concat(dropdownGroup.selectableOptions);
    }, []);
  }

  _turnDevicesIntoSelectableOptions(platformGroup) {
    const platform = platformGroup.platforms[0];
    let selectableOptions;
    let header;

    if (!platform.isMobile) {
      throw new Error('Invariant violation: "platform.isMobile"');
    }

    const headerLabel = `${platformGroup.name} ${platform.name}`;
    if (platform.deviceGroups.length === 0) {
      header = {
        label: platformGroup.name,
        value: platformGroup.name,
        disabled: true
      };
      selectableOptions = [{
        label: `  ${platform.name}`,
        selectedLabel: headerLabel,
        value: { platformGroup, platform, deviceGroup: null, device: null }
      }];
    } else {
      header = {
        label: headerLabel,
        value: platform.name,
        disabled: true
      };
      const deviceGroup = platform.deviceGroups[0];
      selectableOptions = deviceGroup.devices.map(device => {
        return {
          label: `  ${device.name}`,
          selectedLabel: `${headerLabel}: ${device.name}`,
          value: { platformGroup, platform, deviceGroup, device }
        };
      });
    }

    return { header, selectableOptions };
  }

  _putDevicesIntoSubmenus(platformGroup) {
    const header = {
      label: platformGroup.name,
      value: platformGroup.name,
      disabled: true
    };

    const selectableOptions = [];

    for (const platform of platformGroup.platforms) {
      const headerLabel = `${platformGroup.name} ${platform.name}`;
      if (platform.isMobile && platform.deviceGroups.length) {
        const submenu = [];

        for (const deviceGroup of platform.deviceGroups) {
          if (deviceGroup.name !== '') {
            submenu.push({
              label: deviceGroup.name,
              value: deviceGroup.name,
              disabled: true
            });
          }

          for (const device of deviceGroup.devices) {
            submenu.push({
              label: `  ${device.name}`,
              selectedLabel: `${headerLabel}: ${device.name}`,
              value: { platformGroup, platform, deviceGroup, device }
            });
          }

          if (deviceGroup.name === '') {
            submenu.push({ type: 'separator' });
          }
        }

        selectableOptions.push({
          type: 'submenu',
          label: `  ${platform.name}`,
          submenu
        });
      } else {
        selectableOptions.push({
          label: `  ${platform.name}`,
          selectedLabel: headerLabel,
          value: { platformGroup, platform, deviceGroup: null, device: null }
        });
      }
    }

    return { header, selectableOptions };
  }
}
exports.default = BuckToolbar;