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
//# sourceMappingURL=data:application/json;base64,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QUFLLEVBQUUsQ0FBQztLQUNsQzs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDaEM7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2pDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQzs7O1NBekpHLFdBQVc7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUE0SnpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6IkJ1Y2tUb29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBTaW11bGF0b3JEcm9wZG93biA9IHJlcXVpcmUoJy4vU2ltdWxhdG9yRHJvcGRvd24nKTtcbmNvbnN0IEJ1Y2tUb29sYmFyQWN0aW9ucyA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJBY3Rpb25zJyk7XG5jb25zdCBCdWNrVG9vbGJhclN0b3JlID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhclN0b3JlJyk7XG5pbXBvcnQge0NvbWJvYm94fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Db21ib2JveCc7XG5pbXBvcnQge0NoZWNrYm94fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9DaGVja2JveCc7XG5pbXBvcnQge1xuICBCdXR0b24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5pbXBvcnQge1xuICBCdXR0b25Hcm91cCxcbiAgQnV0dG9uR3JvdXBTaXplcyxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uR3JvdXAnO1xuXG5jb25zdCB7ZGVib3VuY2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5jb25zdCB7XG4gIGF0b21FdmVudERlYm91bmNlLFxufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJyk7XG5jb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPSBhdG9tRXZlbnREZWJvdW5jZTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEJVQ0tfVEFSR0VUX0lOUFVUX1dJRFRIID0gNDAwO1xuY29uc3QgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UgPSAoKSA9PiAnSW52YWxpZCAuYnVja2NvbmZpZyc7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIFRoZSB0b29sYmFyIG1ha2VzIGFuIGVmZm9ydCB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIEJ1Y2tQcm9qZWN0IHRvIGFjdCBvbiwgYmFzZWQgb24gdGhlIGxhc3RcbiAgICogVGV4dEVkaXRvciB0aGF0IGhhZCBmb2N1cyB0aGF0IGNvcnJlc3BvbmRlZCB0byBhIEJ1Y2tQcm9qZWN0LiBUaGlzIG1lYW5zIHRoYXQgaWYgYSB1c2VyIG9wZW5zXG4gICAqIGFuIGVkaXRvciBmb3IgYSBmaWxlIGluIGEgQnVjayBwcm9qZWN0LCB0eXBlcyBpbiBhIGJ1aWxkIHRhcmdldCwgZm9jdXNlcyBhbiBlZGl0b3IgZm9yIGEgZmlsZVxuICAgKiB0aGF0IGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LCBhbmQgaGl0cyBcIkJ1aWxkLFwiIHRoZSB0b29sYmFyIHdpbGwgYnVpbGQgdGhlIHRhcmdldCBpbiB0aGVcbiAgICogcHJvamVjdCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBlZGl0b3IgdGhhdCBwcmV2aW91c2x5IGhhZCBmb2N1cy5cbiAgICpcbiAgICogVWx0aW1hdGVseSwgd2Ugc2hvdWxkIGhhdmUgYSBkcm9wZG93biB0byBsZXQgdGhlIHVzZXIgc3BlY2lmeSB0aGUgQnVjayBwcm9qZWN0IHdoZW4gaXQgaXNcbiAgICogYW1iaWd1b3VzLlxuICAgKi9cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYnVja1Rvb2xiYXJTdG9yZTogQnVja1Rvb2xiYXJTdG9yZTtcbiAgX2J1Y2tUb29sYmFyQWN0aW9uczogQnVja1Rvb2xiYXJBY3Rpb25zO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEJ1Y2tUb29sYmFyU3RvcmUpLmlzUmVxdWlyZWQsXG4gICAgYWN0aW9uczogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UgPVxuICAgICAgZGVib3VuY2UodGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UuYmluZCh0aGlzKSwgMTAwLCBmYWxzZSk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IgPSB0aGlzLl9oYW5kbGVSZXF1ZXN0T3B0aW9uc0Vycm9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNpbXVsYXRvckNoYW5nZSA9IHRoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkID1cbiAgICAgIHRoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcmVxdWVzdE9wdGlvbnMgPSB0aGlzLl9yZXF1ZXN0T3B0aW9ucy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9idWlsZCA9IHRoaXMuX2J1aWxkLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3J1biA9IHRoaXMuX3J1bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl90ZXN0ID0gdGhpcy5fdGVzdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMgPSB0aGlzLnByb3BzLmFjdGlvbnM7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMucHJvcHMuc3RvcmU7XG4gICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKFxuICAgICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQuYmluZCh0aGlzKSkpO1xuXG4gICAgLy8gUmUtcmVuZGVyIHdoZW5ldmVyIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZm9yY2VVcGRhdGUoKTsgfSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkKGl0ZW06ID9PYmplY3QpIHtcbiAgICBpZiAoIWF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yID0gKChpdGVtOiBhbnkpOiBUZXh0RWRpdG9yKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUHJvamVjdEZvcih0ZXh0RWRpdG9yKTtcbiAgfVxuXG4gIF9yZXF1ZXN0T3B0aW9ucyhpbnB1dFRleHQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9idWNrVG9vbGJhclN0b3JlLmxvYWRBbGlhc2VzKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMuX2J1Y2tUb29sYmFyU3RvcmU7XG4gICAgY29uc3QgZGlzYWJsZWQgPSAhYnVja1Rvb2xiYXJTdG9yZS5nZXRCdWlsZFRhcmdldCgpIHx8IGJ1Y2tUb29sYmFyU3RvcmUuaXNCdWlsZGluZygpO1xuICAgIGxldCBzZXJ2ZXJNb2RlQ2hlY2tib3g7XG4gICAgaWYgKGJ1Y2tUb29sYmFyU3RvcmUuaXNSZWFjdE5hdGl2ZUFwcCgpKSB7XG4gICAgICBzZXJ2ZXJNb2RlQ2hlY2tib3ggPVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgY2hlY2tlZD17YnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWR9XG4gICAgICAgICAgICBsYWJlbD17J1JlYWN0IE5hdGl2ZSBTZXJ2ZXIgTW9kZSd9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbiAgICBsZXQgcHJvZ3Jlc3NCYXI7XG4gICAgaWYgKGJ1Y2tUb29sYmFyU3RvcmUuaXNCdWlsZGluZygpKSB7XG4gICAgICBwcm9ncmVzc0JhciA9XG4gICAgICAgIDxwcm9ncmVzc1xuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBidWNrLXRvb2xiYXItcHJvZ3Jlc3MtYmFyXCJcbiAgICAgICAgICB2YWx1ZT17YnVja1Rvb2xiYXJTdG9yZS5nZXRCdWlsZFByb2dyZXNzKCl9XG4gICAgICAgIC8+O1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJidWNrLXRvb2xiYXIgcGFkZGVkIHRvb2wtcGFuZWxcIlxuICAgICAgICBoaWRkZW49eyFidWNrVG9vbGJhclN0b3JlLmlzUGFuZWxWaXNpYmxlKCl9PlxuICAgICAgICA8Q29tYm9ib3hcbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIHJlZj1cImJ1aWxkVGFyZ2V0XCJcbiAgICAgICAgICBmb3JtYXRSZXF1ZXN0T3B0aW9uc0Vycm9yTWVzc2FnZT17Zm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2V9XG4gICAgICAgICAgb25SZXF1ZXN0T3B0aW9uc0Vycm9yPXt0aGlzLl9oYW5kbGVSZXF1ZXN0T3B0aW9uc0Vycm9yfVxuICAgICAgICAgIHJlcXVlc3RPcHRpb25zPXt0aGlzLl9yZXF1ZXN0T3B0aW9uc31cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIGxvYWRpbmdNZXNzYWdlPVwiVXBkYXRpbmcgdGFyZ2V0IG5hbWVzLi4uXCJcbiAgICAgICAgICBpbml0aWFsVGV4dElucHV0PXt0aGlzLnByb3BzLnN0b3JlLmdldEJ1aWxkVGFyZ2V0KCl9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIkJ1Y2sgYnVpbGQgdGFyZ2V0XCJcbiAgICAgICAgICB3aWR0aD17QlVDS19UQVJHRVRfSU5QVVRfV0lEVEh9XG4gICAgICAgIC8+XG4gICAgICAgIDxTaW11bGF0b3JEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgZGlzYWJsZWQ9e2J1Y2tUb29sYmFyU3RvcmUuZ2V0UnVsZVR5cGUoKSAhPT0gJ2FwcGxlX2J1bmRsZSd9XG4gICAgICAgICAgdGl0bGU9XCJDaG9vc2UgdGFyZ2V0IGRldmljZVwiXG4gICAgICAgICAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZT17dGhpcy5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgICA8QnV0dG9uR3JvdXAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCIgc2l6ZT17QnV0dG9uR3JvdXBTaXplcy5TTUFMTH0+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9idWlsZH0gZGlzYWJsZWQ9e2Rpc2FibGVkfT5CdWlsZDwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5fcnVufSBkaXNhYmxlZD17ZGlzYWJsZWR9PlJ1bjwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5fdGVzdH0gZGlzYWJsZWQ9e2Rpc2FibGVkfT5UZXN0PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9kZWJ1Z30gZGlzYWJsZWQ9e2Rpc2FibGVkfT5EZWJ1ZzwvQnV0dG9uPlxuICAgICAgICA8L0J1dHRvbkdyb3VwPlxuICAgICAgICB7c2VydmVyTW9kZUNoZWNrYm94fVxuICAgICAgICB7cHJvZ3Jlc3NCYXJ9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlQnVpbGRUYXJnZXQodmFsdWUpO1xuICB9XG5cbiAgX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgJ0ZhaWxlZCB0byBnZXQgdGFyZ2V0cyBmcm9tIEJ1Y2snLFxuICAgICAge2RldGFpbDogZXJyb3IubWVzc2FnZX0sXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTaW11bGF0b3JDaGFuZ2Uoc2ltdWxhdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlU2ltdWxhdG9yKHNpbXVsYXRvcik7XG4gIH1cblxuICBfaGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZChjaGVja2VkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnVwZGF0ZVJlYWN0TmF0aXZlU2VydmVyTW9kZShjaGVja2VkKTtcbiAgfVxuXG4gIF9idWlsZCgpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMuYnVpbGQoKTtcbiAgfVxuXG4gIF9ydW4oKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnJ1bigpO1xuICB9XG5cbiAgX3Rlc3QoKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLnRlc3QoKTtcbiAgfVxuXG4gIF9kZWJ1ZygpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMuZGVidWcoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1Y2tUb29sYmFyO1xuIl19