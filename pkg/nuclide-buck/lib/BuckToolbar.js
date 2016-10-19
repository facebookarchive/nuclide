var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _uiBuckToolbarSettings;

function _load_uiBuckToolbarSettings() {
  return _uiBuckToolbarSettings = _interopRequireDefault(require('./ui/BuckToolbarSettings'));
}

var _uiBuckToolbarTargetSelector;

function _load_uiBuckToolbarTargetSelector() {
  return _uiBuckToolbarTargetSelector = _interopRequireDefault(require('./ui/BuckToolbarTargetSelector'));
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../nuclide-ui/Checkbox');
}

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideUiLoadingSpinner;

function _load_nuclideUiLoadingSpinner() {
  return _nuclideUiLoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _nuclideUiAddTooltip;

function _load_nuclideUiAddTooltip() {
  return _nuclideUiAddTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

var BuckToolbar = (function (_React$Component) {
  _inherits(BuckToolbar, _React$Component);

  function BuckToolbar(props) {
    var _this = this;

    _classCallCheck(this, BuckToolbar);

    _get(Object.getPrototypeOf(BuckToolbar.prototype), 'constructor', this).call(this, props);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._handleReactNativeServerModeChanged = this._handleReactNativeServerModeChanged.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(function () {
      _this.forceUpdate();
    }));

    this.state = { settingsVisible: false };
  }

  _createClass(BuckToolbar, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      // Schedule the update to avoid the Flux "dispatching during a dispatch" error.
      this._fetchDevicesTimeoutId = setTimeout(function () {
        _this2._buckToolbarActions.fetchDevices();
      }, 0);
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        clearTimeout(_this2._fetchDevicesTimeoutId);
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var buckToolbarStore = this._buckToolbarStore;
      var isAppleBundle = buckToolbarStore.getRuleType() === 'apple_bundle';
      var devices = buckToolbarStore.getDevices();
      var isLoading = buckToolbarStore.isLoadingRule() || isAppleBundle && devices.length < 1;
      var status = undefined;
      if (isLoading) {
        status = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { ref: (0, (_nuclideUiAddTooltip || _load_nuclideUiAddTooltip()).default)({ title: 'Waiting on rule info...', delay: 0 }) },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiLoadingSpinner || _load_nuclideUiLoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: 'EXTRA_SMALL'
          })
        );
      } else if (buckToolbarStore.getBuildTarget() && buckToolbarStore.getRuleType() == null) {
        var title = undefined;
        var buckRoot = buckToolbarStore.getCurrentBuckRoot();
        var projectRoot = buckToolbarStore.getCurrentProjectRoot();
        if (buckRoot == null) {
          if (projectRoot != null) {
            title = 'No Buck project found in the Current Working Root:<br />' + projectRoot;
          } else {
            title = 'No Current Working Root.';
          }
        } else {
          title = 'Rule "' + buckToolbarStore.getBuildTarget() + '" could not be found in ' + buckRoot + '.<br />' + ('Check your Current Working Root: ' + (0, (_nullthrows || _load_nullthrows()).default)(projectRoot));
        }

        status = (_reactForAtom || _load_reactForAtom()).React.createElement('span', {
          className: 'icon icon-alert',
          ref: (0, (_nuclideUiAddTooltip || _load_nuclideUiAddTooltip()).default)({ title: title, delay: 0 })
        });
      }

      var widgets = [];
      if (status != null) {
        widgets.push((_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { key: 'status', className: 'nuclide-buck-status inline-block text-center' },
          status
        ));
      } else {
        var deviceId = buckToolbarStore.getSimulator();
        if (isAppleBundle && !isLoading && deviceId != null && devices.length > 0) {
          var options = devices.map(function (device) {
            return {
              label: device.name + ' (' + device.os + ')',
              value: device.udid
            };
          });

          widgets.push((_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiDropdown || _load_nuclideUiDropdown()).Dropdown, {
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
          widgets.push((_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { key: 'react-native-checkbox', className: 'inline-block' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
              className: 'nuclide-buck-react-native-packager-checkbox',
              checked: buckToolbarStore.isReactNativeServerMode(),
              onChange: this._handleReactNativeServerModeChanged,
              label: 'Start React Native Packager'
            })
          ));
        }
      }

      var activeTaskType = this.props.activeTaskType;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-buck-toolbar' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_uiBuckToolbarTargetSelector || _load_uiBuckToolbarTargetSelector()).default, {
          store: this.props.store,
          actions: this.props.actions
        }),
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, {
          className: 'nuclide-buck-settings icon icon-gear',
          size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
          disabled: activeTaskType == null || this.props.store.getCurrentBuckRoot() == null,
          onClick: function () {
            return _this3._showSettings();
          }
        }),
        widgets,
        this.state.settingsVisible && activeTaskType != null ? (_reactForAtom || _load_reactForAtom()).React.createElement((_uiBuckToolbarSettings || _load_uiBuckToolbarSettings()).default, {
          currentBuckRoot: this.props.store.getCurrentBuckRoot(),
          settings: this.props.store.getTaskSettings()[activeTaskType] || {},
          buildType: activeTaskType,
          onDismiss: function () {
            return _this3._hideSettings();
          },
          onSave: function (settings) {
            return _this3._saveSettings(activeTaskType, settings);
          }
        }) : null
      );
    }
  }, {
    key: '_handleSimulatorChange',
    value: function _handleSimulatorChange(deviceId) {
      this._buckToolbarActions.updateSimulator(deviceId);
    }
  }, {
    key: '_handleReactNativeServerModeChanged',
    value: function _handleReactNativeServerModeChanged(checked) {
      this._buckToolbarActions.updateReactNativeServerMode(checked);
    }
  }, {
    key: '_showSettings',
    value: function _showSettings() {
      this.setState({ settingsVisible: true });
    }
  }, {
    key: '_hideSettings',
    value: function _hideSettings() {
      this.setState({ settingsVisible: false });
    }
  }, {
    key: '_saveSettings',
    value: function _saveSettings(taskType, settings) {
      this._buckToolbarActions.updateTaskSettings(taskType, settings);
      this._hideSettings();
    }
  }]);

  return BuckToolbar;
})((_reactForAtom || _load_reactForAtom()).React.Component);

module.exports = BuckToolbar;