'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = _interopRequireDefault(require('./BreakpointStore.js'));
}

var _DebuggerInspector;

function _load_DebuggerInspector() {
  return _DebuggerInspector = _interopRequireDefault(require('./DebuggerInspector'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

class DebuggerControllerView extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = getStateFromStore(props.store);

    this._handleClickClose = this._handleClickClose.bind(this);
    this._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore();
  }

  componentWillUnmount() {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore(nextProps.store);
  }

  render() {
    if (this.state.processSocket) {
      return _react.default.createElement((_DebuggerInspector || _load_DebuggerInspector()).default, {
        breakpointStore: this.props.breakpointStore,
        openDevTools: this.props.openDevTools,
        stopDebugging: this.props.stopDebugging
      });
    }
    if (this.props.store.getDebuggerMode() === 'starting') {
      return _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-starting-message' },
        _react.default.createElement(
          'div',
          null,
          _react.default.createElement(
            'span',
            { className: 'inline-block' },
            'Starting Debugger...'
          ),
          _react.default.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { className: 'inline-block', size: 'EXTRA_SMALL' })
        ),
        _react.default.createElement((_Button || _load_Button()).Button, {
          icon: 'x',
          onClick: this._handleClickClose,
          title: 'Close'
        })
      );
    }
    return null;
  }

  _handleClickClose() {
    this.props.stopDebugging();
  }

  _updateStateFromStore(store) {
    if (store != null) {
      this.setState(getStateFromStore(store));
    } else {
      this.setState(getStateFromStore(this.props.store));
    }
  }
}
exports.default = DebuggerControllerView;