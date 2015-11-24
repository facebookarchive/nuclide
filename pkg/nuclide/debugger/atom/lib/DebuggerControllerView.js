'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const React = require('react-for-atom');
const BreakpointStore = require('./BreakpointStore.js');
const DebuggerActions = require('./DebuggerActions');
const DebuggerInspector = require('./DebuggerInspector');
const DebuggerSessionSelector = require('./DebuggerSessionSelector');
const DebuggerStore = require('./DebuggerStore');
const Bridge = require('./Bridge');

type State = {
  hasDebuggerProcess: boolean;
  processSocket: ?string;
  debuggerStoreChangeListener?: atom$Disposable;
};

function getStateFromStore(store: DebuggerStore): State {
  return {
    hasDebuggerProcess: !!store.getDebuggerProcess(),
    processSocket: store.getProcessSocket(),
  };
}

const DebuggerControllerView = React.createClass({
  propTypes: {
    actions: React.PropTypes.instanceOf(DebuggerActions).isRequired,
    breakpointStore: React.PropTypes.instanceOf(BreakpointStore).isRequired,
    store: React.PropTypes.instanceOf(DebuggerStore).isRequired,
    bridge: React.PropTypes.instanceOf(Bridge).isRequired,
  },

  getInitialState(): State {
    return getStateFromStore(this.props.store);
  },

  componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore),
    });
    this._updateStateFromStore();
  },

  componentWillUnmount() {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  },

  componentWillReceiveProps(nextProps: {store: DebuggerStore}) {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore),
    });
    this._updateStateFromStore(nextProps.store);
  },

  render(): ?ReactElement {
    if (this.state.processSocket) {
      return (
        <DebuggerInspector
          actions={this.props.actions}
          bridge={this.props.bridge}
          breakpointStore={this.props.breakpointStore}
          socket={this.state.processSocket}
        />
      );
    }
    const closeButton = (
      <button
        title="Close"
        className="icon icon-x nuclide-debugger-root-close-button"
        onClick={this._handleClickClose}
      />
    );
    if (this.state.hasDebuggerProcess) {
      return (
        <div className="padded">
          {closeButton}
          <p>Starting Debugger</p>
          <progress className="starting"></progress>
        </div>
      );
    }
    return (
      <div>
        {closeButton}
        <DebuggerSessionSelector store={this.props.store} actions={this.props.actions} />
      </div>
    );
  },

  _handleClickClose() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle');
  },

  _updateStateFromStore(store?: DebuggerStore) {
    if (store != null) {
      this.setState(getStateFromStore(store));
    } else {
      this.setState(getStateFromStore(this.props.store));
    }
  },
});

module.exports = DebuggerControllerView;
