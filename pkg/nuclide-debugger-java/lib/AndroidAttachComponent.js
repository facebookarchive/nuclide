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

import type {AndroidJavaProcess} from 'nuclide-adb/lib/types';
import type {Column, Row} from 'nuclide-commons-ui/Table';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Expected} from 'nuclide-commons/expected';
import type {Device} from '../../nuclide-device-panel/lib/types';

import * as React from 'react';
import {AdbDeviceSelector} from './AdbDeviceSelector';
import {Table} from 'nuclide-commons-ui/Table';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import {
  getAdbService,
  debugAndroidDebuggerService,
} from './JavaDebuggerServiceHelpers';
import {Subscription} from 'rxjs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import debounce from 'nuclide-commons/debounce';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {
  getAdbPath,
  getAdbPorts,
  setAdbPath,
  addAdbPorts,
} from './EmulatorUtils';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Expect} from 'nuclide-commons/expected';
import {getAdbServiceByNuclideUri} from 'nuclide-adb/lib/utils';
import invariant from 'assert';
import {arrayEqual} from 'nuclide-commons/collection';
import {Observable} from 'rxjs';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
|};

type State = {|
  selectedDevice: ?Device,
  javaProcesses: Expected<Array<AndroidJavaProcess>>,
  selectedProcess: ?AndroidJavaProcess,
  sortedColumn: ?ColumnName,
  sortDescending: boolean,
  selectedProcessName: ?string,
  adbPorts: string,
  adbPath: ?string,
|};

type ColumnName = 'pid' | 'user' | 'name';

export class AndroidAttachComponent extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _deserializedSavedSettings: boolean;
  _javaProcessSubscription: ?Subscription;

  constructor(props: Props) {
    super(props);

    this._disposables = new UniversalDisposable();
    this._deserializedSavedSettings = false;
    this._javaProcessSubscription = null;
    this._disposables.add(() => {
      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();
      }
    });
    (this: any)._setAdbPorts = debounce(this._setAdbPorts.bind(this), 1000);
    (this: any)._handleDeviceChange = this._handleDeviceChange.bind(this);

    this.state = {
      selectedDevice: null,
      javaProcesses: Expect.value([]),
      selectedProcess: null,
      selectedProcessName: null,
      sortedColumn: 'name',
      sortDescending: false,
      adbPorts: '',
      adbPath: null,
    };
  }

  async _getAdbParameters() {
    this.setState({
      adbPorts: (await getAdbPorts(this.props.targetUri)).join(', '),
      adbPath: nuclideUri.isRemote(this.props.targetUri)
        ? await getAdbPath()
        : 'adb',
    });
  }

  componentDidMount(): void {
    this._getAdbParameters();
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': async (): Promise<void> => {
          if (this._debugButtonShouldEnable()) {
            await this._handleAttachClick();
          }
        },
      }),
    );

    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          selectedProcessName: savedSettings.selectedProcessName,
        });
      },
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  _debugButtonShouldEnable(): boolean {
    return (
      this.state.selectedProcess != null && this.state.selectedDevice != null
    );
  }

  _handleDeviceChange(device: ?Device): void {
    const oldDevice = this.state.selectedDevice;
    if (
      oldDevice != null &&
      device != null &&
      oldDevice.name === device.name &&
      oldDevice.port === device.port
    ) {
      // Same device selected.
      return;
    }

    this.setState({
      selectedDevice: device,
      javaProcesses:
        device == null ? Expect.value([]) : Expect.pendingValue([]),
      selectedProcess: null,
    });

    if (this._javaProcessSubscription != null) {
      this._javaProcessSubscription.unsubscribe();
      this._javaProcessSubscription = null;
    }

    if (device != null) {
      // If a device is selected, observe the Java processes on the device.
      const adbService = getAdbServiceByNuclideUri(this.props.targetUri);
      invariant(adbService != null);
      this._javaProcessSubscription = Observable.interval(2000)
        .startWith(0)
        .switchMap(() => adbService.getJavaProcesses(device).refCount())
        .distinctUntilChanged((a, b) =>
          arrayEqual(a, b, (x, y) => {
            return x.user === y.user && x.pid === y.pid && x.name === y.name;
          }),
        )
        .subscribe(javaProcesses => {
          this._javaProcessListChanged(Expect.value(javaProcesses));
        });
    }
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'attach',
      'Java - Android',
    ];
  }

  _javaProcessListChanged(javaProcesses: Expected<Array<AndroidJavaProcess>>) {
    const selectedPid =
      this.state.selectedProcess == null
        ? null
        : this.state.selectedProcess.pid;
    let selectedProcess =
      javaProcesses.isPending || javaProcesses.isError
        ? null
        : javaProcesses.value.find(process => process.pid === selectedPid);

    if (this.state.selectedProcessName != null) {
      selectedProcess =
        javaProcesses.isPending || javaProcesses.isError
          ? null
          : javaProcesses.value.find(
              process => process.name === this.state.selectedProcessName,
            );
    }

    this.setState({
      javaProcesses,
      selectedProcess,
      selectedProcessName:
        selectedProcess == null ? null : selectedProcess.name,
    });
  }

  _handleSort = (sortedColumn: ?ColumnName, sortDescending: boolean): void => {
    this.setState({sortedColumn, sortDescending});
  };

  _handleSelectTableRow = (
    item: ?AndroidJavaProcess,
    selectedIndex: number,
  ): void => {
    this.setState({
      selectedProcess: item,
      selectedProcessName: item == null ? null : item.name,
    });
  };

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

  _setAdbPorts(value: string): void {
    setAdbPath(this.props.targetUri, this.state.adbPath || '');

    const parsedPorts = value
      .split(/,\s*/)
      .map(port => parseInt(port.trim(), 10))
      .filter(port => !Number.isNaN(port));

    addAdbPorts(this.props.targetUri, parsedPorts);
    this.setState({adbPorts: value});
  }

  render(): React.Node {
    const processListRows =
      !this.state.javaProcesses.isPending && !this.state.javaProcesses.isError
        ? this._sortRows(
            this.state.javaProcesses.value.map(processRow => {
              const data = {
                pid: processRow.pid,
                user: processRow.user,
                name: processRow.name,
              };
              return {data};
            }),
            this.state.sortedColumn,
            this.state.sortDescending,
          )
        : [];

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

    const devicesLabel =
      this.state.adbPorts === ''
        ? ''
        : '(ADB port ' + this.state.adbPorts + ')';

    return (
      <div className="block">
        <label>ADB Server Port: </label>
        <AtomInput
          placeholderText="Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)"
          title="Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)"
          value={this.state.adbPorts}
          onDidChange={value => this._setAdbPorts(value)}
        />
        <label>Device: {devicesLabel}</label>
        <AdbDeviceSelector
          tabIndex="11"
          onChange={this._handleDeviceChange}
          targetUri={this.props.targetUri}
        />
        <label>Debuggable Java processes: </label>
        <Table
          tabIndex="12"
          collapsable={false}
          columns={this._getColumns()}
          emptyComponent={emptyComponent}
          fixedHeader={true}
          maxBodyHeight="99999px"
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

  _handleAttachClick = async (): Promise<void> => {
    const adbService = getAdbService(this.props.targetUri);
    const action = null;
    const activity = null;
    const device = this.state.selectedDevice;
    invariant(device != null, 'No device selected.');

    const selectedProcess = this.state.selectedProcess;
    if (selectedProcess == null) {
      return;
    }

    const packageName = selectedProcess.name;

    await debugAndroidDebuggerService(
      parseInt(selectedProcess.pid, 10),
      adbService,
      null /* service */,
      activity,
      action,
      device,
      packageName,
      this.props.targetUri /* adbServiceUri */,
      this.props.targetUri,
    );

    serializeDebuggerConfig(...this._getSerializationArgs(), {
      selectedDeviceName:
        this.state.selectedDevice == null ? '' : this.state.selectedDevice.name,
      selectedProcessName: packageName,
    });
  };
}
