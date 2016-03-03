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
import classnames from 'classnames';

type PropsType = {
  store: LaunchAttachStore;
  actions: LaunchAttachActions;
};

type StateType = {
  targetListChangeDisposable: IDisposable;
  attachTargetInfos: Array<AttachTargetInfo>;
  selectedProcessIndex: number;
};

export class AttachUIComponent extends React.Component<void, PropsType, StateType> {
  state: StateType;

  constructor(props: PropsType) {
    super(props);

    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachClick = this._handleAttachClick.bind(this);
    (this: any)._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    (this: any)._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedProcessIndex: -1,
    };
  }

  componentWillUnmount() {
    if (this.state.targetListChangeDisposable != null) {
      this.state.targetListChangeDisposable.dispose();
    }
  }

  _updateList(): void {
    this.setState({
      attachTargetInfos: this.props.store.getAttachTargetInfos(),
    });
  }

  render(): ReactElement {
    const containerStyle = {
      maxHeight: '30em',
      overflow: 'auto',
    };
    const children = this.state.attachTargetInfos.map((item, index) => (
        <tr key={index + 1}
            align="center"
            className={
              classnames({'attach-selected-row': index === this.state.selectedProcessIndex})
            }
            onClick={this._handleClickTableRow.bind(this, index)}
            onDoubleClick={this._handleDoubleClickTableRow.bind(this, index)}>
          <td>{item.name}</td>
          <td>{item.pid}</td>
        </tr>
      )
    );
    return (
      <div className="block">
        <div style={containerStyle}>
          <table width="100%">
            <thead>
              <tr key="0" align="center">
                <td>Name</td>
                <td>PID</td>
              </tr>
            </thead>
            <tbody align="center">
              {children}
            </tbody>
          </table>
        </div>
        <div className="padded text-right">
          <button
              className="btn btn-primary"
              onClick={this._handleAttachClick}
              disabled={this.state.selectedProcessIndex === -1}>
            Attach
          </button>
          <button className="btn" onClick={this._updateAttachTargetList}>
            Refresh
          </button>
          <button className="btn" onClick={this._handleCancelButtonClick}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  _handleClickTableRow(processIndex: number): void {
    this.setState({
      selectedProcessIndex: processIndex,
    });
  }

  _handleDoubleClickTableRow(): void {
    this._attachToProcess();
  }

  _handleAttachClick(): void {
    this._attachToProcess();
  }

  _handleCancelButtonClick(): void {
    this.props.actions.toggleLaunchAttachDialog();
  }

  _updateAttachTargetList(): void {
    // Clear old list.
    this.setState({
      attachTargetInfos: [],
      selectedProcessIndex: -1,
    });
    // Fire and forget.
    this.props.actions.updateAttachTargetList();
  }

  _attachToProcess(): void {
    const attachTarget = this.props.store.getAttachTargetInfos()[this.state.selectedProcessIndex];
    // Fire and forget.
    this.props.actions.attachDebugger(attachTarget);
    this.props.actions.showDebuggerPanel();
    this.props.actions.toggleLaunchAttachDialog();
  }
}
