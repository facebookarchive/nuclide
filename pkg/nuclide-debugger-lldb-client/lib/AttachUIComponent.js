'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';
import type {
  AttachTargetInfo,
} from '../../nuclide-debugger-lldb-server/lib/DebuggerRpcServiceInterface';

import {React} from 'react-for-atom';
import classnames from 'classnames';
import {AtomInput} from '../../nuclide-ui/lib/AtomInput';

type PropsType = {
  store: LaunchAttachStore;
  actions: LaunchAttachActions;
};

type StateType = {
  targetListChangeDisposable: IDisposable;
  attachTargetInfos: Array<AttachTargetInfo>;
  selectedAttachTarget: ?AttachTargetInfo;
  filterText: string;
};

export class AttachUIComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);

    (this: any)._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachClick = this._handleAttachClick.bind(this);
    (this: any)._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    (this: any)._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: '',
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
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const children = this.state.attachTargetInfos
      .filter(item => filterRegex.test(item.name) || filterRegex.test(item.pid.toString()))
      .map((item, index) => (
        <tr key={index + 1}
            align="center"
            className={
              classnames({'attach-selected-row': this.state.selectedAttachTarget === item})
            }
            onClick={this._handleClickTableRow.bind(this, item)}
            onDoubleClick={this._handleDoubleClickTableRow.bind(this, index)}>
          <td>{item.name}</td>
          <td>{item.pid}</td>
        </tr>
      )
    );
    // TODO: wrap into separate React components.
    return (
      <div className="block">
        <AtomInput
          placeholderText="Search..."
          initialValue={this.state.filterText}
          onDidChange={this._handleFilterTextChange}
          size="sm"
        />
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
          <button className="btn" onClick={this._handleCancelButtonClick}>
            Cancel
          </button>
          <button className="btn" onClick={this._updateAttachTargetList}>
            Refresh
          </button>
          <button
              className="btn btn-primary"
              onClick={this._handleAttachClick}
              disabled={this.state.selectedAttachTarget === null}>
            Attach
          </button>
        </div>
      </div>
    );
  }

  _handleFilterTextChange(text: string): void {
    this.setState({
      filterText: text,
    });
  }

  _handleClickTableRow(item: AttachTargetInfo): void {
    this.setState({
      selectedAttachTarget: item,
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
      selectedAttachTarget: null,
    });
    // Fire and forget.
    this.props.actions.updateAttachTargetList();
  }

  _attachToProcess(): void {
    const attachTarget = this.state.selectedAttachTarget;
    if (attachTarget) {
      // Fire and forget.
      this.props.actions.attachDebugger(attachTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }
}
