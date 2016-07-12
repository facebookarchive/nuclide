var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../nuclide-buck-base');
}

var _SimulatorDropdown2;

function _SimulatorDropdown() {
  return _SimulatorDropdown2 = _interopRequireDefault(require('./SimulatorDropdown'));
}

var _BuckToolbarActions2;

function _BuckToolbarActions() {
  return _BuckToolbarActions2 = _interopRequireDefault(require('./BuckToolbarActions'));
}

var _uiBuckToolbarSettings2;

function _uiBuckToolbarSettings() {
  return _uiBuckToolbarSettings2 = _interopRequireDefault(require('./ui/BuckToolbarSettings'));
}

var _BuckToolbarStore2;

function _BuckToolbarStore() {
  return _BuckToolbarStore2 = _interopRequireDefault(require('./BuckToolbarStore'));
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibCombobox2;

function _nuclideUiLibCombobox() {
  return _nuclideUiLibCombobox2 = require('../../nuclide-ui/lib/Combobox');
}

var _nuclideUiLibCheckbox2;

function _nuclideUiLibCheckbox() {
  return _nuclideUiLibCheckbox2 = require('../../nuclide-ui/lib/Checkbox');
}

var _nuclideUiLibLoadingSpinner2;

function _nuclideUiLibLoadingSpinner() {
  return _nuclideUiLibLoadingSpinner2 = require('../../nuclide-ui/lib/LoadingSpinner');
}

var _nuclideUiLibAddTooltip2;

function _nuclideUiLibAddTooltip() {
  return _nuclideUiLibAddTooltip2 = _interopRequireDefault(require('../../nuclide-ui/lib/add-tooltip'));
}

var BUCK_TARGET_INPUT_WIDTH = 400;

var BuckToolbar = (function (_React$Component) {
  _inherits(BuckToolbar, _React$Component);

  function BuckToolbar(props) {
    var _this = this;

    _classCallCheck(this, BuckToolbar);

    _get(Object.getPrototypeOf(BuckToolbar.prototype), 'constructor', this).call(this, props);
    this._handleBuildTargetChange = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._handleBuildTargetChange.bind(this), 100, false);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._handleReactNativeServerModeChanged = this._handleReactNativeServerModeChanged.bind(this);
    this._requestOptions = this._requestOptions.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;
    this._projectAliasesCache = new Map();

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(function () {
      _this.forceUpdate();
    }));

    this.state = { settingsVisible: false };
  }

  _createClass(BuckToolbar, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: '_requestOptions',
    value: _asyncToGenerator(function* (inputText) {
      var _this2 = this;

      var buckRoot = this._buckToolbarStore.getCurrentBuckRoot();
      if (buckRoot == null) {
        throw new Error('No active Buck project. Check your Current Working Root.');
      }

      var aliases = this._projectAliasesCache.get(buckRoot);
      if (!aliases) {
        (function () {
          var buckProject = (0, (_nuclideBuckBase2 || _nuclideBuckBase()).createBuckProject)(buckRoot);
          aliases = (0, (_commonsNodePromise2 || _commonsNodePromise()).lastly)(buckProject.listAliases(), function () {
            return buckProject.dispose();
          });
          _this2._projectAliasesCache.set(buckRoot, aliases);
        })();
      }

      var result = (yield aliases).slice();
      if (inputText.trim() && result.indexOf(inputText) === -1) {
        result.splice(0, 0, inputText);
      }
      return result;
    })
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var buckToolbarStore = this._buckToolbarStore;
      var status = undefined;
      if (buckToolbarStore.isLoadingRule()) {
        status = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { ref: (0, (_nuclideUiLibAddTooltip2 || _nuclideUiLibAddTooltip()).default)({ title: 'Waiting on rule info...', delay: 0 }) },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibLoadingSpinner2 || _nuclideUiLibLoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: 'EXTRA_SMALL'
          })
        );
      } else if (buckToolbarStore.getBuildTarget() && buckToolbarStore.getRuleType() == null) {
        status = (_reactForAtom2 || _reactForAtom()).React.createElement('span', {
          className: 'icon icon-alert',
          ref: (0, (_nuclideUiLibAddTooltip2 || _nuclideUiLibAddTooltip()).default)({
            title: 'Rule "' + buckToolbarStore.getBuildTarget() + '" could not be found.',
            delay: 0
          })
        });
      }

      var widgets = [];
      if (status != null) {
        widgets.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { key: 'status', className: 'nuclide-buck-status inline-block text-center' },
          status
        ));
      } else {
        if (buckToolbarStore.getRuleType() === 'apple_bundle') {
          widgets.push((_reactForAtom2 || _reactForAtom()).React.createElement((_SimulatorDropdown2 || _SimulatorDropdown()).default, {
            key: 'simulator-dropdown',
            className: 'inline-block',
            title: 'Choose target device',
            onSelectedSimulatorChange: this._handleSimulatorChange
          }));
        }
        if (buckToolbarStore.canBeReactNativeApp()) {
          widgets.push((_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { key: 'react-native-checkbox', className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCheckbox2 || _nuclideUiLibCheckbox()).Checkbox, {
              checked: buckToolbarStore.isReactNativeServerMode(),
              onChange: this._handleReactNativeServerModeChanged,
              label: 'React Native Server Mode'
            })
          ));
        }
      }

      var activeTaskType = this.props.activeTaskType;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCombobox2 || _nuclideUiLibCombobox()).Combobox, {
          className: 'inline-block nuclide-buck-target-combobox',
          ref: 'buildTarget',
          formatRequestOptionsErrorMessage: function (err) {
            return err.message;
          },
          requestOptions: this._requestOptions,
          size: 'sm',
          loadingMessage: 'Updating target names...',
          initialTextInput: this.props.store.getBuildTarget(),
          onChange: this._handleBuildTargetChange,
          placeholderText: 'Buck build target',
          width: BUCK_TARGET_INPUT_WIDTH
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
          className: 'nuclide-buck-settings icon icon-gear',
          size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
          disabled: activeTaskType == null || this.props.store.getCurrentBuckRoot() == null,
          onClick: function () {
            return _this3._showSettings();
          }
        }),
        widgets,
        this.state.settingsVisible && activeTaskType != null ? (_reactForAtom2 || _reactForAtom()).React.createElement((_uiBuckToolbarSettings2 || _uiBuckToolbarSettings()).default, {
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
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(value) {
      this._buckToolbarActions.updateBuildTarget(value.trim());
    }
  }, {
    key: '_handleSimulatorChange',
    value: function _handleSimulatorChange(simulator) {
      this._buckToolbarActions.updateSimulator(simulator);
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = BuckToolbar;

// Querying Buck can be slow, so cache aliases by project.
// Putting the cache here allows the user to refresh it by toggling the UI.