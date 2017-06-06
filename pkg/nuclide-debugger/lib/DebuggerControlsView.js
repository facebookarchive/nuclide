'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerControlsView = undefined;

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class DebuggerControlsView extends _react.default.PureComponent {

  constructor(props) {
    super(props);
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
    const debuggerStoppedNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED ? null : _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-pane-content' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-state-notice' },
        _react.default.createElement(
          'span',
          null,
          'The debugger is not attached.'
        ),
        _react.default.createElement(
          'div',
          { className: 'padded' },
          _react.default.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show-attach-dialog'),
            icon: 'nuclicon-debugger',
            label: 'Attach debugger...'
          }),
          _react.default.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show-launch-dialog'),
            icon: 'nuclicon-debugger',
            label: 'Launch debugger...'
          })
        )
      )
    );

    const debugeeRunningNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? null : _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-pane-content' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-state-notice' },
        'The debug target is currently running.'
      )
    );

    return _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-section-header nuclide-debugger-controls-section' },
        _react.default.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
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