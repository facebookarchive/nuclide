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

var _require2 = require('flux');

var Dispatcher = _require2.Dispatcher;
var PropTypes = React.PropTypes;

var SimulatorDropdown = require('./SimulatorDropdown');
var BuckToolbarActions = require('./BuckToolbarActions');
var BuckToolbarStore = require('./BuckToolbarStore');

var _require3 = require('../../../commons');

var debounce = _require3.debounce;

var _require4 = require('../../../atom-helpers');

var atomEventDebounce = _require4.atomEventDebounce;
var isTextEditor = _require4.isTextEditor;
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

    var dispatcher = new Dispatcher();
    this._buckToolbarActions = new BuckToolbarActions(dispatcher);
    this._buckToolbarStore = new BuckToolbarStore(dispatcher, {
      isReactNativeServerMode: props.initialIsReactNativeServerMode || false
    });

    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());
    this._handleBuildTargetChange(this.props.initialBuildTarget);

    this._disposables = new CompositeDisposable();
    this._disposables.add(this._buckToolbarStore);
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(this._onActivePaneItemChanged.bind(this)));

    this._disposables.add(this._buckToolbarStore.subscribe(function () {
      _this.props.onIsReactNativeServerModeChange(_this._buckToolbarStore.isReactNativeServerMode());
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
        { className: 'buck-toolbar block' },
        React.createElement(AtomComboBox, {
          className: 'inline-block',
          ref: 'buildTarget',
          requestOptions: this._requestOptions,
          size: 'sm',
          initialTextInput: this.props.initialBuildTarget,
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
      this.props.onBuildTargetChange(value);
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
  initialBuildTarget: PropTypes.string,
  onBuildTargetChange: PropTypes.func.isRequired,
  initialIsReactNativeServerMode: PropTypes.bool,
  onIsReactNativeServerModeChange: PropTypes.func.isRequired
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
//# sourceMappingURL=data:application/json;base64,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YmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUNvbWJvQm94ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvYXRvbS1jb21iby1ib3gnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtEaXNwYXRjaGVyfSA9IHJlcXVpcmUoJ2ZsdXgnKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBTaW11bGF0b3JEcm9wZG93biA9IHJlcXVpcmUoJy4vU2ltdWxhdG9yRHJvcGRvd24nKTtcbmNvbnN0IEJ1Y2tUb29sYmFyQWN0aW9ucyA9IHJlcXVpcmUoJy4vQnVja1Rvb2xiYXJBY3Rpb25zJyk7XG5jb25zdCBCdWNrVG9vbGJhclN0b3JlID0gcmVxdWlyZSgnLi9CdWNrVG9vbGJhclN0b3JlJyk7XG5pbXBvcnQgTnVjbGlkZUNoZWNrYm94IGZyb20gJy4uLy4uLy4uL3VpL2NoZWNrYm94JztcblxuY29uc3Qge2RlYm91bmNlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IHtcbiAgYXRvbUV2ZW50RGVib3VuY2UsXG4gIGlzVGV4dEVkaXRvcixcbn0gPSByZXF1aXJlKCcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9IGF0b21FdmVudERlYm91bmNlO1xuXG5jbGFzcyBCdWNrVG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgLyoqXG4gICAqIFRoZSB0b29sYmFyIG1ha2VzIGFuIGVmZm9ydCB0byBrZWVwIHRyYWNrIG9mIHdoaWNoIEJ1Y2tQcm9qZWN0IHRvIGFjdCBvbiwgYmFzZWQgb24gdGhlIGxhc3RcbiAgICogVGV4dEVkaXRvciB0aGF0IGhhZCBmb2N1cyB0aGF0IGNvcnJlc3BvbmRlZCB0byBhIEJ1Y2tQcm9qZWN0LiBUaGlzIG1lYW5zIHRoYXQgaWYgYSB1c2VyIG9wZW5zXG4gICAqIGFuIGVkaXRvciBmb3IgYSBmaWxlIGluIGEgQnVjayBwcm9qZWN0LCB0eXBlcyBpbiBhIGJ1aWxkIHRhcmdldCwgZm9jdXNlcyBhbiBlZGl0b3IgZm9yIGEgZmlsZVxuICAgKiB0aGF0IGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LCBhbmQgaGl0cyBcIkJ1aWxkLFwiIHRoZSB0b29sYmFyIHdpbGwgYnVpbGQgdGhlIHRhcmdldCBpbiB0aGVcbiAgICogcHJvamVjdCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBlZGl0b3IgdGhhdCBwcmV2aW91c2x5IGhhZCBmb2N1cy5cbiAgICpcbiAgICogVWx0aW1hdGVseSwgd2Ugc2hvdWxkIGhhdmUgYSBkcm9wZG93biB0byBsZXQgdGhlIHVzZXIgc3BlY2lmeSB0aGUgQnVjayBwcm9qZWN0IHdoZW4gaXQgaXNcbiAgICogYW1iaWd1b3VzLlxuICAgKi9cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYnVja1Rvb2xiYXJTdG9yZTogQnVja1Rvb2xiYXJTdG9yZTtcbiAgX2J1Y2tUb29sYmFyQWN0aW9uczogQnVja1Rvb2xiYXJBY3Rpb25zO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZSA9IGRlYm91bmNlKHRoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlLmJpbmQodGhpcyksIDEwMCwgZmFsc2UpO1xuICAgIHRoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZSA9IHRoaXMuX2hhbmRsZVNpbXVsYXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZVJlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQgPSB0aGlzLl9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVxdWVzdE9wdGlvbnMgPSB0aGlzLl9yZXF1ZXN0T3B0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2J1aWxkID0gdGhpcy5fYnVpbGQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ydW4gPSB0aGlzLl9ydW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG5cbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMgPSBuZXcgQnVja1Rvb2xiYXJBY3Rpb25zKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUgPSBuZXcgQnVja1Rvb2xiYXJTdG9yZShkaXNwYXRjaGVyLCB7XG4gICAgICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZTogcHJvcHMuaW5pdGlhbElzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlIHx8IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSk7XG4gICAgdGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2UodGhpcy5wcm9wcy5pbml0aWFsQnVpbGRUYXJnZXQpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQob25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgIHRoaXMuX29uQWN0aXZlUGFuZUl0ZW1DaGFuZ2VkLmJpbmQodGhpcykpKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9idWNrVG9vbGJhclN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLm9uSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2UodGhpcy5fYnVja1Rvb2xiYXJTdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpKTtcbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9KSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfb25BY3RpdmVQYW5lSXRlbUNoYW5nZWQoaXRlbTogP09iamVjdCkge1xuICAgIGlmICghaXNUZXh0RWRpdG9yKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRleHRFZGl0b3I6IFRleHRFZGl0b3IgPSAoKGl0ZW06IGFueSk6IFRleHRFZGl0b3IpO1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVQcm9qZWN0Rm9yKHRleHRFZGl0b3IpO1xuICB9XG5cbiAgX3JlcXVlc3RPcHRpb25zKGlucHV0VGV4dDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2J1Y2tUb29sYmFyU3RvcmUubG9hZEFsaWFzZXMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGJ1Y2tUb29sYmFyU3RvcmUgPSB0aGlzLl9idWNrVG9vbGJhclN0b3JlO1xuICAgIGNvbnN0IGRpc2FibGVkID0gIWJ1Y2tUb29sYmFyU3RvcmUuZ2V0QnVpbGRUYXJnZXQoKSB8fCBidWNrVG9vbGJhclN0b3JlLmlzQnVpbGRpbmcoKTtcbiAgICBsZXQgc2VydmVyTW9kZUNoZWNrYm94O1xuICAgIGlmIChidWNrVG9vbGJhclN0b3JlLmlzUmVhY3ROYXRpdmVBcHAoKSkge1xuICAgICAgc2VydmVyTW9kZUNoZWNrYm94ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8TnVjbGlkZUNoZWNrYm94XG4gICAgICAgICAgICBjaGVja2VkPXtidWNrVG9vbGJhclN0b3JlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKCl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZH1cbiAgICAgICAgICAgIGxhYmVsPXsnUmVhY3QgTmF0aXZlIFNlcnZlciBNb2RlJ31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuICAgIGxldCBwcm9ncmVzc0JhcjtcbiAgICBpZiAoYnVja1Rvb2xiYXJTdG9yZS5pc0J1aWxkaW5nKCkpIHtcbiAgICAgIHByb2dyZXNzQmFyID1cbiAgICAgICAgPHByb2dyZXNzXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGJ1Y2stdG9vbGJhci1wcm9ncmVzcy1iYXJcIlxuICAgICAgICAgIHZhbHVlPXtidWNrVG9vbGJhclN0b3JlLmdldEJ1aWxkUHJvZ3Jlc3MoKX1cbiAgICAgICAgLz47XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ1Y2stdG9vbGJhciBibG9ja1wiPlxuICAgICAgICA8QXRvbUNvbWJvQm94XG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICByZWY9XCJidWlsZFRhcmdldFwiXG4gICAgICAgICAgcmVxdWVzdE9wdGlvbnM9e3RoaXMuX3JlcXVlc3RPcHRpb25zfVxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgaW5pdGlhbFRleHRJbnB1dD17dGhpcy5wcm9wcy5pbml0aWFsQnVpbGRUYXJnZXR9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIkJ1Y2sgYnVpbGQgdGFyZ2V0XCJcbiAgICAgICAgLz5cbiAgICAgICAgPFNpbXVsYXRvckRyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBkaXNhYmxlZD17YnVja1Rvb2xiYXJTdG9yZS5nZXRSdWxlVHlwZSgpICE9PSAnYXBwbGVfYnVuZGxlJ31cbiAgICAgICAgICB0aXRsZT1cIkNob29zZSB0YXJnZXQgZGV2aWNlXCJcbiAgICAgICAgICBvblNlbGVjdGVkU2ltdWxhdG9yQ2hhbmdlPXt0aGlzLl9oYW5kbGVTaW11bGF0b3JDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2J1aWxkfSBkaXNhYmxlZD17ZGlzYWJsZWR9IGNsYXNzTmFtZT1cImJ0blwiPkJ1aWxkPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9ydW59IGRpc2FibGVkPXtkaXNhYmxlZH0gY2xhc3NOYW1lPVwiYnRuXCI+UnVuPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9kZWJ1Z30gZGlzYWJsZWQ9e2Rpc2FibGVkfSBjbGFzc05hbWU9XCJidG5cIj5EZWJ1ZzwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3NlcnZlck1vZGVDaGVja2JveH1cbiAgICAgICAge3Byb2dyZXNzQmFyfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVCdWlsZFRhcmdldENoYW5nZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5wcm9wcy5vbkJ1aWxkVGFyZ2V0Q2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlQnVpbGRUYXJnZXQodmFsdWUpO1xuICB9XG5cbiAgX2hhbmRsZVNpbXVsYXRvckNoYW5nZShzaW11bGF0b3I6IHN0cmluZykge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy51cGRhdGVTaW11bGF0b3Ioc2ltdWxhdG9yKTtcbiAgfVxuXG4gIF9oYW5kbGVSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkKGNoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMudXBkYXRlUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKGNoZWNrZWQpO1xuICB9XG5cbiAgX2J1aWxkKCkge1xuICAgIHRoaXMuX2J1Y2tUb29sYmFyQWN0aW9ucy5idWlsZCgpO1xuICB9XG5cbiAgX3J1bigpIHtcbiAgICB0aGlzLl9idWNrVG9vbGJhckFjdGlvbnMucnVuKCk7XG4gIH1cblxuICBfZGVidWcoKSB7XG4gICAgdGhpcy5fYnVja1Rvb2xiYXJBY3Rpb25zLmRlYnVnKCk7XG4gIH1cbn1cblxuQnVja1Rvb2xiYXIucHJvcFR5cGVzID0ge1xuICBpbml0aWFsQnVpbGRUYXJnZXQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gIG9uQnVpbGRUYXJnZXRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIGluaXRpYWxJc1JlYWN0TmF0aXZlU2VydmVyTW9kZTogUHJvcFR5cGVzLmJvb2wsXG4gIG9uSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1Y2tUb29sYmFyO1xuIl19