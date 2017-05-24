/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Process, ProcessTask, ProcessTaskType} from '../types';

import React from 'react';
import {Subscription} from 'rxjs';
import {Table} from 'nuclide-commons-ui/Table';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import addTooltip from 'nuclide-commons-ui/addTooltip';
import {Icon} from 'nuclide-commons-ui/Icon';

type Props = {|
  startFetchingProcesses: () => Subscription,
  processTasks: ProcessTask[],
  processes: Process[],
|};

type State = {
  filterText: string,
  sortedColumn: ?string,
  sortDescending: boolean,
};

export class ProcessTable extends React.Component {
  props: Props;
  state: State;
  _processesSubscription: ?Subscription = null;

  constructor(props: Props) {
    super(props);

    (this: any)._handleFilterTextChange = this._handleFilterTextChange.bind(
      this,
    );
    (this: any)._handleSort = this._handleSort.bind(this);

    this.state = {
      filterText: '',
      sortedColumn: 'cpuUsage',
      sortDescending: true,
    };
  }

  componentDidMount(): void {
    this._processesSubscription = this.props.startFetchingProcesses();
  }

  componentWillUnmount(): void {
    if (this._processesSubscription != null) {
      this._processesSubscription.unsubscribe();
    }
  }

  _formatCpuUsage(cpu: ?number): string {
    return cpu == null ? '' : cpu.toFixed(2) + '%';
  }

  _formatMemUsage(mem: ?number): string {
    if (mem == null) {
      return '';
    } else if (mem < 1024) {
      return mem.toFixed(2) + 'K';
    } else {
      return (mem / 1024).toFixed(2) + 'M';
    }
  }

  _handleSort(sortedColumn: ?string, sortDescending: boolean): void {
    this.setState({sortedColumn, sortDescending});
  }

  _sortProcesses(
    processes: Process[],
    sortedColumnName: ?string,
    sortDescending: boolean,
  ): Process[] {
    if (sortedColumnName == null) {
      return processes;
    }
    // compare numerically pid, cpu and mem
    const compare: any = ['cpuUsage', 'memUsage', 'pid', 'debug'].includes(
      sortedColumnName,
    )
      ? (a: ?number, b: ?number, isAsc: boolean): number => {
          const cmp =
            (a || Number.NEGATIVE_INFINITY) - (b || Number.NEGATIVE_INFINITY);
          return isAsc ? cmp : -cmp;
        }
      : (a: string, b: string, isAsc: boolean): number => {
          const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
          return isAsc ? cmp : -cmp;
        };

    return processes.sort((a, b) =>
      compare(a[sortedColumnName], b[sortedColumnName], !sortDescending),
    );
  }

  render(): React.Element<any> {
    const stopPackageTask = this.props.processTasks.find(
      task => task.type === ('STOP_PACKAGE': ProcessTaskType),
    );
    const debuggerTasks = this.props.processTasks.filter(
      task => task.type === ('DEBUG': ProcessTaskType),
    );

    const filterRegex = new RegExp(this.state.filterText, 'i');
    const rows = this._sortProcesses(
      this.props.processes.filter(
        item =>
          filterRegex.test(item.user) ||
          filterRegex.test(`${item.pid}`) ||
          filterRegex.test(item.name),
      ),
      this.state.sortedColumn,
      this.state.sortDescending,
    ).map(item => ({
      data: {
        pid: (
          <span>
            {this._getStopPackageButton(item, stopPackageTask)} {item.pid}
          </span>
        ),
        user: item.user,
        name: item.name,
        cpuUsage: this._formatCpuUsage(item.cpuUsage),
        memUsage: this._formatMemUsage(item.memUsage),
        debug: this._getDebugButton(item, debuggerTasks),
      },
    }));
    const columns = [
      {
        key: 'pid',
        title: 'PID',
        width: 0.17,
      },
      {
        key: 'name',
        title: 'Name',
        width: 0.31,
      },
      {
        key: 'user',
        title: 'User',
        width: 0.13,
      },
      {
        key: 'cpuUsage',
        title: 'CPU',
        width: 0.15,
      },
      {
        key: 'memUsage',
        title: 'Mem',
        width: 0.15,
      },
      {
        key: 'debug',
        title: 'Debug',
        width: 0.08,
      },
    ];
    const emptyComponent = () => <div className="padded">No information</div>;

    return (
      <div>
        <AtomInput
          placeholderText="Filter process..."
          initialValue={this.state.filterText}
          onDidChange={this._handleFilterTextChange}
          size="sm"
        />
        <Table
          collapsable={false}
          columns={columns}
          maxBodyHeight="99999px"
          emptyComponent={emptyComponent}
          rows={rows}
          sortable={true}
          onSort={this._handleSort}
          sortedColumn={this.state.sortedColumn}
          sortDescending={this.state.sortDescending}
        />
      </div>
    );
  }

  _handleFilterTextChange(text: string): void {
    this.setState({
      filterText: text,
    });
  }

  _getDebugButton(item: Process, tasks: ProcessTask[]): ?React.Element<any> {
    for (const task of tasks) {
      // TODO(wallace) support multiple debuggers via a dialog
      if (task.isSupported(item)) {
        return (
          <Icon
            className="nuclide-device-panel-debug-button"
            icon="nuclicon-debugger"
            title={task.name}
            onClick={() => task.run(item)}
          />
        );
      }
    }

    return null;
  }

  _getStopPackageButton(
    proc: Process,
    task: ?ProcessTask,
  ): ?React.Element<any> {
    if (task == null) {
      return null;
    }
    return (
      <span
        onClick={() => task.run(proc)}
        ref={addTooltip({
          title: 'Stop package',
          delay: 300,
          placement: 'left',
        })}>
        <Icon icon="x" />
      </span>
    );
  }
}
