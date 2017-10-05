'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerControlsView = undefined;

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _TruncatedButton;

function _load_TruncatedButton() {
  return _TruncatedButton = _interopRequireDefault(require('nuclide-commons-ui/TruncatedButton'));
}

var _DebuggerSteppingComponent;

function _load_DebuggerSteppingComponent() {
  return _DebuggerSteppingComponent = require('./DebuggerSteppingComponent');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _DebuggerControllerView;

function _load_DebuggerControllerView() {
  return _DebuggerControllerView = _interopRequireDefault(require('./DebuggerControllerView'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const DEVICE_PANEL_URL = 'atom://nuclide/devices';

class DebuggerControlsView extends _react.PureComponent {

  constructor(props) {
    super(props);

    this._openDevTools = () => {
      const { model } = this.props;
      model.getActions().openDevTools();
    };

    this._stopDebugging = () => {
      const { model } = this.props;
      model.getActions().stopDebugging();
    };

    this._disposables = new _atom.CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      mode: debuggerStore.getDebuggerMode()
    };
  }

  componentDidMount() {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
        mode: debuggerStore.getDebuggerMode()
      });
    }));
  }

  componentWillUnmount() {
    this._dispose();
  }

  _dispose() {
    this._disposables.dispose();
  }

  render() {
    const { model } = this.props;
    const actions = model.getActions();
    const { mode } = this.state;
    const debuggerStoppedNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED ? null : _react.createElement(
      'div',
      { className: 'nuclide-debugger-pane-content' },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-state-notice' },
        _react.createElement(
          'span',
          null,
          'The debugger is not attached.'
        ),
        _react.createElement(
          'div',
          { className: 'padded' },
          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show-attach-dialog'),
            icon: 'nuclicon-debugger',
            label: 'Attach debugger...'
          }),
          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show-launch-dialog'),
            icon: 'nuclicon-debugger',
            label: 'Launch debugger...'
          }),
          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => (0, (_goToLocation || _load_goToLocation()).goToLocation)(DEVICE_PANEL_URL),
            icon: 'device-mobile',
            label: 'Manage devices...'
          })
        )
      )
    );

    const targetInfo = model.getStore().getDebugProcessInfo();
    const targetDescription = targetInfo == null ? null : targetInfo.getDebuggerProps().targetDescription();

    const debugeeRunningNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? null : _react.createElement(
      'div',
      { className: 'nuclide-debugger-pane-content' },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-state-notice' },
        'The debug target is currently running.'
      ),
      targetDescription == null ? null : _react.createElement(
        'div',
        { className: 'nuclide-debugger-target-description' },
        targetDescription
      )
    );

    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-section-header' },
        _react.createElement((_DebuggerControllerView || _load_DebuggerControllerView()).default, {
          store: model.getStore(),
          bridge: model.getBridge(),
          breakpointStore: model.getBreakpointStore(),
          openDevTools: this._openDevTools,
          stopDebugging: this._stopDebugging
        })
      ),
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-section-header nuclide-debugger-controls-section' },
        _react.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
          actions: actions,
          debuggerStore: model.getStore()
        })
      ),
      debugeeRunningNotice,
      debuggerStoppedNotice
    );
  }

}
exports.DebuggerControlsView = DebuggerControlsView;