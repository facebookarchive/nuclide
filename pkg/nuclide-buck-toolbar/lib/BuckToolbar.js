var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibAtomComboBox = require('../../nuclide-ui/lib/AtomComboBox');

var _nuclideUiLibNuclideCheckbox = require('../../nuclide-ui/lib/NuclideCheckbox');

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
          React.createElement(_nuclideUiLibNuclideCheckbox.NuclideCheckbox, {
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
        React.createElement(_nuclideUiLibAtomComboBox.AtomComboBox, {
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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ2hDOzs7V0FFSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNqQzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7OztTQXpKRyxXQUFXO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNEp6QyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJCdWNrVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgU2ltdWxhdG9yRHJvcGRvd24gPSByZXF1aXJlKCcuL1NpbXVsYXRvckRyb3Bkb3duJyk7XG5jb25zdCBCdWNrVG9vbGJhckFjdGlvbnMgPSByZXF1aXJlKCcuL0J1Y2tUb29sYmFyQWN0aW9ucycpO1xuY29uc3QgQnVja1Rvb2xiYXJTdG9yZSA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJTdG9yZScpO1xuaW1wb3J0IHtBdG9tQ29tYm9Cb3h9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21Db21ib0JveCc7XG5pbXBvcnQge051Y2xpZGVDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvTnVjbGlkZUNoZWNrYm94JztcblxuY29uc3Qge2RlYm91bmNlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3Qge1xuICBhdG9tRXZlbnREZWJvdW5jZSxcbiAgaXNUZXh0RWRpdG9yLFxufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJyk7XG5jb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPSBhdG9tRXZlbnREZWJvdW5jZTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEJVQ0tfVEFSR0VUX0lOUFVUX1dJRFRIID0gNDAwO1xuY29uc3QgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UgPSAoKSA9PiAnSW52YWxpZCAuYnVja2NvbmZpZyc7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIFRoZSB0b29sYmFyIG1ha2VzIGFuIGVmZm9ydCB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIEJ1Y2tQcm9qZWN0IHRvIGFjdCBvbiwgYmFzZWQgb24gdGhlIGxhc3RcbiAgICogVGV4dEVkaXRvciB0aGF0IGhhZCBmb2N1cyB0aGF0IGNvcnJlc3BvbmRlZCB0byBhIEJ1Y2tQcm9qZWN0LiBUaGlzIG1lYW5zIHRoYXQgaWYgYSB1c2VyIG9wZW5zXG4gICAqIGFuIGVkaXRvciBmb3IgYSBmaWxlIGluIGEgQnVjayBwcm9qZWN0LCB0eXBlcyBpbiBhIGJ1aWxkIHRhcmdldCwgZm9jdXNlcyBhbiBlZGl0b3IgZm9yIGEgZmlsZVxuICAgKiB0aGF0IGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LCBhbmQgaGl0cyBcIkJ1aWxkLFwiIHRoZSB0b29sYmFyIHdpbGwgYnVpbGQgdGhlIHRhcmdldCBpbiB0aGVcbiAgICogcHJvamVjdCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBlZGl0b3IgdGhhdCBwcmV2aW91c2x5IGhhZCBmb2N1cy5cbiAgICpcbiAgICogVWx0aW1hdGVseSwgd2Ugc2hvdWxkIGhhdmUgYSBkcm9wZG93biB0byBsZXQgdGhlIHVzZXIgc3BlY2lmeSB0aGUgQnVjayBwcm9qZWN0IHdoZW4gaXQgaXNcbiAgICogYW1iaWd1b3VzLlxuICAgKi9cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYnVja1Rvb2xiYXJTdG9yZTogQnVja1Rvb2xiYXJTdG9yZTtcbiAgX2J1Y2tUb29sYmFyQWN0aW9uczogQnVja1Rvb2xiYXJBY3Rpb25zO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEJ1Y2tUb29sYmFyU3RvcmUpLmlzUmVxdWlyZWQsXG4gICAgYWN0aW9uczogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UgPVxuICAgICAgZGVib3VuY2UodGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UuYmluZCh0aGlzKSwgMTAwLCBmYWxzZSk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IgPSB0aGlzLl9oYW5kbGVSZXF1ZXN0T3B0aW9uc0Vycm9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNpbXVsYXRvckNoYW5nZSA9IHRoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkID1cbiAgICAgIHRoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcmVxdWVzdE9wdGlvbnMgPSB0aGlzLl9yZXF1ZXN0T3B0aW9ucy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9idWlsZCA9IHRoaXMuX2J1aWxkLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3J1biA9IHRoaXMuX3J1bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl90ZXN0ID0gdGhpcy5fdGVzdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMgPSB0aGlzLnByb3BzLmFjdGlvbnM7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMucHJvcHMuc3RvcmU7XG4gICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKFxuICAgICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQuYmluZCh0aGlzKSkpO1xuXG4gICAgLy8gUmUtcmVuZGVyIHdoZW5ldmVyIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZm9yY2VVcGRhdGUoKTsgfSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkKGl0ZW06ID9PYmplY3QpIHtcbiAgICBpZiAoIWlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yID0gKChpdGVtOiBhbnkpOiBUZXh0RWRpdG9yKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUHJvamVjdEZvcih0ZXh0RWRpdG9yKTtcbiAgfVxuXG4gIF9yZXF1ZXN0T3B0aW9ucyhpbnB1dFRleHQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9idWNrVG9vbGJhclN0b3JlLmxvYWRBbGlhc2VzKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBidWNrVG9vbGJhclN0b3JlID0gdGhpcy5fYnVja1Rvb2xiYXJTdG9yZTtcbiAgICBjb25zdCBkaXNhYmxlZCA9ICFidWNrVG9vbGJhclN0b3JlLmdldEJ1aWxkVGFyZ2V0KCkgfHwgYnVja1Rvb2xiYXJTdG9yZS5pc0J1aWxkaW5nKCk7XG4gICAgbGV0IHNlcnZlck1vZGVDaGVja2JveDtcbiAgICBpZiAoYnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlQXBwKCkpIHtcbiAgICAgIHNlcnZlck1vZGVDaGVja2JveCA9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICAgICAgY2hlY2tlZD17YnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWR9XG4gICAgICAgICAgICBsYWJlbD17J1JlYWN0IE5hdGl2ZSBTZXJ2ZXIgTW9kZSd9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbiAgICBsZXQgcHJvZ3Jlc3NCYXI7XG4gICAgaWYgKGJ1Y2tUb29sYmFyU3RvcmUuaXNCdWlsZGluZygpKSB7XG4gICAgICBwcm9ncmVzc0JhciA9XG4gICAgICAgIDxwcm9ncmVzc1xuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBidWNrLXRvb2xiYXItcHJvZ3Jlc3MtYmFyXCJcbiAgICAgICAgICB2YWx1ZT17YnVja1Rvb2xiYXJTdG9yZS5nZXRCdWlsZFByb2dyZXNzKCl9XG4gICAgICAgIC8+O1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJidWNrLXRvb2xiYXIgcGFkZGVkIHRvb2wtcGFuZWxcIlxuICAgICAgICBoaWRkZW49eyFidWNrVG9vbGJhclN0b3JlLmlzUGFuZWxWaXNpYmxlKCl9PlxuICAgICAgICA8QXRvbUNvbWJvQm94XG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICByZWY9XCJidWlsZFRhcmdldFwiXG4gICAgICAgICAgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2U9e2Zvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlfVxuICAgICAgICAgIG9uUmVxdWVzdE9wdGlvbnNFcnJvcj17dGhpcy5faGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcn1cbiAgICAgICAgICByZXF1ZXN0T3B0aW9ucz17dGhpcy5fcmVxdWVzdE9wdGlvbnN9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZT1cIlVwZGF0aW5nIHRhcmdldCBuYW1lcy4uLlwiXG4gICAgICAgICAgaW5pdGlhbFRleHRJbnB1dD17dGhpcy5wcm9wcy5zdG9yZS5nZXRCdWlsZFRhcmdldCgpfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZX1cbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJCdWNrIGJ1aWxkIHRhcmdldFwiXG4gICAgICAgICAgd2lkdGg9e0JVQ0tfVEFSR0VUX0lOUFVUX1dJRFRIfVxuICAgICAgICAvPlxuICAgICAgICA8U2ltdWxhdG9yRHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIGRpc2FibGVkPXtidWNrVG9vbGJhclN0b3JlLmdldFJ1bGVUeXBlKCkgIT09ICdhcHBsZV9idW5kbGUnfVxuICAgICAgICAgIHRpdGxlPVwiQ2hvb3NlIHRhcmdldCBkZXZpY2VcIlxuICAgICAgICAgIG9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2U9e3RoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgYnRuLWdyb3VwLXNtIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fYnVpbGR9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+QnVpbGQ8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3J1bn0gZGlzYWJsZWQ9e2Rpc2FibGVkfSBjbGFzc05hbWU9XCJidG5cIj5SdW48L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3Rlc3R9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+VGVzdDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fZGVidWd9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+RGVidWc8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtzZXJ2ZXJNb2RlQ2hlY2tib3h9XG4gICAgICAgIHtwcm9ncmVzc0Jhcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVCdWlsZFRhcmdldCh2YWx1ZSk7XG4gIH1cblxuICBfaGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIGdldCB0YXJnZXRzIGZyb20gQnVjaycsXG4gICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfSxcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNpbXVsYXRvckNoYW5nZShzaW11bGF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yKTtcbiAgfVxuXG4gIF9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKGNoZWNrZWQpO1xuICB9XG5cbiAgX2J1aWxkKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5idWlsZCgpO1xuICB9XG5cbiAgX3J1bigpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMucnVuKCk7XG4gIH1cblxuICBfdGVzdCgpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudGVzdCgpO1xuICB9XG5cbiAgX2RlYnVnKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5kZWJ1ZygpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVja1Rvb2xiYXI7XG4iXX0=