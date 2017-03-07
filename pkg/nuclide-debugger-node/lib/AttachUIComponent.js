/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';
import type {
  NodeAttachTargetInfo,
} from '../../nuclide-debugger-node-rpc/lib/NodeDebuggerService';
import type {Column} from '../../nuclide-ui/Table';

import React from 'react';
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {DebuggerLaunchAttachEventTypes} from '../../nuclide-debugger-base';
import {Table} from '../../nuclide-ui/Table';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';

import type EventEmitter from 'events';

type PropsType = {
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
  parentEmitter: EventEmitter,
};

type StateType = {
  targetListChangeDisposable: IDisposable,
  attachTargetInfos: Array<NodeAttachTargetInfo>,
  selectedAttachTarget: ?NodeAttachTargetInfo,
  filterText: string,
  sortDescending: boolean,
  sortedColumn: ?string,
};

function getColumns(): Array<Column> {
  return [
    {
      title: 'Process Name',
      key: 'process',
      width: 0.25,
    },
    {
      title: 'PID',
      key: 'pid',
      width: 0.10,
    },
    {
      title: 'Command Name',
      key: 'command',
      width: 0.65,
    },
  ];
}

function getCompareFunction(
  sortedColumn: ?string,
  sortDescending: boolean,
): (a: NodeAttachTargetInfo, b: NodeAttachTargetInfo) => number {
  switch (sortedColumn) {
    case 'pid':
      const order = sortDescending ? -1 : 1;
      return (target1: NodeAttachTargetInfo, target2: NodeAttachTargetInfo) => (
        order * (target1.pid - target2.pid)
      );
    case 'process':
      return (target1: NodeAttachTargetInfo, target2: NodeAttachTargetInfo) => {
        const first = sortDescending ? target2.name : target1.name;
        const second = sortDescending ? target1.name : target2.name;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    case 'command':
      return (target1: NodeAttachTargetInfo, target2: NodeAttachTargetInfo) => {
        const first = sortDescending ? target2.commandName : target1.commandName;
        const second = sortDescending ? target1.commandName : target2.commandName;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    default: break;
  }
  return () => 0;
}

export class AttachUIComponent extends React.Component<void, PropsType, StateType> {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);

    (this: any)._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    (this: any)._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachClick = this._handleAttachClick.bind(this);
    (this: any)._handleParentVisibilityChanged = this._handleParentVisibilityChanged.bind(this);
    (this: any)._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    (this: any)._updateList = this._updateList.bind(this);
    (this: any)._handleSort = this._handleSort.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: '',
      sortDescending: false,
      sortedColumn: null,
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachClick);
    this.props.parentEmitter.on(
      DebuggerLaunchAttachEventTypes.VISIBILITY_CHANGED,
      this._handleParentVisibilityChanged);
    this.props.actions.updateAttachUIVisibility(true);
  }

  componentWillUnmount() {
    this.props.actions.updateAttachUIVisibility(false);
    if (this.state.targetListChangeDisposable != null) {
      this.state.targetListChangeDisposable.dispose();
    }
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.VISIBILITY_CHANGED,
      this._handleParentVisibilityChanged);
    this.props.parentEmitter.removeListener(
      DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED,
      this._handleAttachClick);
  }

  _handleParentVisibilityChanged(visible: boolean): void {
    this.props.actions.updateParentUIVisibility(visible);
  }

  _updateList(): void {
    const newSelectedTarget = this.state.selectedAttachTarget == null
      ? null
      : this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
    this.setState({
      attachTargetInfos: this.props.store.getAttachTargetInfos(),
      selectedAttachTarget: newSelectedTarget,
    });
  }

  _getAttachTargetOfPid(pid: number): ?NodeAttachTargetInfo {
    for (const target of this.props.store.getAttachTargetInfos()) {
      if (target.pid === pid) {
        return target;
      }
    }
    return null;
  }

  _handleSort(sortedColumn: ?string, sortDescending: boolean): void {
    this.setState({
      sortedColumn,
      sortDescending,
    });
  }

  render(): React.Element<any> {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const {
      attachTargetInfos,
      sortedColumn,
      sortDescending,
    } = this.state;
    const compareFn = getCompareFunction(sortedColumn, sortDescending);
    const {selectedAttachTarget} = this.state;
    let selectedIndex = null;
    const rows = attachTargetInfos
      .filter(item => filterRegex.test(item.name) || filterRegex.test(item.pid.toString()) ||
        filterRegex.test(item.commandName))
      .sort(compareFn)
      .map((item, index) => {
        const row = {
          data: {
            process: item.name,
            pid: item.pid,
            command: item.commandName,
          },
        };
        if (selectedAttachTarget != null && row.data.pid === selectedAttachTarget.pid) {
          selectedIndex = index;
        }
        return row;
      });
    return (
      <div className="block">
        <AtomInput
          placeholderText="Search..."
          initialValue={this.state.filterText}
          onDidChange={this._handleFilterTextChange}
          size="sm"
        />
        <Table
          columns={getColumns()}
          fixedHeader={true}
          maxBodyHeight="30em"
          rows={rows}
          sortable={true}
          onSort={this._handleSort}
          sortedColumn={this.state.sortedColumn}
          sortDescending={this.state.sortDescending}
          selectable={true}
          selectedIndex={selectedIndex}
          onSelect={this._handleSelectTableRow}
        />
        <div className="nuclide-debugger-native-launch-attach-actions">
          <ButtonGroup>
            <Button onClick={this._handleCancelButtonClick}>
              Cancel
            </Button>
            <Button
                buttonType={ButtonTypes.PRIMARY}
                onClick={this._handleAttachClick}
                disabled={selectedIndex == null}>
              Attach
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  _handleFilterTextChange(text: string): void {
    this.setState({
      filterText: text,
    });
  }

  _handleSelectTableRow(item: {pid: number}, selectedIndex: number): void {
    const attachTarget = this._getAttachTargetOfPid(item.pid);
    this.setState({
      selectedAttachTarget: attachTarget,
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
