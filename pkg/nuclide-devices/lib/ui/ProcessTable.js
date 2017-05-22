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

import type {Device, Process, ProcessKiller} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import React from 'react';
import {Subscription} from 'rxjs';
import {Table} from 'nuclide-commons-ui/Table';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import addTooltip from 'nuclide-commons-ui/addTooltip';
import {Icon} from 'nuclide-commons-ui/Icon';
import {getServiceByNuclideUri} from '../../../nuclide-remote-connection';
import consumeFirstProvider from '../../../commons-atom/consumeFirstProvider';
import {getJavaDebuggerApi} from '../JavaDebuggerApi';

type Props = {
  startFetchingProcesses: () => Subscription,
  killProcess: ?ProcessKiller,
  processes: Process[],
  host: NuclideUri,
  device: ?Device,
};

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
        pid: <span>{this._getKillButton(item.name)} {item.pid}</span>,
        user: item.user,
        name: item.name,
        cpuUsage: this._formatCpuUsage(item.cpuUsage),
        memUsage: this._formatMemUsage(item.memUsage),
        debug: this._getDebugButton(item),
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

  _getDebugButton(item: Process): ?React.Element<any> {
    if (item.isJava) {
      return (
        <Icon
          className="nuclide-device-panel-debug-button"
          icon="nuclicon-debugger"
          title="Attach Java debugger"
          onClick={() => this._debugJavaProcess(item.pid)}
        />
      );
    }

    return null;
  }

  async _debugJavaProcess(pid: number): Promise<void> {
    const service = getServiceByNuclideUri(
      'JavaDebuggerService',
      this.props.host,
    );
    if (service == null) {
      throw new Error('Java debugger service is not available.');
    }

    const debuggerService = await consumeFirstProvider(
      'nuclide-debugger.remote',
    );
    const deviceName = this.props.device != null ? this.props.device.name : '';
    const javaDebugger = getJavaDebuggerApi();
    if (javaDebugger != null) {
      const debugInfo = javaDebugger.createAndroidDebugInfo({
        targetUri: this.props.host,
        packageName: '',
        device: deviceName,
        pid,
      });
      debuggerService.startDebugging(debugInfo);
    } else {
      atom.notifications.addWarning(
        'The Java debugger service is not available.',
      );
    }
  }

  _getKillButton(packageName: string): ?React.Element<any> {
    const killProcess = this.props.killProcess;
    if (killProcess == null) {
      return null;
    }
    return (
      <span
        className="nuclide-device-panel-link-with-icon"
        onClick={() => killProcess(packageName)}
        ref={addTooltip({
          title: 'Kill process',
          delay: 300,
          placement: 'left',
        })}>
        <Icon icon="x" />
      </span>
    );
  }
}
