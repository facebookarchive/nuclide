'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactForAtom = require('react-for-atom');

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
}

class DebuggerControllerView extends _reactForAtom.React.Component {

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
      return _reactForAtom.React.createElement((_DebuggerInspector || _load_DebuggerInspector()).default, {
        breakpointStore: this.props.breakpointStore,
        openDevTools: this.props.openDevTools,
        stopDebugging: this.props.stopDebugging
      });
    }
    if (this.props.store.getDebuggerMode() === 'starting') {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'padded' },
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          title: 'Close',
          icon: 'x',
          className: 'nuclide-debugger-root-close-button',
          onClick: this._handleClickClose
        }),
        _reactForAtom.React.createElement(
          'p',
          null,
          'Starting Debugger'
        ),
        _reactForAtom.React.createElement('progress', { className: 'starting' })
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