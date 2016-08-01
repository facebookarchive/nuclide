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
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
};

type StateType = {
  targetListChangeDisposable: IDisposable,
  attachTargetInfos: Array<AttachTargetInfo>,
  filteredAttachTargetInfos: Array<AttachTargetInfo>,
  selectedAttachTarget: ?AttachTargetInfo,
  filterText: string,
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
      filteredAttachTargetInfos: [],
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
    this._updateFilteredList(this.props.store.getAttachTargetInfos(), this.state.filterText);
  }

  _updateFilteredList(rawTargets: Array<AttachTargetInfo>, newFilterText: string): void {
    let filteredTargets = rawTargets;
    if (newFilterText.length !== 0) {
      const filterRegex = new RegExp(newFilterText, 'i');
      filteredTargets = rawTargets.filter(item => filterRegex.test(item.name)
                                           || filterRegex.test(item.pid.toString())
                                           || filterRegex.test(item.commandName));
    }

    let newSelectedTarget = this.state.selectedAttachTarget;
    // Auto-select if only one target is available
    if (filteredTargets.length === 1) {
      newSelectedTarget = filteredTargets[0];
    }

    this.setState({
      attachTargetInfos: rawTargets,
      selectedAttachTarget: newSelectedTarget,
      filterText: newFilterText,
      filteredAttachTargetInfos: filteredTargets,
    });
  }

  render(): React.Element<any> {
    const containerStyle = {
      maxHeight: '30em',
      overflow: 'auto',
    };
    let hasSelectedItem = false;
    const selectedTarget = this.state.selectedAttachTarget;
    const children = this.state.filteredAttachTargetInfos.map((item, index) => {
      // Be sure to compare PIDs rather than objects, since multiple distinct objects can be
      // returned from different calls to getAttachTargetInfos() that represent the same process
      const isSelected = (selectedTarget != null && selectedTarget.pid === item.pid);
      if (isSelected) {
        hasSelectedItem = true;
      }
      return <tr
            key={index + 1}
            className={classnames({'attach-selected-row': isSelected})}
            onClick={this._handleClickTableRow.bind(this, item)}
            onDoubleClick={this._handleDoubleClickTableRow.bind(this, index)}>
          <td>{item.name}</td>
          <td>{item.pid}</td>
          <td>{item.commandName}</td>
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
          <table className="nuclide-debugger-lldb-client-process-table" width="100%">
            <thead>
            <tr key="0">
                <td>Process Name</td>
                <td>PID</td>
                <td>Command Name</td>
              </tr>
            </thead>
            <tbody>
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
    this._updateFilteredList(this.state.attachTargetInfos, text);
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
