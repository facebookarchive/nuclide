'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactForAtom = require('react-for-atom');

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

class BuckToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleDeviceChange = this._handleDeviceChange.bind(this);
    this.state = { settingsVisible: false };
  }

  render() {
    const {
      buildRuleType,
      buildTarget,
      buckRoot,
      isLoadingRule,
      isLoadingPlatforms,
      platforms,
      projectRoot,
      selectedDevice,
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
    } else if (platforms.length) {
      const options = this._optionsFromPlatforms(platforms);

      widgets.push(_reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        key: 'simulator-dropdown',
        className: 'inline-block',
        value: selectedDevice,
        options: options,
        onChange: this._handleDeviceChange,
        size: 'sm',
        title: 'Choose a device'
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

  _handleDeviceChange(device) {
    this.props.setDevice(device);
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

  _optionsFromPlatforms(platforms) {
    return platforms.reduce((options, platform) => {
      const platform_header = {
        label: platform.name,
        value: platform.name,
        disabled: true
      };
      const device_options = platform.devices.map(device => {
        return {
          label: `  ${ device.name }`,
          value: device
        };
      });

      options.push(platform_header);
      return options.concat(device_options);
    }, []);
  }

}
exports.default = BuckToolbar; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                */

module.exports = exports['default'];