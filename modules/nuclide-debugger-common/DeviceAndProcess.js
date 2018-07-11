/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {AdbDevice, AndroidJavaProcess} from 'nuclide-adb/lib/types';
import type {Column, Row} from 'nuclide-commons-ui/Table';
import type {Expected} from 'nuclide-commons/expected';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Subscription} from 'rxjs';

import idx from 'idx';
import {getAdbServiceByNuclideUri} from 'nuclide-adb';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {Table} from 'nuclide-commons-ui/Table';
import {arrayEqual} from 'nuclide-commons/collection';
import {Expect} from 'nuclide-commons/expected';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as React from 'react';
import {Observable} from 'rxjs';
import {AdbDeviceSelector} from './AdbDeviceSelector';

type ColumnName = 'pid' | 'user' | 'name';

type Props = {|
  +targetUri: NuclideUri,
  +onSelect: (device: ?AdbDevice, javaProcess: ?AndroidJavaProcess) => void,
  +deserialize: () => ?string,
|};

type State = {
  selectedDevice: ?AdbDevice,
  javaProcesses: Expected<Array<AndroidJavaProcess>>,
  selectedProcess: ?AndroidJavaProcess,
  selectedProcessName: ?string,
  sortedColumn: ?ColumnName,
  sortDescending: boolean,
};

export class DeviceAndProcess extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _javaProcessSubscription: ?Subscription;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this._javaProcessSubscription = null;
    this._disposables.add(() => {
      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();
      }
    });

    this.state = {
      selectedDevice: null,
      javaProcesses: Expect.value([]),
      selectedProcess: null,
      selectedProcessName: null,
      sortedColumn: 'name',
      sortDescending: false,
    };
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(partialState: Object, callback?: () => mixed): void {
    const fullState: State = {
      ...this.state,
      ...partialState,
    };
    super.setState(fullState, () => {
      this.props.onSelect(fullState.selectedDevice, fullState.selectedProcess);
      callback && callback();
    });
  }

  _handleDeviceChange = (device: ?AdbDevice): void => {
    const oldDevice = this.state.selectedDevice;
    if (
      oldDevice != null &&
      device != null &&
      oldDevice.serial === device.serial
    ) {
      // Same device selected.
      return;
    }

    if (this._javaProcessSubscription != null) {
      this._javaProcessSubscription.unsubscribe();
      this._javaProcessSubscription = null;
    }

    this.setState({
      selectedDevice: device,
      javaProcesses: device == null ? Expect.value([]) : Expect.pending(),
      selectedProcess: null,
      selectedProcessName: this.props.deserialize(),
    });

    if (device != null) {
      // If a device is selected, observe the Java processes on the device.
      const adbService = getAdbServiceByNuclideUri(this.props.targetUri);
      this._javaProcessSubscription = Observable.interval(2000)
        .startWith(0)
        .switchMap(() => adbService.getJavaProcesses(device.serial).refCount())
        .distinctUntilChanged((a, b) =>
          arrayEqual(a, b, (x, y) => {
            return x.user === y.user && x.pid === y.pid && x.name === y.name;
          }),
        )
        .subscribe(javaProcesses => {
          this._javaProcessListChanged(Expect.value(javaProcesses));
        });
    }
  };

  _javaProcessListChanged(javaProcesses: Expected<Array<AndroidJavaProcess>>) {
    const selectedPid =
      this.state.selectedProcess == null
        ? null
        : this.state.selectedProcess.pid;
    let selectedProcess = javaProcesses
      .getOrDefault([])
      .find(process => process.pid === selectedPid);

    if (this.state.selectedProcessName != null) {
      selectedProcess = javaProcesses
        .getOrDefault([])
        .find(process => process.name === this.state.selectedProcessName);
    }

    this.setState({
      javaProcesses,
      selectedProcess,
      selectedProcessName:
        selectedProcess == null ? null : selectedProcess.name,
    });
  }

  _getColumns(): Array<Column<*>> {
    return [
      {
        key: 'pid',
        title: 'PID',
        width: 0.1,
      },
      {
        key: 'user',
        title: 'User',
        width: 0.1,
      },
      {
        key: 'name',
        title: 'Name',
        width: 0.8,
      },
    ];
  }

  _handleSort = (sortedColumn: ?ColumnName, sortDescending: boolean): void => {
    this.setState({sortedColumn, sortDescending});
  };

  _sortRows = (
    processes: Array<Row<*>>,
    sortedColumnName: ?ColumnName,
    sortDescending: boolean,
  ): Array<Row<*>> => {
    if (sortedColumnName == null) {
      return processes;
    }

    // Use a numerical comparison for the pid column, string compare for all the others.
    const compare: any =
      sortedColumnName === 'pid'
        ? (a: ?number, b: ?number, isAsc: boolean): number => {
            const cmp = (a || 0) - (b || 0);
            return isAsc ? cmp : -cmp;
          }
        : (a: ?string, b: ?string, isAsc: boolean): number => {
            const cmp = String(a)
              .toLowerCase()
              .localeCompare(String(b).toLowerCase());
            return isAsc ? cmp : -cmp;
          };

    const getter = row => row.data[sortedColumnName];
    return [...processes].sort((a, b) => {
      return compare(getter(a), getter(b), !sortDescending);
    });
  };

  _handleSelectTableRow = (
    item: ?AndroidJavaProcess,
    selectedIndex: number,
  ): void => {
    this.setState({
      selectedProcess: item,
      selectedProcessName: idx(item, _ => _.name),
    });
  };

  render(): React.Node {
    const emptyMessage: string =
      this.state.selectedDevice == null
        ? 'No device selected'
        : 'No debuggable Java processes found!';
    const emptyComponent = () => (
      <div>
        {this.state.javaProcesses.isPending ? (
          <LoadingSpinner size="EXTRA_SMALL" />
        ) : (
          emptyMessage
        )}
      </div>
    );

    let shouldHighlightRow = _ => false;
    try {
      // $FlowFB
      shouldHighlightRow = require('./fb-isFBProcessName').isFBProcessName;
    } catch (e) {}

    const processListRows = this._sortRows(
      this.state.javaProcesses.getOrDefault([]).map(processRow => {
        const data = {
          pid: processRow.pid,
          user: processRow.user,
          name: processRow.name,
        };
        const highlightRow = shouldHighlightRow(processRow.name);
        return {
          data,
          className: highlightRow
            ? 'device-and-process-table-highlight-row'
            : undefined,
        };
      }),
      this.state.sortedColumn,
      this.state.sortDescending,
    );

    const selectedRows =
      this.state.selectedProcess == null
        ? []
        : processListRows.filter(
            row =>
              this.state.selectedProcess == null ||
              (row.data.pid === this.state.selectedProcess.pid &&
                row.data.name === this.state.selectedProcess.name),
          );
    const selectedRowIndex =
      selectedRows.length === 1 ? processListRows.indexOf(selectedRows[0]) : -1;

    return (
      <div className="block">
        <label>Device:</label>
        <AdbDeviceSelector
          onChange={this._handleDeviceChange}
          targetUri={this.props.targetUri}
        />
        <label>Debuggable Java processes: </label>
        <Table
          collapsable={false}
          columns={this._getColumns()}
          emptyComponent={emptyComponent}
          fixedHeader={true}
          maxBodyHeight="30em"
          rows={processListRows}
          sortable={true}
          onSort={this._handleSort}
          sortedColumn={this.state.sortedColumn}
          sortDescending={this.state.sortDescending}
          selectable={true}
          selectedIndex={selectedRowIndex}
          onSelect={this._handleSelectTableRow}
        />
      </div>
    );
  }
}
