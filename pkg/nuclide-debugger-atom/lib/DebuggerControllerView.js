'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import BreakpointStore from './BreakpointStore.js';
import DebuggerActions from './DebuggerActions';
import DebuggerInspector from './DebuggerInspector';
import DebuggerSessionSelector from './DebuggerSessionSelector';
import {DebuggerStore} from './DebuggerStore';
import Bridge from './Bridge';
import {Button} from '../../nuclide-ui/lib/Button';

type State = {
  processSocket: ?string;
  debuggerStoreChangeListener?: IDisposable;
};

function getStateFromStore(store: DebuggerStore): State {
  return {
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

  render(): ?React.Element<any> {
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
      <Button
        title="Close"
        icon="x"
        className="nuclide-debugger-root-close-button"
        onClick={this._handleClickClose}
      />
    );
    if (this.props.store.getDebuggerMode() === 'starting') {
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
    this.props.actions.stopDebugging();
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
