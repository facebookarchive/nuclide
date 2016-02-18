'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

import {React} from 'react-for-atom';
import ReactNativeServerStatus from './ReactNativeServerStatus';

type Props = {
  store: ReactNativeServerStatus,
  restartServer: () => void,
  stopServer: () => void,
};

export default class ReactNativeServerPanel extends React.Component<void, Props, void> {

  _storeSubscription: IDisposable;

  constructor(props: Props) {
    super(props);
    this._storeSubscription = props.store.subscribe(() => {
      this.forceUpdate();
    });
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
            onClick={this.props.stopServer}>
            Stop
          </button>
          <button
            className="btn icon icon-sync inline-block-tight"
            onClick={this.props.restartServer}>
            Restart
          </button>
        </div>
        <span className="inline-block">Status: {status}</span>
      </div>
    );
  }

}
