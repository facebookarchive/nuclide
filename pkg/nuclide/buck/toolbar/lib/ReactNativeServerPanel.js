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
import ReactNativeServerActions from './ReactNativeServerActions';
import ReactNativeServerStatus from './ReactNativeServerStatus';

type Props = {
  actions: ReactNativeServerActions,
  store: ReactNativeServerStatus,
  serverCommand: string,
};

export default class ReactNativeServerPanel extends React.Component {

  props: Props;
  _storeSubscription: IDisposable;

  constructor(props: Props) {
    super(props);
    this._storeSubscription = props.store.subscribe(() => {
      this.forceUpdate();
    });
    (this: any)._handleStopClicked = this._handleStopClicked.bind(this);
    (this: any)._handleRestartClicked = this._handleRestartClicked.bind(this);
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
            onClick={this._handleStopClicked}>
            Stop
          </button>
          <button
            className="btn icon icon-sync inline-block-tight"
            onClick={this._handleRestartClicked}>
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
