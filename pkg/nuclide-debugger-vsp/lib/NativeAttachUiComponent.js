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

import type {Column} from 'nuclide-commons-ui/Table';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ProcessInfo} from 'nuclide-commons/process';
import type {VsAdapterType} from 'nuclide-debugger-common';
import type {Option} from '../../nuclide-ui/Dropdown';

import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import {track} from '../../nuclide-analytics';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService} from '../../commons-atom/debugger';
import {getVSCodeDebuggerAdapterServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getNativeVSPAttachProcessInfo} from './utils';
import {Observable} from 'rxjs';
import {Table} from 'nuclide-commons-ui/Table';
import {Dropdown} from '../../nuclide-ui/Dropdown';

const PROCESS_UPDATES_INTERVAL_MS = 2000;

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
  +debuggerBackends: Array<Option>,
  +defaultDebuggerBackend: VsAdapterType,
|};

type ColumnName = 'process' | 'pid' | 'command';

type ProcessRow = {
  process: string,
  pid: number,
  command: string,
};

type State = {
  processList: Array<ProcessRow>,
  selectedProcess: ?ProcessRow,
  sortDescending: boolean,
  sortedColumn: ?ColumnName,
  filterText: string,
  sourcePath: string,
  debuggerBackend: VsAdapterType,
};

function getColumns(): Array<Column<*>> {
  return [
    {
      title: 'Process Binary',
      key: 'process',
      width: 0.25,
    },
    {
      title: 'PID',
      key: 'pid',
      width: 0.1,
    },
    {
      title: 'Command',
      key: 'command',
      width: 0.65,
    },
  ];
}

function getCompareFunction(
  sortedColumn: ?ColumnName,
  sortDescending: boolean,
): (a: ProcessRow, b: ProcessRow) => number {
  switch (sortedColumn) {
    case 'process':
      return (target1: ProcessRow, target2: ProcessRow) => {
        const first = sortDescending ? target2.process : target1.process;
        const second = sortDescending ? target1.process : target2.process;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    case 'pid':
      const order = sortDescending ? -1 : 1;
      return (target1: ProcessRow, target2: ProcessRow) =>
        order * (target1.pid - target2.pid);
    case 'command':
      return (target1: ProcessRow, target2: ProcessRow) => {
        const first = sortDescending ? target2.command : target1.command;
        const second = sortDescending ? target1.command : target2.command;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    default:
      break;
  }
  return () => 0;
}

function filterProcesses(processes: Array<ProcessRow>, filterText: string) {
  // Show all results if invalid regex
  let filterRegex;
  try {
    filterRegex = new RegExp(filterText, 'i');
  } catch (e) {
    return processes;
  }
  return processes.filter(
    item =>
      filterRegex.test(item.process) ||
      filterRegex.test(item.pid.toString()) ||
      filterRegex.test(item.command),
  );
}

export default class NativeAttachUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      processList: [],
      selectedProcess: null,
      sortDescending: false,
      sortedColumn: null,
      filterText: '',
      sourcePath: '',
      debuggerBackend: props.defaultDebuggerBackend,
    };
  }

  _getSerializationArgs() {
    return [
      nuclideUri.isRemote(this.props.targetUri)
        ? nuclideUri.getHostname(this.props.targetUri)
        : 'local',
      'attach',
      'gdb',
    ];
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
  }

  componentDidMount(): void {
    const defaults = {
      sortDescending: false,
      sortedColumn: null,
      filterText: '',
      sourcePath: '',
    };

    deserializeDebuggerConfig(
      ...this._getSerializationArgs(),
      (transientSettings, savedSettings) => {
        this.setState({
          ...transientSettings,
          ...defaults,
        });
      },
    );

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': () => {
          if (this._debugButtonShouldEnable()) {
            this._handleAttachButtonClick();
          }
        },
      }),
    );

    this._disposables.add(
      Observable.interval(PROCESS_UPDATES_INTERVAL_MS)
        .startWith(0)
        .flatMap(_ =>
          getVSCodeDebuggerAdapterServiceByNuclideUri(
            this.props.targetUri,
          ).getProcessTree(),
        )
        .subscribe(this._updateList),
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _debugButtonShouldEnable(): boolean {
    return this.state.selectedProcess != null;
  }

  _updateList = (processes: Array<ProcessInfo>): void => {
    // On Linux, process names for which only a name is available
    // are denoted as [name] in the commandWithArgs field. These
    // names often do not play well with basename (in particular,
    // some of the contain literal slashes) so handle them as a special
    // case.
    const noargsRegex = /^\[(.*)\]$/;
    const commandName = (name, withArgs) => {
      const match = withArgs.match(noargsRegex);
      if (match != null) {
        return match[1];
      }
      return nuclideUri.basename(name);
    };

    const processList = processes.map(process => {
      return {
        process: commandName(process.command, process.commandWithArgs),
        pid: process.pid,
        command: process.commandWithArgs,
      };
    });

    this.setState({processList});
  };

  _handleFilterTextChange = (text: string): void => {
    // Check if we've filtered down to one option and select if so
    let selectedProcess = this.state.selectedProcess;
    const filteredProcesses = filterProcesses(this.state.processList, text);
    if (filteredProcesses.length === 1) {
      selectedProcess = filteredProcesses[0];
    }

    this.setState({
      filterText: text,
      selectedProcess,
    });
  };

  _handleSelectTableRow = (
    selectedProcess: ProcessInfo,
    selectedIndex: number,
  ): void => {
    this.setState({selectedProcess});
  };

  _handleSort = (sortedColumn: string, sortDescending: boolean): void => {
    this.setState({
      sortedColumn,
      sortDescending,
    });
  };

  _onDebuggerBackendChange = (debuggerBackend: ?string): void => {
    this.setState({debuggerBackend});
  };

  render(): React.Node {
    const {
      processList,
      sortedColumn,
      sortDescending,
      selectedProcess,
      filterText,
    } = this.state;
    const sortFunction = getCompareFunction(sortedColumn, sortDescending);
    let selectedIndex = null;

    const rows = filterProcesses(processList, filterText)
      .sort(sortFunction)
      .map((process, index) => {
        const row = {
          data: process,
        };

        if (selectedProcess != null && selectedProcess.pid === process.pid) {
          selectedIndex = index;
        }

        return row;
      });

    return (
      <div className="block">
        <p>Attach to a running native process</p>
        <AtomInput
          placeholderText="Search..."
          value={this.state.filterText}
          onDidChange={this._handleFilterTextChange}
          size="sm"
          autofocus={true}
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
          collapsable={true}
        />
        <label>Source path: </label>
        <AtomInput
          placeholderText="Optional base path for sources"
          value={this.state.sourcePath}
          onDidChange={value => this.setState({sourcePath: value})}
        />
        <label>Debugger backend: </label>
        <Dropdown
          options={this.props.debuggerBackends}
          onChange={this._onDebuggerBackendChange}
          value={this.state.debuggerBackend}
        />
      </div>
    );
  }

  _handleAttachButtonClick = async (): Promise<void> => {
    const selectedProcess = this.state.selectedProcess;
    if (selectedProcess == null) {
      return;
    }

    track('fb-native-debugger-attach-from-dialog');
    const pid = selectedProcess.pid;
    const attachInfo = await getNativeVSPAttachProcessInfo(
      this.state.debuggerBackend,
      this.props.targetUri,
      {
        pid,
        sourcePath: this.state.sourcePath,
      },
    );

    const debuggerService = await getDebuggerService();
    debuggerService.startDebugging(attachInfo);

    serializeDebuggerConfig(
      ...this._getSerializationArgs(),
      {},
      {
        sortDescending: this.state.sortDescending,
        sortedColumn: this.state.sortedColumn,
        filterText: this.state.filterText,
        sourcePath: this.state.sourcePath,
      },
    );
  };
}
