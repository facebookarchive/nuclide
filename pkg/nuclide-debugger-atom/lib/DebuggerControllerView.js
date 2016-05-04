function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _BreakpointStoreJs = require('./BreakpointStore.js');

var _BreakpointStoreJs2 = _interopRequireDefault(_BreakpointStoreJs);

var _DebuggerActions = require('./DebuggerActions');

var _DebuggerActions2 = _interopRequireDefault(_DebuggerActions);

var _DebuggerInspector = require('./DebuggerInspector');

var _DebuggerInspector2 = _interopRequireDefault(_DebuggerInspector);

var _DebuggerSessionSelector = require('./DebuggerSessionSelector');

var _DebuggerSessionSelector2 = _interopRequireDefault(_DebuggerSessionSelector);

var _DebuggerStore = require('./DebuggerStore');

var _Bridge = require('./Bridge');

var _Bridge2 = _interopRequireDefault(_Bridge);

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

function getStateFromStore(store) {
  return {
    processSocket: store.getProcessSocket()
  };
}

var DebuggerControllerView = _reactForAtom.React.createClass({
  displayName: 'DebuggerControllerView',

  propTypes: {
    actions: _reactForAtom.React.PropTypes.instanceOf(_DebuggerActions2.default).isRequired,
    breakpointStore: _reactForAtom.React.PropTypes.instanceOf(_BreakpointStoreJs2.default).isRequired,
    store: _reactForAtom.React.PropTypes.instanceOf(_DebuggerStore.DebuggerStore).isRequired,
    bridge: _reactForAtom.React.PropTypes.instanceOf(_Bridge2.default).isRequired
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
      return _reactForAtom.React.createElement(_DebuggerInspector2.default, {
        actions: this.props.actions,
        bridge: this.props.bridge,
        breakpointStore: this.props.breakpointStore,
        socket: this.state.processSocket
      });
    }
    var closeButton = _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
      title: 'Close',
      icon: 'x',
      className: 'nuclide-debugger-root-close-button',
      onClick: this._handleClickClose
    });
    if (this.props.store.getDebuggerMode() === 'starting') {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'padded' },
        closeButton,
        _reactForAtom.React.createElement(
          'p',
          null,
          'Starting Debugger'
        ),
        _reactForAtom.React.createElement('progress', { className: 'starting' })
      );
    }
    return _reactForAtom.React.createElement(
      'div',
      null,
      closeButton,
      _reactForAtom.React.createElement(_DebuggerSessionSelector2.default, { store: this.props.store, actions: this.props.actions })
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