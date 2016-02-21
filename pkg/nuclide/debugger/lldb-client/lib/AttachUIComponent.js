'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';
import type {AttachTargetInfo} from '../../lldb-server/lib/DebuggerRpcServiceInterface';

import {React} from 'react-for-atom';

type PropsType = {
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
};

type StateType = {
  targetListChangeDisposable: ?IDisposable,
  attachTargetInfos: Array<AttachTargetInfo>,
};

export class AttachUIComponent extends React.Component<void, PropsType, StateType> {
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: null,
      attachTargetInfos: [],
    };
  }

  componentWillMount() {
    this.setState({
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
    });
    this._updateList();
  }

  componentWillUnmount() {
    const disposable = this.state.targetListChangeDisposable;
    if (disposable != null) {
      disposable.dispose();
    }
  }

  _updateList(): void {
    this.setState({
      attachTargetInfos: this.props.store.getAttachTargetInfos(),
    });
  }

  render(): ReactElement {
    const children = this.state.attachTargetInfos.map((item, index) => {
      return (
        <tr align="center" onDoubleClick={this._handleDoubleClickItem.bind(this, index)}>
          <td>{item.name}</td>
          <td>{item.pid}</td>
        </tr>
      );
    });
    return (
      <table width="100%">
        <thead>
          <tr align="center">
            <td>Name</td>
            <td>PID</td>
          </tr>
        </thead>
        <tbody align="center">
          {children}
        </tbody>
      </table>
    );
  }

  _handleDoubleClickItem(index: number): void {
    const attachTarget = this.props.store.getAttachTargetInfos()[index];
    // Fire and forget.
    this.props.actions.attachDebugger(attachTarget);
  }
}
