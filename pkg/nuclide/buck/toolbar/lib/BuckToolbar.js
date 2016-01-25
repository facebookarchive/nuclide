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

var React = require('react-for-atom');
var SimulatorDropdown = require('./SimulatorDropdown');
var BuckToolbarActions = require('./BuckToolbarActions');
var BuckToolbarStore = require('./BuckToolbarStore');

var _require2 = require('../../../commons');

var debounce = _require2.debounce;

var _require3 = require('../../../atom-helpers');

var atomEventDebounce = _require3.atomEventDebounce;
var isTextEditor = _require3.isTextEditor;
var onWorkspaceDidStopChangingActivePaneItem = atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

var BuckToolbar = (function (_React$Component) {
  _inherits(BuckToolbar, _React$Component);

  function BuckToolbar(props) {
    var _this = this;

    _classCallCheck(this, BuckToolbar);

    _get(Object.getPrototypeOf(BuckToolbar.prototype), 'constructor', this).call(this, props);
    this._handleBuildTargetChange = debounce(this._handleBuildTargetChange.bind(this), 100, false);
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
          hidden: !buckToolbarStore.isPanelVisible()
        },
        React.createElement(AtomComboBox, {
          className: 'inline-block',
          ref: 'buildTarget',
          requestOptions: this._requestOptions,
          size: 'sm',
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

BuckToolbar.propTypes = {
  store: React.PropTypes.instanceOf(BuckToolbarStore).isRequired,
  actions: React.PropTypes.instanceOf(BuckToolbarActions).isRequired
};

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
//# sourceMappingURL=data:application/json;base64,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QUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFa0MsNkNBQUMsT0FBZ0IsRUFBRTtBQUNwRCxVQUFJLENBQUMsbUJBQW1CLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0Q7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNoQzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7OztTQWxJRyxXQUFXO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBcUl6QyxXQUFXLENBQUMsU0FBUyxHQUFHO0FBQ3RCLE9BQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVU7QUFDOUQsU0FBTyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVTtDQUNuRSxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6IkJ1Y2tUb29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUNvbWJvQm94ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvYXRvbS1jb21iby1ib3gnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFNpbXVsYXRvckRyb3Bkb3duID0gcmVxdWlyZSgnLi9TaW11bGF0b3JEcm9wZG93bicpO1xuY29uc3QgQnVja1Rvb2xiYXJBY3Rpb25zID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhckFjdGlvbnMnKTtcbmNvbnN0IEJ1Y2tUb29sYmFyU3RvcmUgPSByZXF1aXJlKCcuL0J1Y2tUb29sYmFyU3RvcmUnKTtcbmltcG9ydCBOdWNsaWRlQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vdWkvY2hlY2tib3gnO1xuXG5jb25zdCB7ZGVib3VuY2V9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuY29uc3Qge1xuICBhdG9tRXZlbnREZWJvdW5jZSxcbiAgaXNUZXh0RWRpdG9yLFxufSA9IHJlcXVpcmUoJy4uLy4uLy4uL2F0b20taGVscGVycycpO1xuY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID0gYXRvbUV2ZW50RGVib3VuY2U7XG5cbmNsYXNzIEJ1Y2tUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAvKipcbiAgICogVGhlIHRvb2xiYXIgbWFrZXMgYW4gZWZmb3J0IHRvIGtlZXAgdHJhY2sgb2Ygd2hpY2ggQnVja1Byb2plY3QgdG8gYWN0IG9uLCBiYXNlZCBvbiB0aGUgbGFzdFxuICAgKiBUZXh0RWRpdG9yIHRoYXQgaGFkIGZvY3VzIHRoYXQgY29ycmVzcG9uZGVkIHRvIGEgQnVja1Byb2plY3QuIFRoaXMgbWVhbnMgdGhhdCBpZiBhIHVzZXIgb3BlbnNcbiAgICogYW4gZWRpdG9yIGZvciBhIGZpbGUgaW4gYSBCdWNrIHByb2plY3QsIHR5cGVzIGluIGEgYnVpbGQgdGFyZ2V0LCBmb2N1c2VzIGFuIGVkaXRvciBmb3IgYSBmaWxlXG4gICAqIHRoYXQgaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QsIGFuZCBoaXRzIFwiQnVpbGQsXCIgdGhlIHRvb2xiYXIgd2lsbCBidWlsZCB0aGUgdGFyZ2V0IGluIHRoZVxuICAgKiBwcm9qZWN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGVkaXRvciB0aGF0IHByZXZpb3VzbHkgaGFkIGZvY3VzLlxuICAgKlxuICAgKiBVbHRpbWF0ZWx5LCB3ZSBzaG91bGQgaGF2ZSBhIGRyb3Bkb3duIHRvIGxldCB0aGUgdXNlciBzcGVjaWZ5IHRoZSBCdWNrIHByb2plY3Qgd2hlbiBpdCBpc1xuICAgKiBhbWJpZ3VvdXMuXG4gICAqL1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9idWNrVG9vbGJhclN0b3JlOiBCdWNrVG9vbGJhclN0b3JlO1xuICBfYnVja1Rvb2xiYXJBY3Rpb25zOiBCdWNrVG9vbGJhckFjdGlvbnM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlID0gZGVib3VuY2UodGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UuYmluZCh0aGlzKSwgMTAwLCBmYWxzZSk7XG4gICAgdGhpcy5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlID0gdGhpcy5faGFuZGxlU2ltdWxhdG9yQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZCA9IHRoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXF1ZXN0T3B0aW9ucyA9IHRoaXMuX3JlcXVlc3RPcHRpb25zLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYnVpbGQgPSB0aGlzLl9idWlsZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3J1biA9IHRoaXMuX3J1bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2RlYnVnID0gdGhpcy5fZGVidWcuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMgPSB0aGlzLnByb3BzLmFjdGlvbnM7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJTdG9yZSA9IHRoaXMucHJvcHMuc3RvcmU7XG5cbiAgICB0aGlzLl9vbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlZChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fYnVja1Rvb2xiYXJTdG9yZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oXG4gICAgICB0aGlzLl9vbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlZC5iaW5kKHRoaXMpKSk7XG5cbiAgICAvLyBSZS1yZW5kZXIgd2hlbmV2ZXIgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGNoYW5nZXMuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUuc3Vic2NyaWJlKCgpID0+IHsgdGhpcy5mb3JjZVVwZGF0ZSgpOyB9KSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoaXRlbTogP09iamVjdCkge1xuICAgIGlmICghaXNUZXh0RWRpdG9yKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRleHRFZGl0b3I6IFRleHRFZGl0b3IgPSAoKGl0ZW06IGFueSk6IFRleHRFZGl0b3IpO1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVQcm9qZWN0Rm9yKHRleHRFZGl0b3IpO1xuICB9XG5cbiAgX3JlcXVlc3RPcHRpb25zKGlucHV0VGV4dDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUubG9hZEFsaWFzZXMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGJ1Y2tUb29sYmFyU3RvcmUgPSB0aGlzLl9idWNrVG9vbGJhclN0b3JlO1xuICAgIGNvbnN0IGRpc2FibGVkID0gIWJ1Y2tUb29sYmFyU3RvcmUuZ2V0QnVpbGRUYXJnZXQoKSB8fCBidWNrVG9vbGJhclN0b3JlLmlzQnVpbGRpbmcoKTtcbiAgICBsZXQgc2VydmVyTW9kZUNoZWNrYm94O1xuICAgIGlmIChidWNrVG9vbGJhclN0b3JlLmlzUmVhY3ROYXRpdmVBcHAoKSkge1xuICAgICAgc2VydmVyTW9kZUNoZWNrYm94ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8TnVjbGlkZUNoZWNrYm94XG4gICAgICAgICAgICBjaGVja2VkPXtidWNrVG9vbGJhclN0b3JlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKCl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZH1cbiAgICAgICAgICAgIGxhYmVsPXsnUmVhY3QgTmF0aXZlIFNlcnZlciBNb2RlJ31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuICAgIGxldCBwcm9ncmVzc0JhcjtcbiAgICBpZiAoYnVja1Rvb2xiYXJTdG9yZS5pc0J1aWxkaW5nKCkpIHtcbiAgICAgIHByb2dyZXNzQmFyID1cbiAgICAgICAgPHByb2dyZXNzXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGJ1Y2stdG9vbGJhci1wcm9ncmVzcy1iYXJcIlxuICAgICAgICAgIHZhbHVlPXtidWNrVG9vbGJhclN0b3JlLmdldEJ1aWxkUHJvZ3Jlc3MoKX1cbiAgICAgICAgLz47XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImJ1Y2stdG9vbGJhciBwYWRkZWQgdG9vbC1wYW5lbFwiXG4gICAgICAgIGhpZGRlbj17IWJ1Y2tUb29sYmFyU3RvcmUuaXNQYW5lbFZpc2libGUoKX1cbiAgICAgID5cbiAgICAgICAgPEF0b21Db21ib0JveFxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgcmVmPVwiYnVpbGRUYXJnZXRcIlxuICAgICAgICAgIHJlcXVlc3RPcHRpb25zPXt0aGlzLl9yZXF1ZXN0T3B0aW9uc31cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIGluaXRpYWxUZXh0SW5wdXQ9e3RoaXMucHJvcHMuc3RvcmUuZ2V0QnVpbGRUYXJnZXQoKX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2V9XG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiQnVjayBidWlsZCB0YXJnZXRcIlxuICAgICAgICAvPlxuICAgICAgICA8U2ltdWxhdG9yRHJvcGRvd25cbiAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgIGRpc2FibGVkPXtidWNrVG9vbGJhclN0b3JlLmdldFJ1bGVUeXBlKCkgIT09ICdhcHBsZV9idW5kbGUnfVxuICAgICAgICAgIHRpdGxlPVwiQ2hvb3NlIHRhcmdldCBkZXZpY2VcIlxuICAgICAgICAgIG9uU2VsZWN0ZWRTaW11bGF0b3JDaGFuZ2U9e3RoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgYnRuLWdyb3VwLXNtIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fYnVpbGR9IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+QnVpbGQ8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3J1bn0gZGlzYWJsZWQ9e2Rpc2FibGVkfSBjbGFzc05hbWU9XCJidG5cIj5SdW48L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2RlYnVnfSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPkRlYnVnPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7c2VydmVyTW9kZUNoZWNrYm94fVxuICAgICAgICB7cHJvZ3Jlc3NCYXJ9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlQnVpbGRUYXJnZXQodmFsdWUpO1xuICB9XG5cbiAgX2hhbmRsZVNpbXVsYXRvckNoYW5nZShzaW11bGF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yKTtcbiAgfVxuXG4gIF9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKGNoZWNrZWQpO1xuICB9XG5cbiAgX2J1aWxkKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5idWlsZCgpO1xuICB9XG5cbiAgX3J1bigpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMucnVuKCk7XG4gIH1cblxuICBfZGVidWcoKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLmRlYnVnKCk7XG4gIH1cbn1cblxuQnVja1Rvb2xiYXIucHJvcFR5cGVzID0ge1xuICBzdG9yZTogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJTdG9yZSkuaXNSZXF1aXJlZCxcbiAgYWN0aW9uczogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoQnVja1Rvb2xiYXJBY3Rpb25zKS5pc1JlcXVpcmVkLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWNrVG9vbGJhcjtcbiJdfQ==