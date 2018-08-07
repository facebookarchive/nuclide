"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessTable = void 0;

function _ProcessTaskButton() {
  const data = require("./ProcessTaskButton");

  _ProcessTaskButton = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class ProcessTable extends React.Component {
  constructor(props) {
    super(props);

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({
        sortedColumn,
        sortDescending
      });
    };

    this._handleFilterTextChange = text => {
      this.setState({
        filterText: text
      });
    };

    this.state = {
      filterText: '',
      sortedColumn: 'cpuUsage',
      sortDescending: true
    };
  }

  componentDidMount() {
    this.props.toggleProcessPolling(true);
  }

  componentWillUnmount() {
    this.props.toggleProcessPolling(false);
  }

  _formatCpuUsage(cpu) {
    return cpu == null ? '' : cpu.toFixed(2) + '%';
  }

  _formatMemUsage(mem) {
    if (mem == null) {
      return '';
    } else if (mem < 1024) {
      return mem.toFixed(2) + 'K';
    } else {
      return (mem / 1024).toFixed(2) + 'M';
    }
  }

  _sortProcesses(processes, sortedColumnName, sortDescending) {
    if (sortedColumnName == null) {
      return processes;
    } // compare numerically the following fields


    const compare = ['cpuUsage', 'memUsage', 'pid', 'debug'].includes(sortedColumnName) ? (a, b, isAsc) => {
      const cmp = // flowlint-next-line sketchy-null-number:off
      (a || Number.NEGATIVE_INFINITY) - (b || Number.NEGATIVE_INFINITY);
      return isAsc ? cmp : -cmp;
    } : (a, b, isAsc) => {
      const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
      return isAsc ? cmp : -cmp;
    };
    return processes.sort((a, b) => // $FlowFixMe: Process doesn't have a debug field.
    compare(a[sortedColumnName], b[sortedColumnName], !sortDescending));
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    let processComponent;

    if (this.props.processes.isError) {
      processComponent = React.createElement("div", null, this.props.processes.error.toString());
    } else if (this.props.processes.isPending) {
      processComponent = React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL",
        key: "infoTableLoading"
      });
    } else {
      const rows = this._sortProcesses(this.props.processes.value.filter(item => filterRegex.test(item.user) || filterRegex.test(`${item.pid}`) || filterRegex.test(item.name)), this.state.sortedColumn, this.state.sortDescending).map(item => ({
        data: {
          pid: React.createElement("div", null, React.createElement(_ProcessTaskButton().ProcessTaskButton, {
            icon: "x",
            proc: item,
            taskType: "KILL",
            nameIfManyTasks: "Kill process",
            tasks: this.props.processTasks
          }), item.pid),
          user: item.user,
          name: item.name,
          cpuUsage: this._formatCpuUsage(item.cpuUsage),
          memUsage: this._formatMemUsage(item.memUsage),
          debug: React.createElement(_ProcessTaskButton().ProcessTaskButton, {
            icon: "nuclicon-debugger",
            className: "nuclide-device-panel-debug-button",
            proc: item,
            taskType: "DEBUG",
            nameIfManyTasks: "Debug process",
            tasks: this.props.processTasks
          })
        }
      }));

      const columns = [{
        key: 'pid',
        title: 'PID',
        width: 0.17
      }, {
        key: 'name',
        title: 'Name',
        width: 0.31
      }, {
        key: 'user',
        title: 'User',
        width: 0.13
      }, {
        key: 'cpuUsage',
        title: 'CPU',
        width: 0.15
      }, {
        key: 'memUsage',
        title: 'Mem',
        width: 0.15
      }, {
        key: 'debug',
        title: 'Debug',
        width: 0.08
      }];

      const emptyComponent = () => React.createElement("div", {
        className: "padded"
      }, "No information");

      processComponent = React.createElement(_Table().Table, {
        collapsable: false,
        columns: columns,
        maxBodyHeight: "99999px",
        emptyComponent: emptyComponent,
        rows: rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        className: "nuclide-device-panel-process-table"
      });
    }

    return React.createElement("div", null, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "Filter process...",
      initialValue: this.state.filterText,
      onDidChange: this._handleFilterTextChange,
      size: "sm"
    }), processComponent);
  }

}

exports.ProcessTable = ProcessTable;