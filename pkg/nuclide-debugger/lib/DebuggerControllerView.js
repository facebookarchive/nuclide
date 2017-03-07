/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import BreakpointStore from './BreakpointStore.js';
import DebuggerInspector from './DebuggerInspector';
import {DebuggerStore} from './DebuggerStore';
import Bridge from './Bridge';
import {Button} from '../../nuclide-ui/Button';

type Props = {
  breakpointStore: BreakpointStore,
  store: DebuggerStore,
  bridge: Bridge,
  openDevTools: () => void,
  stopDebugging: () => void,
};

type State = {
  processSocket: ?string,
  debuggerStoreChangeListener?: IDisposable,
};

function getStateFromStore(store: DebuggerStore): State {
  return {
    processSocket: store.getProcessSocket(),
  };
}

export default class DebuggerControllerView extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = getStateFromStore(props.store);

    (this: any)._handleClickClose = this._handleClickClose.bind(this);
    (this: any)._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  componentWillMount() {
    this.setState({
      debuggerStoreChangeListener: this.props.store.onChange(this._updateStateFromStore),
    });
    this._updateStateFromStore();
  }

  componentWillUnmount() {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const listener = this.state.debuggerStoreChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerStoreChangeListener: nextProps.store.onChange(this._updateStateFromStore),
    });
    this._updateStateFromStore(nextProps.store);
  }

  render(): ?React.Element<any> {
    if (this.state.processSocket) {
      return (
        <DebuggerInspector
          breakpointStore={this.props.breakpointStore}
          openDevTools={this.props.openDevTools}
          stopDebugging={this.props.stopDebugging}
        />
      );
    }
    if (this.props.store.getDebuggerMode() === 'starting') {
      return (
        <div className="padded">
          <Button
            title="Close"
            icon="x"
            className="nuclide-debugger-root-close-button"
            onClick={this._handleClickClose}
          />
          <p>Starting Debugger</p>
          <progress className="starting" />
        </div>
      );
    }
    return null;
  }

  _handleClickClose() {
    this.props.stopDebugging();
  }

  _updateStateFromStore(store?: DebuggerStore) {
    if (store != null) {
      this.setState(getStateFromStore(store));
    } else {
      this.setState(getStateFromStore(this.props.store));
    }
  }
}
