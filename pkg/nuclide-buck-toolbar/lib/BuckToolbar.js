var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiCheckbox = require('../../nuclide-ui-checkbox');

var _nuclideUiCheckbox2 = _interopRequireDefault(_nuclideUiCheckbox);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomComboBox = require('../../nuclide-ui-atom-combo-box');

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
var isTextEditor = _require4.isTextEditor;
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
      if (!isTextEditor(item)) {
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
          React.createElement(_nuclideUiCheckbox2['default'], {
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
        React.createElement(AtomComboBox, {
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
          'div',
          { className: 'btn-group btn-group-sm inline-block' },
          React.createElement(
            'button',
            { onClick: this._build, disabled: disabled, className: 'btn' },
            'Build'
          ),
          React.createElement(
            'button',
            { onClick: this._run, disabled: disabled, className: 'btn' },
            'Run'
          ),
          React.createElement(
            'button',
            { onClick: this._test, disabled: disabled, className: 'btn' },
            'Test'
          ),
          React.createElement(
            'button',
            { onClick: this._debug, disabled: disabled, className: 'btn' },
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
//# sourceMappingURL=data:application/json;base64,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QTJCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0Q7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNoQzs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDakM7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDOzs7U0F6SkcsV0FBVztHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTRKekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiQnVja1Rvb2xiYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBBdG9tQ29tYm9Cb3ggPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLWF0b20tY29tYm8tYm94Jyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFNpbXVsYXRvckRyb3Bkb3duID0gcmVxdWlyZSgnLi9TaW11bGF0b3JEcm9wZG93bicpO1xuY29uc3QgQnVja1Rvb2xiYXJBY3Rpb25zID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhckFjdGlvbnMnKTtcbmNvbnN0IEJ1Y2tUb29sYmFyU3RvcmUgPSByZXF1aXJlKCcuL0J1Y2tUb29sYmFyU3RvcmUnKTtcbmltcG9ydCBOdWNsaWRlQ2hlY2tib3ggZnJvbSAnLi4vLi4vbnVjbGlkZS11aS1jaGVja2JveCc7XG5cbmNvbnN0IHtkZWJvdW5jZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IHtcbiAgYXRvbUV2ZW50RGVib3VuY2UsXG4gIGlzVGV4dEVkaXRvcixcbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID0gYXRvbUV2ZW50RGVib3VuY2U7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBCVUNLX1RBUkdFVF9JTlBVVF9XSURUSCA9IDQwMDtcbmNvbnN0IGZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlID0gKCkgPT4gJ0ludmFsaWQgLmJ1Y2tjb25maWcnO1xuXG5jbGFzcyBCdWNrVG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIC8qKlxuICAgKiBUaGUgdG9vbGJhciBtYWtlcyBhbiBlZmZvcnQgdG8ga2VlcCB0cmFjayBvZiB3aGljaCBCdWNrUHJvamVjdCB0byBhY3Qgb24sIGJhc2VkIG9uIHRoZSBsYXN0XG4gICAqIFRleHRFZGl0b3IgdGhhdCBoYWQgZm9jdXMgdGhhdCBjb3JyZXNwb25kZWQgdG8gYSBCdWNrUHJvamVjdC4gVGhpcyBtZWFucyB0aGF0IGlmIGEgdXNlciBvcGVuc1xuICAgKiBhbiBlZGl0b3IgZm9yIGEgZmlsZSBpbiBhIEJ1Y2sgcHJvamVjdCwgdHlwZXMgaW4gYSBidWlsZCB0YXJnZXQsIGZvY3VzZXMgYW4gZWRpdG9yIGZvciBhIGZpbGVcbiAgICogdGhhdCBpcyBub3QgcGFydCBvZiBhIEJ1Y2sgcHJvamVjdCwgYW5kIGhpdHMgXCJCdWlsZCxcIiB0aGUgdG9vbGJhciB3aWxsIGJ1aWxkIHRoZSB0YXJnZXQgaW4gdGhlXG4gICAqIHByb2plY3QgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgZWRpdG9yIHRoYXQgcHJldmlvdXNseSBoYWQgZm9jdXMuXG4gICAqXG4gICAqIFVsdGltYXRlbHksIHdlIHNob3VsZCBoYXZlIGEgZHJvcGRvd24gdG8gbGV0IHRoZSB1c2VyIHNwZWNpZnkgdGhlIEJ1Y2sgcHJvamVjdCB3aGVuIGl0IGlzXG4gICAqIGFtYmlndW91cy5cbiAgICovXG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2J1Y2tUb29sYmFyU3RvcmU6IEJ1Y2tUb29sYmFyU3RvcmU7XG4gIF9idWNrVG9vbGJhckFjdGlvbnM6IEJ1Y2tUb29sYmFyQWN0aW9ucztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihCdWNrVG9vbGJhclN0b3JlKS5pc1JlcXVpcmVkLFxuICAgIGFjdGlvbnM6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEJ1Y2tUb29sYmFyQWN0aW9ucykuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlID1cbiAgICAgIGRlYm91bmNlKHRoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlLmJpbmQodGhpcyksIDEwMCwgZmFsc2UpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVSZXF1ZXN0T3B0aW9uc0Vycm9yID0gdGhpcy5faGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVTaW11bGF0b3JDaGFuZ2UgPSB0aGlzLl9oYW5kbGVTaW11bGF0b3JDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZCA9XG4gICAgICB0aGlzLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3JlcXVlc3RPcHRpb25zID0gdGhpcy5fcmVxdWVzdE9wdGlvbnMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fYnVpbGQgPSB0aGlzLl9idWlsZC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9ydW4gPSB0aGlzLl9ydW4uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdGVzdCA9IHRoaXMuX3Rlc3QuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fZGVidWcgPSB0aGlzLl9kZWJ1Zy5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zID0gdGhpcy5wcm9wcy5hY3Rpb25zO1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUgPSB0aGlzLnByb3BzLnN0b3JlO1xuICAgIHRoaXMuX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQob25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgIHRoaXMuX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkLmJpbmQodGhpcykpKTtcblxuICAgIC8vIFJlLXJlbmRlciB3aGVuZXZlciB0aGUgZGF0YSBpbiB0aGUgc3RvcmUgY2hhbmdlcy5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fYnVja1Rvb2xiYXJTdG9yZS5zdWJzY3JpYmUoKCkgPT4geyB0aGlzLmZvcmNlVXBkYXRlKCk7IH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlZChpdGVtOiA/T2JqZWN0KSB7XG4gICAgaWYgKCFpc1RleHRFZGl0b3IoaXRlbSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGV4dEVkaXRvcjogVGV4dEVkaXRvciA9ICgoaXRlbTogYW55KTogVGV4dEVkaXRvcik7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnVwZGF0ZVByb2plY3RGb3IodGV4dEVkaXRvcik7XG4gIH1cblxuICBfcmVxdWVzdE9wdGlvbnMoaW5wdXRUZXh0OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fYnVja1Rvb2xiYXJTdG9yZS5sb2FkQWxpYXNlcygpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMuX2J1Y2tUb29sYmFyU3RvcmU7XG4gICAgY29uc3QgZGlzYWJsZWQgPSAhYnVja1Rvb2xiYXJTdG9yZS5nZXRCdWlsZFRhcmdldCgpIHx8IGJ1Y2tUb29sYmFyU3RvcmUuaXNCdWlsZGluZygpO1xuICAgIGxldCBzZXJ2ZXJNb2RlQ2hlY2tib3g7XG4gICAgaWYgKGJ1Y2tUb29sYmFyU3RvcmUuaXNSZWFjdE5hdGl2ZUFwcCgpKSB7XG4gICAgICBzZXJ2ZXJNb2RlQ2hlY2tib3ggPVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2J1Y2tUb29sYmFyU3RvcmUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkfVxuICAgICAgICAgICAgbGFiZWw9eydSZWFjdCBOYXRpdmUgU2VydmVyIE1vZGUnfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG4gICAgbGV0IHByb2dyZXNzQmFyO1xuICAgIGlmIChidWNrVG9vbGJhclN0b3JlLmlzQnVpbGRpbmcoKSkge1xuICAgICAgcHJvZ3Jlc3NCYXIgPVxuICAgICAgICA8cHJvZ3Jlc3NcbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgYnVjay10b29sYmFyLXByb2dyZXNzLWJhclwiXG4gICAgICAgICAgdmFsdWU9e2J1Y2tUb29sYmFyU3RvcmUuZ2V0QnVpbGRQcm9ncmVzcygpfVxuICAgICAgICAvPjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiYnVjay10b29sYmFyIHBhZGRlZCB0b29sLXBhbmVsXCJcbiAgICAgICAgaGlkZGVuPXshYnVja1Rvb2xiYXJTdG9yZS5pc1BhbmVsVmlzaWJsZSgpfT5cbiAgICAgICAgPEF0b21Db21ib0JveFxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgcmVmPVwiYnVpbGRUYXJnZXRcIlxuICAgICAgICAgIGZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlPXtmb3JtYXRSZXF1ZXN0T3B0aW9uc0Vycm9yTWVzc2FnZX1cbiAgICAgICAgICBvblJlcXVlc3RPcHRpb25zRXJyb3I9e3RoaXMuX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3J9XG4gICAgICAgICAgcmVxdWVzdE9wdGlvbnM9e3RoaXMuX3JlcXVlc3RPcHRpb25zfVxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2U9XCJVcGRhdGluZyB0YXJnZXQgbmFtZXMuLi5cIlxuICAgICAgICAgIGluaXRpYWxUZXh0SW5wdXQ9e3RoaXMucHJvcHMuc3RvcmUuZ2V0QnVpbGRUYXJnZXQoKX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2V9XG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiQnVjayBidWlsZCB0YXJnZXRcIlxuICAgICAgICAgIHdpZHRoPXtCVUNLX1RBUkdFVF9JTlBVVF9XSURUSH1cbiAgICAgICAgLz5cbiAgICAgICAgPFNpbXVsYXRvckRyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBkaXNhYmxlZD17YnVja1Rvb2xiYXJTdG9yZS5nZXRSdWxlVHlwZSgpICE9PSAnYXBwbGVfYnVuZGxlJ31cbiAgICAgICAgICB0aXRsZT1cIkNob29zZSB0YXJnZXQgZGV2aWNlXCJcbiAgICAgICAgICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlPXt0aGlzLl9oYW5kbGVTaW11bGF0b3JDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2J1aWxkfSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPkJ1aWxkPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9ydW59IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+UnVuPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl90ZXN0fSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPlRlc3Q8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2RlYnVnfSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPkRlYnVnPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7c2VydmVyTW9kZUNoZWNrYm94fVxuICAgICAgICB7cHJvZ3Jlc3NCYXJ9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlQnVpbGRUYXJnZXQodmFsdWUpO1xuICB9XG5cbiAgX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgJ0ZhaWxlZCB0byBnZXQgdGFyZ2V0cyBmcm9tIEJ1Y2snLFxuICAgICAge2RldGFpbDogZXJyb3IubWVzc2FnZX0sXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTaW11bGF0b3JDaGFuZ2Uoc2ltdWxhdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlU2ltdWxhdG9yKHNpbXVsYXRvcik7XG4gIH1cblxuICBfaGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZChjaGVja2VkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnVwZGF0ZVJlYWN0TmF0aXZlU2VydmVyTW9kZShjaGVja2VkKTtcbiAgfVxuXG4gIF9idWlsZCgpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMuYnVpbGQoKTtcbiAgfVxuXG4gIF9ydW4oKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnJ1bigpO1xuICB9XG5cbiAgX3Rlc3QoKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnRlc3QoKTtcbiAgfVxuXG4gIF9kZWJ1ZygpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMuZGVidWcoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1Y2tUb29sYmFyO1xuIl19