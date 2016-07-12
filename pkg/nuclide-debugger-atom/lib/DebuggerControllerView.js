function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _BreakpointStoreJs2;

function _BreakpointStoreJs() {
  return _BreakpointStoreJs2 = _interopRequireDefault(require('./BreakpointStore.js'));
}

var _DebuggerActions2;

function _DebuggerActions() {
  return _DebuggerActions2 = _interopRequireDefault(require('./DebuggerActions'));
}

var _DebuggerInspector2;

function _DebuggerInspector() {
  return _DebuggerInspector2 = _interopRequireDefault(require('./DebuggerInspector'));
}

var _DebuggerSessionSelector2;

function _DebuggerSessionSelector() {
  return _DebuggerSessionSelector2 = _interopRequireDefault(require('./DebuggerSessionSelector'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _Bridge2;

function _Bridge() {
  return _Bridge2 = _interopRequireDefault(require('./Bridge'));
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
}

var DebuggerControllerView = (_reactForAtom2 || _reactForAtom()).React.createClass({
  propTypes: {
    actions: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_DebuggerActions2 || _DebuggerActions()).default).isRequired,
    breakpointStore: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_BreakpointStoreJs2 || _BreakpointStoreJs()).default).isRequired,
    store: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_DebuggerStore2 || _DebuggerStore()).DebuggerStore).isRequired,
    bridge: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_Bridge2 || _Bridge()).default).isRequired,
    toggleOldView: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func.isRequired,
    showOldView: (_reactForAtom2 || _reactForAtom()).React.PropTypes.bool.isRequired
  },

  getInitialState: function getInitialState() {
    return getStateFromStore(this.props.store);
  },

  componentWillMount: function componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore();
  },

  componentWillUnmount: function componentWillUnmount() {
    var listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore)
    });
    this._updateStateFromStore(nextProps.store);
  },

  render: function render() {
    if (this.state.processSocket) {
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerInspector2 || _DebuggerInspector()).default, {
        actions: this.props.actions,
        bridge: this.props.bridge,
        breakpointStore: this.props.breakpointStore,
        socket: this.state.processSocket,
        showOldView: this.props.showOldView,
        toggleOldView: this.props.toggleOldView
      });
    }
    var closeButton = (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
      title: 'Close',
      icon: 'x',
      className: 'nuclide-debugger-root-close-button',
      onClick: this._handleClickClose
    });
    if (this.props.store.getDebuggerMode() === 'starting') {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'padded' },
        closeButton,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'p',
          null,
          'Starting Debugger'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('progress', { className: 'starting' })
      );
    }
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      closeButton,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerSessionSelector2 || _DebuggerSessionSelector()).default, { store: this.props.store, actions: this.props.actions })
    );
  },

  _handleClickClose: function _handleClickClose() {
    this.props.actions.stopDebugging();
  },

  _updateStateFromStore: function _updateStateFromStore(store) {
    if (store != null) {
      this.setState(getStateFromStore(store));
    } else {
      this.setState(getStateFromStore(this.props.store));
    }
  }
});

module.exports = DebuggerControllerView;