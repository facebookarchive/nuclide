'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Disposable} from 'atom';
import React from 'react-for-atom';
const {PropTypes} = React;
import ReactNativeServerActions from './ReactNativeServerActions';
import ReactNativeServerManager from './ReactNativeServerManager';

export default class ReactNativeServerPanel extends React.Component {

  _storeSubscription: Disposable;

  static propTypes = {
    actions: PropTypes.instanceOf(ReactNativeServerActions).isRequired,
    store: PropTypes.instanceOf(ReactNativeServerManager).isRequired,
    serverCommand: PropTypes.string.isRequired,
  };

  constructor(props: Object) {
    super(props);
    this._storeSubscription = props.store.subscribe(() => {
      this.forceUpdate();
    });
    this._stopServer = this._handleStopClicked.bind(this);
    this._restartServer = this._handleRestartClicked.bind(this);
  }

  componentWillUnmount() {
    this._storeSubscription.dispose();
  }

  render(): ReactElement {
    // TODO(natthu): Add another button to allow debugging RN Javascript.
    const status = this.props.store.isServerRunning()
      ? <span className="inline-block highlight-success">Running</span>
      : <span className="inline-block highlight-error">Stopped</span>;
    return (
      <div className="inset-panel padded">
        <div className="inline-block">
          <button
            className="btn icon icon-primitive-square inline-block-tight"
            onClick={this._stopServer}
          >
            Stop
          </button>
          <button
            className="btn icon icon-sync inline-block-tight"
            onClick={this._restartServer}
          >
            Restart
          </button>
        </div>
        <span className="inline-block">Status: {status}</span>
      </div>
    );
  }

  _handleStopClicked() {
    this.props.actions.stopServer();
  }

  _handleRestartClicked() {
    this.props.actions.restartServer(this.props.serverCommand);
  }
}
