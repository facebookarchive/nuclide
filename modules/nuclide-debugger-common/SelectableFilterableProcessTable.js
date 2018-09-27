"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _debugAdapterService() {
  const data = require("./debug-adapter-service");

  _debugAdapterService = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const PROCESS_UPDATES_INTERVAL_MS = 2000;
const COLUMNS = [{
  title: 'Process Binary',
  key: 'process',
  width: 0.25
}, {
  title: 'PID',
  key: 'pid',
  width: 0.1
}, {
  title: 'Command',
  key: 'command',
  width: 0.65
}];

function getCompareFunction(sortedColumn, sortDescending) {
  switch (sortedColumn) {
    case 'process':
      return (target1, target2) => {
        const first = sortDescending ? target2.process : target1.process;
        const second = sortDescending ? target1.process : target2.process;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };

    case 'pid':
      const order = sortDescending ? -1 : 1;
      return (target1, target2) => order * (target1.pid - target2.pid);

    case 'command':
      return (target1, target2) => {
        const first = sortDescending ? target2.command : target1.command;
        const second = sortDescending ? target1.command : target2.command;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };

    default:
      break;
  }

  return () => 0;
}

function filterProcesses(processes, filterText) {
  // Show all results if invalid regex
  let filterRegex;

  try {
    filterRegex = new RegExp(filterText, 'i');
  } catch (e) {
    return processes;
  }

  return processes.filter(item => filterRegex.test(item.process) || filterRegex.test(item.pid.toString()) || filterRegex.test(item.command));
}

class SelectableFilterableProcessTable extends React.Component {
  constructor(props) {
    super(props);

    this._updateList = processes => {
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

        return _nuclideUri().default.basename(name);
      };

      const processList = processes.map(process => {
        return {
          process: commandName(process.command, process.commandWithArgs),
          pid: process.pid,
          command: process.commandWithArgs
        };
      });
      this.setState({
        processList
      });
    };

    this._handleFilterTextChange = filterText => {
      // Check if we've filtered down to one option and select if so
      const filteredProcesses = filterProcesses(this.state.processList, filterText); // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate

      let selectedProcess = this.state.selectedProcess;

      if (filteredProcesses.length === 1) {
        // Check if we've filtered down to one option and select if so
        selectedProcess = filteredProcesses[0];
      } else if (filteredProcesses.findIndex(processRow => selectedProcess != null && selectedProcess.pid === processRow.pid) === -1) {
        // If we filter out our current selection,
        //   set our current selection to null
        selectedProcess = null;
      }

      this.setState({
        filterText,
        selectedProcess
      });
    };

    this._handleSelectTableRow = (selectedProcess, selectedIndex) => {
      this.setState({
        selectedProcess
      });
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({
        sortedColumn,
        sortDescending
      });
    };

    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      processList: [],
      selectedProcess: null,
      sortDescending: false,
      sortedColumn: null,
      filterText: ''
    };
  }

  componentDidMount() {
    this._disposables.add(_RxMin.Observable.interval(PROCESS_UPDATES_INTERVAL_MS).startWith(0).flatMap(_ => (0, _debugAdapterService().getVSCodeDebuggerAdapterServiceByNuclideUri)(this.props.targetUri).getProcessTree()).subscribe(this._updateList));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    const onSelect = this.props.onSelect != null ? this.props.onSelect : _ => {};
    let changedSelectedProcess = false;

    if (newState.selectedProcess != null) {
      if (this.state.selectedProcess != null) {
        changedSelectedProcess = newState.selectedProcess.pid !== this.state.selectedProcess.pid;
      } else {
        changedSelectedProcess = true;
      }
    } else if (typeof newState.selectedProcess === 'undefined') {
      // this is the case that setState was not called with a selectedProcess
      changedSelectedProcess = false;
    } else {
      changedSelectedProcess = this.state.selectedProcess != null;
    }

    super.setState(newState, () => {
      changedSelectedProcess && onSelect(newState.selectedProcess);
    });
  }

  render() {
    const {
      processList,
      sortedColumn,
      sortDescending,
      selectedProcess,
      filterText
    } = this.state;
    const sortFunction = getCompareFunction(sortedColumn, sortDescending);
    let selectedIndex = null;
    const rows = filterProcesses(processList, filterText).sort(sortFunction).map((process, index) => {
      const row = {
        data: process
      };

      if (selectedProcess != null && selectedProcess.pid === process.pid) {
        selectedIndex = index;
      }

      return row;
    });
    return React.createElement("div", {
      className: "block"
    }, React.createElement("p", null, "Attach to a running native process"), React.createElement(_AtomInput().AtomInput, {
      placeholderText: "Search...",
      value: this.state.filterText,
      onDidChange: this._handleFilterTextChange,
      size: "sm",
      autofocus: true
    }), React.createElement(_Table().Table, {
      columns: COLUMNS,
      fixedHeader: true,
      maxBodyHeight: "30em",
      rows: rows,
      sortable: true,
      onSort: this._handleSort,
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending,
      selectable: true,
      selectedIndex: selectedIndex,
      onSelect: this._handleSelectTableRow,
      collapsable: true
    }));
  }

}

exports.default = SelectableFilterableProcessTable;