'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThreadsView = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _DebuggerThreadsComponent;

function _load_DebuggerThreadsComponent() {
  return _DebuggerThreadsComponent = require('./DebuggerThreadsComponent');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ThreadsView extends _react.default.PureComponent {

  constructor(props) {
    super(props);
    this._disposables = new _atom.CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      customThreadColumns: debuggerStore.getSettings().get('CustomThreadColumns') || [],
      mode: debuggerStore.getDebuggerMode(),
      threadsComponentTitle: String(debuggerStore.getSettings().get('threadsComponentTitle'))
    };
  }

  componentDidMount() {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
        customThreadColumns: debuggerStore.getSettings().get('CustomThreadColumns') || [],
        mode: debuggerStore.getDebuggerMode(),
        threadsComponentTitle: String(debuggerStore.getSettings().get('threadsComponentTitle'))
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
    const { mode, threadsComponentTitle, customThreadColumns } = this.state;
    const disabledClass = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? '' : ' nuclide-debugger-container-new-disabled';

    return _react.default.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-container-new', disabledClass) },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content' },
        _react.default.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
          bridge: this.props.model.getBridge(),
          threadStore: model.getThreadStore(),
          customThreadColumns: customThreadColumns,
          threadName: threadsComponentTitle
        })
      )
    );
  }
}
exports.ThreadsView = ThreadsView; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */