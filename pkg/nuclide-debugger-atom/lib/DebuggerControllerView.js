var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var BreakpointStore = require('./BreakpointStore.js');
var DebuggerActions = require('./DebuggerActions');
var DebuggerInspector = require('./DebuggerInspector');
var DebuggerSessionSelector = require('./DebuggerSessionSelector');

var _require2 = require('./DebuggerStore');

var DebuggerStore = _require2.DebuggerStore;

var Bridge = require('./Bridge');

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
}

var DebuggerControllerView = React.createClass({
  displayName: 'DebuggerControllerView',

  propTypes: {
    actions: PropTypes.instanceOf(DebuggerActions).isRequired,
    breakpointStore: PropTypes.instanceOf(BreakpointStore).isRequired,
    store: PropTypes.instanceOf(DebuggerStore).isRequired,
    bridge: PropTypes.instanceOf(Bridge).isRequired
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
      return React.createElement(DebuggerInspector, {
        actions: this.props.actions,
        bridge: this.props.bridge,
        breakpointStore: this.props.breakpointStore,
        socket: this.state.processSocket
      });
    }
    var closeButton = React.createElement(_nuclideUiLibButton.Button, {
      title: 'Close',
      icon: 'x',
      className: 'nuclide-debugger-root-close-button',
      onClick: this._handleClickClose
    });
    if (this.props.store.getDebuggerMode() === 'starting') {
      return React.createElement(
        'div',
        { className: 'padded' },
        closeButton,
        React.createElement(
          'p',
          null,
          'Starting Debugger'
        ),
        React.createElement('progress', { className: 'starting' })
      );
    }
    return React.createElement(
      'div',
      null,
      closeButton,
      React.createElement(DebuggerSessionSelector, { store: this.props.store, actions: this.props.actions })
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