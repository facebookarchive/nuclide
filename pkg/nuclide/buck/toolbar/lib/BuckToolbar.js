var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _uiCheckbox = require('../../../ui/checkbox');

var _uiCheckbox2 = _interopRequireDefault(_uiCheckbox);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomComboBox = require('../../../ui/atom-combo-box');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('react-for-atom');

var React = _require2.React;

var SimulatorDropdown = require('./SimulatorDropdown');
var BuckToolbarActions = require('./BuckToolbarActions');
var BuckToolbarStore = require('./BuckToolbarStore');

var _require3 = require('../../../commons');

var debounce = _require3.debounce;

var _require4 = require('../../../atom-helpers');

var atomEventDebounce = _require4.atomEventDebounce;
var isTextEditor = _require4.isTextEditor;
var onWorkspaceDidStopChangingActivePaneItem = atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;
var PropTypes = React.PropTypes;

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
          React.createElement(_uiCheckbox2['default'], {
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
          placeholderText: 'Buck build target'
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
//# sourceMappingURL=data:application/json;base64,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LEtBQUssQ0FBQyxTQUFTOztBQXFKekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiQnVja1Rvb2xiYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBBdG9tQ29tYm9Cb3ggPSByZXF1aXJlKCcuLi8uLi8uLi91aS9hdG9tLWNvbWJvLWJveCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBTaW11bGF0b3JEcm9wZG93biA9IHJlcXVpcmUoJy4vU2ltdWxhdG9yRHJvcGRvd24nKTtcbmNvbnN0IEJ1Y2tUb29sYmFyQWN0aW9ucyA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJBY3Rpb25zJyk7XG5jb25zdCBCdWNrVG9vbGJhclN0b3JlID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhclN0b3JlJyk7XG5pbXBvcnQgTnVjbGlkZUNoZWNrYm94IGZyb20gJy4uLy4uLy4uL3VpL2NoZWNrYm94JztcblxuY29uc3Qge2RlYm91bmNlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IHtcbiAgYXRvbUV2ZW50RGVib3VuY2UsXG4gIGlzVGV4dEVkaXRvcixcbn0gPSByZXF1aXJlKCcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9IGF0b21FdmVudERlYm91bmNlO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UgPSAoKSA9PiAnSW52YWxpZCAuYnVja2NvbmZpZyc7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIFRoZSB0b29sYmFyIG1ha2VzIGFuIGVmZm9ydCB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIEJ1Y2tQcm9qZWN0IHRvIGFjdCBvbiwgYmFzZWQgb24gdGhlIGxhc3RcbiAgICogVGV4dEVkaXRvciB0aGF0IGhhZCBmb2N1cyB0aGF0IGNvcnJlc3BvbmRlZCB0byBhIEJ1Y2tQcm9qZWN0LiBUaGlzIG1lYW5zIHRoYXQgaWYgYSB1c2VyIG9wZW5zXG4gICAqIGFuIGVkaXRvciBmb3IgYSBmaWxlIGluIGEgQnVjayBwcm9qZWN0LCB0eXBlcyBpbiBhIGJ1aWxkIHRhcmdldCwgZm9jdXNlcyBhbiBlZGl0b3IgZm9yIGEgZmlsZVxuICAgKiB0aGF0IGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LCBhbmQgaGl0cyBcIkJ1aWxkLFwiIHRoZSB0b29sYmFyIHdpbGwgYnVpbGQgdGhlIHRhcmdldCBpbiB0aGVcbiAgICogcHJvamVjdCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBlZGl0b3IgdGhhdCBwcmV2aW91c2x5IGhhZCBmb2N1cy5cbiAgICpcbiAgICogVWx0aW1hdGVseSwgd2Ugc2hvdWxkIGhhdmUgYSBkcm9wZG93biB0byBsZXQgdGhlIHVzZXIgc3BlY2lmeSB0aGUgQnVjayBwcm9qZWN0IHdoZW4gaXQgaXNcbiAgICogYW1iaWd1b3VzLlxuICAgKi9cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYnVja1Rvb2xiYXJTdG9yZTogQnVja1Rvb2xiYXJTdG9yZTtcbiAgX2J1Y2tUb29sYmFyQWN0aW9uczogQnVja1Rvb2xiYXJBY3Rpb25zO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEJ1Y2tUb29sYmFyU3RvcmUpLmlzUmVxdWlyZWQsXG4gICAgYWN0aW9uczogUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UgPVxuICAgICAgZGVib3VuY2UodGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UuYmluZCh0aGlzKSwgMTAwLCBmYWxzZSk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVJlcXVlc3RPcHRpb25zRXJyb3IgPSB0aGlzLl9oYW5kbGVSZXF1ZXN0T3B0aW9uc0Vycm9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVNpbXVsYXRvckNoYW5nZSA9IHRoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkID1cbiAgICAgIHRoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fcmVxdWVzdE9wdGlvbnMgPSB0aGlzLl9yZXF1ZXN0T3B0aW9ucy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9idWlsZCA9IHRoaXMuX2J1aWxkLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3J1biA9IHRoaXMuX3J1bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMgPSB0aGlzLnByb3BzLmFjdGlvbnM7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMucHJvcHMuc3RvcmU7XG4gICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKFxuICAgICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQuYmluZCh0aGlzKSkpO1xuXG4gICAgLy8gUmUtcmVuZGVyIHdoZW5ldmVyIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZm9yY2VVcGRhdGUoKTsgfSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkKGl0ZW06ID9PYmplY3QpIHtcbiAgICBpZiAoIWlzVGV4dEVkaXRvcihpdGVtKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yID0gKChpdGVtOiBhbnkpOiBUZXh0RWRpdG9yKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUHJvamVjdEZvcih0ZXh0RWRpdG9yKTtcbiAgfVxuXG4gIF9yZXF1ZXN0T3B0aW9ucyhpbnB1dFRleHQ6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9idWNrVG9vbGJhclN0b3JlLmxvYWRBbGlhc2VzKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBidWNrVG9vbGJhclN0b3JlID0gdGhpcy5fYnVja1Rvb2xiYXJTdG9yZTtcbiAgICBjb25zdCBkaXNhYmxlZCA9ICFidWNrVG9vbGJhclN0b3JlLmdldEJ1aWxkVGFyZ2V0KCkgfHwgYnVja1Rvb2xiYXJTdG9yZS5pc0J1aWxkaW5nKCk7XG4gICAgbGV0IHNlcnZlck1vZGVDaGVja2JveDtcbiAgICBpZiAoYnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlQXBwKCkpIHtcbiAgICAgIHNlcnZlck1vZGVDaGVja2JveCA9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICAgICAgY2hlY2tlZD17YnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWR9XG4gICAgICAgICAgICBsYWJlbD17J1JlYWN0IE5hdGl2ZSBTZXJ2ZXIgTW9kZSd9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbiAgICBsZXQgcHJvZ3Jlc3NCYXI7XG4gICAgaWYgKGJ1Y2tUb29sYmFyU3RvcmUuaXNCdWlsZGluZygpKSB7XG4gICAgICBwcm9ncmVzc0JhciA9XG4gICAgICAgIDxwcm9ncmVzc1xuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBidWNrLXRvb2xiYXItcHJvZ3Jlc3MtYmFyXCJcbiAgICAgICAgICB2YWx1ZT17YnVja1Rvb2xiYXJTdG9yZS5nZXRCdWlsZFByb2dyZXNzKCl9XG4gICAgICAgIC8+O1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJidWNrLXRvb2xiYXIgcGFkZGVkIHRvb2wtcGFuZWxcIlxuICAgICAgICBoaWRkZW49eyFidWNrVG9vbGJhclN0b3JlLmlzUGFuZWxWaXNpYmxlKCl9PlxuICAgICAgICA8QXRvbUNvbWJvQm94XG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICByZWY9XCJidWlsZFRhcmdldFwiXG4gICAgICAgICAgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2U9e2Zvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlfVxuICAgICAgICAgIG9uUmVxdWVzdE9wdGlvbnNFcnJvcj17dGhpcy5faGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcn1cbiAgICAgICAgICByZXF1ZXN0T3B0aW9ucz17dGhpcy5fcmVxdWVzdE9wdGlvbnN9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZT1cIlVwZGF0aW5nIHRhcmdldCBuYW1lcy4uLlwiXG4gICAgICAgICAgaW5pdGlhbFRleHRJbnB1dD17dGhpcy5wcm9wcy5zdG9yZS5nZXRCdWlsZFRhcmdldCgpfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZX1cbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJCdWNrIGJ1aWxkIHRhcmdldFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxTaW11bGF0b3JEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgZGlzYWJsZWQ9e2J1Y2tUb29sYmFyU3RvcmUuZ2V0UnVsZVR5cGUoKSAhPT0gJ2FwcGxlX2J1bmRsZSd9XG4gICAgICAgICAgdGl0bGU9XCJDaG9vc2UgdGFyZ2V0IGRldmljZVwiXG4gICAgICAgICAgb25TZWxlY3RlZFNpbXVsYXRvckNoYW5nZT17dGhpcy5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cCBidG4tZ3JvdXAtc20gaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9idWlsZH0gZGlzYWJsZWQ9e2Rpc2FibGVkfSBjbGFzc05hbWU9XCJidG5cIj5CdWlsZDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fcnVufSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPlJ1bjwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fZGVidWd9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+RGVidWc8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtzZXJ2ZXJNb2RlQ2hlY2tib3h9XG4gICAgICAgIHtwcm9ncmVzc0Jhcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVCdWlsZFRhcmdldCh2YWx1ZSk7XG4gIH1cblxuICBfaGFuZGxlUmVxdWVzdE9wdGlvbnNFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIGdldCB0YXJnZXRzIGZyb20gQnVjaycsXG4gICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfSxcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNpbXVsYXRvckNoYW5nZShzaW11bGF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yKTtcbiAgfVxuXG4gIF9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKGNoZWNrZWQpO1xuICB9XG5cbiAgX2J1aWxkKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5idWlsZCgpO1xuICB9XG5cbiAgX3J1bigpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMucnVuKCk7XG4gIH1cblxuICBfZGVidWcoKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLmRlYnVnKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhcjtcbiJdfQ==