var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibCombobox = require('../../nuclide-ui/lib/Combobox');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('react-for-atom');

var React = _require2.React;

var SimulatorDropdown = require('./SimulatorDropdown');
var BuckToolbarActions = require('./BuckToolbarActions');
var BuckToolbarStore = require('./BuckToolbarStore');

var _require3 = require('../../nuclide-commons');

var debounce = _require3.debounce;

var _require4 = require('../../nuclide-atom-helpers');

var atomEventDebounce = _require4.atomEventDebounce;
var onWorkspaceDidStopChangingActivePaneItem = atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;
var PropTypes = React.PropTypes;

var BUCK_TARGET_INPUT_WIDTH = 400;
var formatRequestOptionsErrorMessage = function formatRequestOptionsErrorMessage() {
  return 'Invalid .buckconfig';
};

var BuckToolbar = (function (_React$Component) {
  _inherits(BuckToolbar, _React$Component);

  _createClass(BuckToolbar, null, [{
    key: 'propTypes',
    value: {
      store: PropTypes.instanceOf(BuckToolbarStore).isRequired,
      actions: PropTypes.instanceOf(BuckToolbarActions).isRequired
    },
    enumerable: true
  }]);

  function BuckToolbar(props) {
    var _this = this;

    _classCallCheck(this, BuckToolbar);

    _get(Object.getPrototypeOf(BuckToolbar.prototype), 'constructor', this).call(this, props);
    this._handleBuildTargetChange = debounce(this._handleBuildTargetChange.bind(this), 100, false);
    this._handleRequestOptionsError = this._handleRequestOptionsError.bind(this);
    this._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    this._handleReactNativeServerModeChanged = this._handleReactNativeServerModeChanged.bind(this);
    this._requestOptions = this._requestOptions.bind(this);
    this._build = this._build.bind(this);
    this._run = this._run.bind(this);
    this._test = this._test.bind(this);
    this._debug = this._debug.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;
    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());

    this._disposables = new CompositeDisposable();
    this._disposables.add(this._buckToolbarStore);
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(this._onActivePaneItemChanged.bind(this)));

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(function () {
      _this.forceUpdate();
    }));
  }

  _createClass(BuckToolbar, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: '_onActivePaneItemChanged',
    value: function _onActivePaneItemChanged(item) {
      if (!atom.workspace.isTextEditor(item)) {
        return;
      }
      var textEditor = item;
      this._buckToolbarActions.updateProjectFor(textEditor);
    }
  }, {
    key: '_requestOptions',
    value: function _requestOptions(inputText) {
      return this._buckToolbarStore.loadAliases();
    }
  }, {
    key: 'render',
    value: function render() {
      var buckToolbarStore = this._buckToolbarStore;
      var disabled = !buckToolbarStore.getBuildTarget() || buckToolbarStore.isBuilding();
      var serverModeCheckbox = undefined;
      if (buckToolbarStore.isReactNativeApp()) {
        serverModeCheckbox = React.createElement(
          'div',
          { className: 'inline-block' },
          React.createElement(_nuclideUiLibCheckbox.Checkbox, {
            checked: buckToolbarStore.isReactNativeServerMode(),
            onChange: this._handleReactNativeServerModeChanged,
            label: 'React Native Server Mode'
          })
        );
      }
      var progressBar = undefined;
      if (buckToolbarStore.isBuilding()) {
        progressBar = React.createElement('progress', {
          className: 'inline-block buck-toolbar-progress-bar',
          value: buckToolbarStore.getBuildProgress()
        });
      }
      return React.createElement(
        'div',
        {
          className: 'buck-toolbar padded tool-panel',
          hidden: !buckToolbarStore.isPanelVisible() },
        React.createElement(_nuclideUiLibCombobox.Combobox, {
          className: 'inline-block',
          ref: 'buildTarget',
          formatRequestOptionsErrorMessage: formatRequestOptionsErrorMessage,
          onRequestOptionsError: this._handleRequestOptionsError,
          requestOptions: this._requestOptions,
          size: 'sm',
          loadingMessage: 'Updating target names...',
          initialTextInput: this.props.store.getBuildTarget(),
          onChange: this._handleBuildTargetChange,
          placeholderText: 'Buck build target',
          width: BUCK_TARGET_INPUT_WIDTH
        }),
        React.createElement(SimulatorDropdown, {
          className: 'inline-block',
          disabled: buckToolbarStore.getRuleType() !== 'apple_bundle',
          title: 'Choose target device',
          onSelectedSimulatorChange: this._handleSimulatorChange
        }),
        React.createElement(
          _nuclideUiLibButtonGroup.ButtonGroup,
          { className: 'inline-block', size: _nuclideUiLibButtonGroup.ButtonGroupSizes.SMALL },
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._build, disabled: disabled },
            'Build'
          ),
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._run, disabled: disabled },
            'Run'
          ),
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._test, disabled: disabled },
            'Test'
          ),
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._debug, disabled: disabled },
            'Debug'
          )
        ),
        serverModeCheckbox,
        progressBar
      );
    }
  }, {
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(value) {
      this._buckToolbarActions.updateBuildTarget(value);
    }
  }, {
    key: '_handleRequestOptionsError',
    value: function _handleRequestOptionsError(error) {
      atom.notifications.addError('Failed to get targets from Buck', { detail: error.message });
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
    key: '_build',
    value: function _build() {
      this._buckToolbarActions.build();
    }
  }, {
    key: '_run',
    value: function _run() {
      this._buckToolbarActions.run();
    }
  }, {
    key: '_test',
    value: function _test() {
      this._buckToolbarActions.test();
    }
  }, {
    key: '_debug',
    value: function _debug() {
      this._buckToolbarActions.debug();
    }
  }]);

  return BuckToolbar;
})(React.Component);

module.exports = BuckToolbar;

/**
 * The toolbar makes an effort to keep track of which BuckProject to act on, based on the last
 * TextEditor that had focus that corresponded to a BuckProject. This means that if a user opens
 * an editor for a file in a Buck project, types in a build target, focuses an editor for a file
 * that is not part of a Buck project, and hits "Build," the toolbar will build the target in the
 * project that corresponds to the editor that previously had focus.
 *
 * Ultimately, we should have a dropdown to let the user specify the Buck project when it is
 * ambiguous.
 */