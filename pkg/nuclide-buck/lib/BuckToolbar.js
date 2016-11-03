'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

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

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
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

let BuckToolbar = class BuckToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._handleReactNativeServerModeChanged = this._handleReactNativeServerModeChanged.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;

    this._disposables = new _atom.CompositeDisposable();

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(() => {
      this.forceUpdate();
    }));

    this.state = { settingsVisible: false };
  }

  componentWillMount() {
    // Schedule the update to avoid the Flux "dispatching during a dispatch" error.
    this._fetchDevicesTimeoutId = setTimeout(() => {
      this._buckToolbarActions.fetchDevices();
    }, 0);
    this._disposables.add(new _atom.Disposable(() => {
      clearTimeout(this._fetchDevicesTimeoutId);
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const buckToolbarStore = this._buckToolbarStore;
    const isAppleBundle = buckToolbarStore.getRuleType() === 'apple_bundle';
    const devices = buckToolbarStore.getDevices();
    const isLoading = buckToolbarStore.isLoadingRule() || isAppleBundle && devices.length < 1;
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
    } else if (buckToolbarStore.getBuildTarget() && buckToolbarStore.getRuleType() == null) {
      let title;
      const buckRoot = buckToolbarStore.getCurrentBuckRoot();
      const projectRoot = buckToolbarStore.getCurrentProjectRoot();
      if (buckRoot == null) {
        if (projectRoot != null) {
          title = `No Buck project found in the Current Working Root:<br />${ projectRoot }`;
        } else {
          title = 'No Current Working Root.';
        }
      } else {
        title = `Rule "${ buckToolbarStore.getBuildTarget() }" could not be found in ${ buckRoot }.<br />` + `Check your Current Working Root: ${ (0, (_nullthrows || _load_nullthrows()).default)(projectRoot) }`;
      }

      status = _reactForAtom.React.createElement('span', {
        className: 'icon icon-alert',
        ref: (0, (_addTooltip || _load_addTooltip()).default)({ title: title, delay: 0 })
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
      const deviceId = buckToolbarStore.getSimulator();
      if (isAppleBundle && !isLoading && deviceId != null && devices.length > 0) {
        const options = devices.map(device => ({
          label: `${ device.name } (${ device.os })`,
          value: device.udid
        }));

        widgets.push(_reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          key: 'simulator-dropdown',
          className: 'inline-block',
          value: deviceId,
          options: options,
          onChange: this._handleSimulatorChange,
          size: 'sm',
          title: 'Choose a device'
        }));
      }
      if (buckToolbarStore.canBeReactNativeApp()) {
        widgets.push(_reactForAtom.React.createElement(
          'div',
          { key: 'react-native-checkbox', className: 'inline-block' },
          _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            className: 'nuclide-buck-react-native-packager-checkbox',
            checked: buckToolbarStore.isReactNativeServerMode(),
            onChange: this._handleReactNativeServerModeChanged,
            label: 'Start React Native Packager'
          })
        ));
      }
    }

    const activeTaskType = this.props.activeTaskType;

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-buck-toolbar' },
      _reactForAtom.React.createElement((_BuckToolbarTargetSelector || _load_BuckToolbarTargetSelector()).default, {
        store: this.props.store,
        actions: this.props.actions
      }),
      _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-buck-settings icon icon-gear',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        disabled: activeTaskType == null || this.props.store.getCurrentBuckRoot() == null,
        onClick: () => this._showSettings()
      }),
      widgets,
      this.state.settingsVisible && activeTaskType != null ? _reactForAtom.React.createElement((_BuckToolbarSettings || _load_BuckToolbarSettings()).default, {
        currentBuckRoot: this.props.store.getCurrentBuckRoot(),
        settings: this.props.store.getTaskSettings()[activeTaskType] || {},
        buildType: activeTaskType,
        onDismiss: () => this._hideSettings(),
        onSave: settings => this._saveSettings(activeTaskType, settings)
      }) : null
    );
  }

  _handleSimulatorChange(deviceId) {
    this._buckToolbarActions.updateSimulator(deviceId);
  }

  _handleReactNativeServerModeChanged(checked) {
    this._buckToolbarActions.updateReactNativeServerMode(checked);
  }

  _showSettings() {
    this.setState({ settingsVisible: true });
  }

  _hideSettings() {
    this.setState({ settingsVisible: false });
  }

  _saveSettings(taskType, settings) {
    this._buckToolbarActions.updateTaskSettings(taskType, settings);
    this._hideSettings();
  }

};


module.exports = BuckToolbar;