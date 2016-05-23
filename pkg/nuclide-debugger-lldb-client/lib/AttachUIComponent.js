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
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/lib/Button';

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
    const newSelectedTarget = this.state.selectedAttachTarget == null ? null :
      this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
    this.setState({
      attachTargetInfos: this.props.store.getAttachTargetInfos(),
      selectedAttachTarget: newSelectedTarget,
    });
  }

  _getAttachTargetOfPid(pid: number): ?AttachTargetInfo {
    for (const target of this.props.store.getAttachTargetInfos()) {
      if (target.pid === pid) {
        return target;
      }
    }
    return null;
  }

  render(): React.Element {
    const containerStyle = {
      maxHeight: '30em',
      overflow: 'auto',
    };
    let hasSelectedItem = false;
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const children = this.state.attachTargetInfos
      .filter(item => filterRegex.test(item.name) || filterRegex.test(item.pid.toString()))
      .map((item, index) => {
        const isSelected = (this.state.selectedAttachTarget === item);
        if (isSelected) {
          hasSelectedItem = true;
        }
        return <tr key={index + 1}
            align="center"
            className={
              classnames({'attach-selected-row': isSelected})
            }
            onClick={this._handleClickTableRow.bind(this, item)}
            onDoubleClick={this._handleDoubleClickTableRow.bind(this, index)}>
          <td>{item.name}</td>
          <td>{item.pid}</td>
        </tr>;
      });
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
          <Button onClick={this._handleCancelButtonClick}>
            Cancel
          </Button>
          <Button
              buttonType={ButtonTypes.PRIMARY}
              onClick={this._handleAttachClick}
              disabled={!hasSelectedItem}>
            Attach
          </Button>
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
    // Fire and forget.
    this.props.actions.updateAttachTargetList();
  }

  _attachToProcess(): void {
    const attachTarget = this.state.selectedAttachTarget;
    if (attachTarget != null) {
      // Fire and forget.
      this.props.actions.attachDebugger(attachTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }
}
