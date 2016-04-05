var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibCombobox = require('../../nuclide-ui/lib/Combobox');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ2hDOzs7V0FFSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNqQzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7OztTQXpKRyxXQUFXO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNEp6QyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgU2ltdWxhdG9yRHJvcGRvd24gPSByZXF1aXJlKCcuL1NpbXVsYXRvckRyb3Bkb3duJyk7XG5jb25zdCBCdWNrVG9vbGJhckFjdGlvbnMgPSByZXF1aXJlKCcuL0J1Y2tUb29sYmFyQWN0aW9ucycpO1xuY29uc3QgQnVja1Rvb2xiYXJTdG9yZSA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJTdG9yZScpO1xuaW1wb3J0IHtDb21ib2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ29tYm9ib3gnO1xuaW1wb3J0IHtDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ2hlY2tib3gnO1xuXG5jb25zdCB7ZGVib3VuY2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5jb25zdCB7XG4gIGF0b21FdmVudERlYm91bmNlLFxuICBpc1RleHRFZGl0b3IsXG59ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9IGF0b21FdmVudERlYm91bmNlO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgQlVDS19UQVJHRVRfSU5QVVRfV0lEVEggPSA0MDA7XG5jb25zdCBmb3JtYXRSZXF1ZXN0T3B0aW9uc0Vycm9yTWVzc2FnZSA9ICgpID0+ICdJbnZhbGlkIC5idWNrY29uZmlnJztcblxuY2xhc3MgQnVja1Rvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAvKipcbiAgICogVGhlIHRvb2xiYXIgbWFrZXMgYW4gZWZmb3J0IHRvIGtlZXAgdHJhY2sgb2Ygd2hpY2ggQnVja1Byb2plY3QgdG8gYWN0IG9uLCBiYXNlZCBvbiB0aGUgbGFzdFxuICAgKiBUZXh0RWRpdG9yIHRoYXQgaGFkIGZvY3VzIHRoYXQgY29ycmVzcG9uZGVkIHRvIGEgQnVja1Byb2plY3QuIFRoaXMgbWVhbnMgdGhhdCBpZiBhIHVzZXIgb3BlbnNcbiAgICogYW4gZWRpdG9yIGZvciBhIGZpbGUgaW4gYSBCdWNrIHByb2plY3QsIHR5cGVzIGluIGEgYnVpbGQgdGFyZ2V0LCBmb2N1c2VzIGFuIGVkaXRvciBmb3IgYSBmaWxlXG4gICAqIHRoYXQgaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QsIGFuZCBoaXRzIFwiQnVpbGQsXCIgdGhlIHRvb2xiYXIgd2lsbCBidWlsZCB0aGUgdGFyZ2V0IGluIHRoZVxuICAgKiBwcm9qZWN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGVkaXRvciB0aGF0IHByZXZpb3VzbHkgaGFkIGZvY3VzLlxuICAgKlxuICAgKiBVbHRpbWF0ZWx5LCB3ZSBzaG91bGQgaGF2ZSBhIGRyb3Bkb3duIHRvIGxldCB0aGUgdXNlciBzcGVjaWZ5IHRoZSBCdWNrIHByb2plY3Qgd2hlbiBpdCBpc1xuICAgKiBhbWJpZ3VvdXMuXG4gICAqL1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9idWNrVG9vbGJhclN0b3JlOiBCdWNrVG9vbGJhclN0b3JlO1xuICBfYnVja1Rvb2xiYXJBY3Rpb25zOiBCdWNrVG9vbGJhckFjdGlvbnM7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzdG9yZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJTdG9yZSkuaXNSZXF1aXJlZCxcbiAgICBhY3Rpb25zOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihCdWNrVG9vbGJhckFjdGlvbnMpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZSA9XG4gICAgICBkZWJvdW5jZSh0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZS5iaW5kKHRoaXMpLCAxMDAsIGZhbHNlKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvciA9IHRoaXMuX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlID0gdGhpcy5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQgPVxuICAgICAgdGhpcy5faGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yZXF1ZXN0T3B0aW9ucyA9IHRoaXMuX3JlcXVlc3RPcHRpb25zLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2J1aWxkID0gdGhpcy5fYnVpbGQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcnVuID0gdGhpcy5fcnVuLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3Rlc3QgPSB0aGlzLl90ZXN0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2RlYnVnID0gdGhpcy5fZGVidWcuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucyA9IHRoaXMucHJvcHMuYWN0aW9ucztcbiAgICB0aGlzLl9idWNrVG9vbGJhclN0b3JlID0gdGhpcy5wcm9wcy5zdG9yZTtcbiAgICB0aGlzLl9vbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlZChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fYnVja1Rvb2xiYXJTdG9yZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oXG4gICAgICB0aGlzLl9vbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlZC5iaW5kKHRoaXMpKSk7XG5cbiAgICAvLyBSZS1yZW5kZXIgd2hlbmV2ZXIgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGNoYW5nZXMuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUuc3Vic2NyaWJlKCgpID0+IHsgdGhpcy5mb3JjZVVwZGF0ZSgpOyB9KSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoaXRlbTogP09iamVjdCkge1xuICAgIGlmICghaXNUZXh0RWRpdG9yKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRleHRFZGl0b3I6IFRleHRFZGl0b3IgPSAoKGl0ZW06IGFueSk6IFRleHRFZGl0b3IpO1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVQcm9qZWN0Rm9yKHRleHRFZGl0b3IpO1xuICB9XG5cbiAgX3JlcXVlc3RPcHRpb25zKGlucHV0VGV4dDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUubG9hZEFsaWFzZXMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGJ1Y2tUb29sYmFyU3RvcmUgPSB0aGlzLl9idWNrVG9vbGJhclN0b3JlO1xuICAgIGNvbnN0IGRpc2FibGVkID0gIWJ1Y2tUb29sYmFyU3RvcmUuZ2V0QnVpbGRUYXJnZXQoKSB8fCBidWNrVG9vbGJhclN0b3JlLmlzQnVpbGRpbmcoKTtcbiAgICBsZXQgc2VydmVyTW9kZUNoZWNrYm94O1xuICAgIGlmIChidWNrVG9vbGJhclN0b3JlLmlzUmVhY3ROYXRpdmVBcHAoKSkge1xuICAgICAgc2VydmVyTW9kZUNoZWNrYm94ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgIGNoZWNrZWQ9e2J1Y2tUb29sYmFyU3RvcmUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkfVxuICAgICAgICAgICAgbGFiZWw9eydSZWFjdCBOYXRpdmUgU2VydmVyIE1vZGUnfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG4gICAgbGV0IHByb2dyZXNzQmFyO1xuICAgIGlmIChidWNrVG9vbGJhclN0b3JlLmlzQnVpbGRpbmcoKSkge1xuICAgICAgcHJvZ3Jlc3NCYXIgPVxuICAgICAgICA8cHJvZ3Jlc3NcbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgYnVjay10b29sYmFyLXByb2dyZXNzLWJhclwiXG4gICAgICAgICAgdmFsdWU9e2J1Y2tUb29sYmFyU3RvcmUuZ2V0QnVpbGRQcm9ncmVzcygpfVxuICAgICAgICAvPjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiYnVjay10b29sYmFyIHBhZGRlZCB0b29sLXBhbmVsXCJcbiAgICAgICAgaGlkZGVuPXshYnVja1Rvb2xiYXJTdG9yZS5pc1BhbmVsVmlzaWJsZSgpfT5cbiAgICAgICAgPENvbWJvYm94XG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICByZWY9XCJidWlsZFRhcmdldFwiXG4gICAgICAgICAgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2U9e2Zvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlfVxuICAgICAgICAgIG9uUmVxdWVzdE9wdGlvbnNFcnJvcj17dGhpcy5faGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcn1cbiAgICAgICAgICByZXF1ZXN0T3B0aW9ucz17dGhpcy5fcmVxdWVzdE9wdGlvbnN9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZT1cIlVwZGF0aW5nIHRhcmdldCBuYW1lcy4uLlwiXG4gICAgICAgICAgaW5pdGlhbFRleHRJbnB1dD17dGhpcy5wcm9wcy5zdG9yZS5nZXRCdWlsZFRhcmdldCgpfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZX1cbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJCdWNrIGJ1aWxkIHRhcmdldFwiXG4gICAgICAgICAgd2lkdGg9e0JVQ0tfVEFSR0VUX0lOUFVUX1dJRFRIfVxuICAgICAgICAvPlxuICAgICAgICA8U2ltdWxhdG9yRHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIGRpc2FibGVkPXtidWNrVG9vbGJhclN0b3JlLmdldFJ1bGVUeXBlKCkgIT09ICdhcHBsZV9idW5kbGUnfVxuICAgICAgICAgIHRpdGxlPVwiQ2hvb3NlIHRhcmdldCBkZXZpY2VcIlxuICAgICAgICAgIG9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2U9e3RoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgYnRuLWdyb3VwLXNtIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fYnVpbGR9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+QnVpbGQ8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3J1bn0gZGlzYWJsZWQ9e2Rpc2FibGVkfSBjbGFzc05hbWU9XCJidG5cIj5SdW48L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3Rlc3R9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+VGVzdDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fZGVidWd9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+RGVidWc8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtzZXJ2ZXJNb2RlQ2hlY2tib3h9XG4gICAgICAgIHtwcm9ncmVzc0Jhcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVCdWlsZFRhcmdldCh2YWx1ZSk7XG4gIH1cblxuICBfaGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIGdldCB0YXJnZXRzIGZyb20gQnVjaycsXG4gICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfSxcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNpbXVsYXRvckNoYW5nZShzaW11bGF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yKTtcbiAgfVxuXG4gIF9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKGNoZWNrZWQpO1xuICB9XG5cbiAgX2J1aWxkKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5idWlsZCgpO1xuICB9XG5cbiAgX3J1bigpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMucnVuKCk7XG4gIH1cblxuICBfdGVzdCgpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudGVzdCgpO1xuICB9XG5cbiAgX2RlYnVnKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5kZWJ1ZygpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVja1Rvb2xiYXI7XG4iXX0=