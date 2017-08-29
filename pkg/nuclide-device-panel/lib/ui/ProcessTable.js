'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessTable = undefined;

var _ProcessTaskButton;

function _load_ProcessTaskButton() {
  return _ProcessTaskButton = require('./ProcessTaskButton');
}

var _react = _interopRequireWildcard(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ProcessTable extends _react.Component {
  constructor(props) {
    super(props);

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({ sortedColumn, sortDescending });
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
    }
    // compare numerically the following fields
    const compare = ['cpuUsage', 'memUsage', 'pid', 'debug'].includes(sortedColumnName) ? (a, b, isAsc) => {
      const cmp =
      // flowlint-next-line sketchy-null-number:off
      (a || Number.NEGATIVE_INFINITY) - (b || Number.NEGATIVE_INFINITY);
      return isAsc ? cmp : -cmp;
    } : (a, b, isAsc) => {
      const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
      return isAsc ? cmp : -cmp;
    };

    return processes.sort((a, b) => compare(a[sortedColumnName], b[sortedColumnName], !sortDescending));
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');

    let processComponent;
    if (this.props.processes.isError) {
      processComponent = _react.createElement(
        'div',
        null,
        this.props.processes.error.toString()
      );
    } else if (this.props.processes.isPending) {
      processComponent = _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL', key: 'infoTableLoading' });
    } else {
      const rows = this._sortProcesses(this.props.processes.value.filter(item => filterRegex.test(item.user) || filterRegex.test(`${item.pid}`) || filterRegex.test(item.name)), this.state.sortedColumn, this.state.sortDescending).map(item => ({
        data: {
          pid: _react.createElement(
            'div',
            null,
            _react.createElement((_ProcessTaskButton || _load_ProcessTaskButton()).ProcessTaskButton, {
              icon: 'x',
              proc: item,
              taskType: 'KILL',
              nameIfManyTasks: 'Kill process',
              tasks: this.props.processTasks
            }),
            item.pid
          ),
          user: item.user,
          name: item.name,
          cpuUsage: this._formatCpuUsage(item.cpuUsage),
          memUsage: this._formatMemUsage(item.memUsage),
          debug: _react.createElement((_ProcessTaskButton || _load_ProcessTaskButton()).ProcessTaskButton, {
            icon: 'nuclicon-debugger',
            className: 'nuclide-device-panel-debug-button',
            proc: item,
            taskType: 'DEBUG',
            nameIfManyTasks: 'Debug process',
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
      const emptyComponent = () => _react.createElement(
        'div',
        { className: 'padded' },
        'No information'
      );
      processComponent = _react.createElement((_Table || _load_Table()).Table, {
        collapsable: false,
        columns: columns,
        maxBodyHeight: '99999px',
        emptyComponent: emptyComponent,
        rows: rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        className: 'nuclide-device-panel-process-table'
      });
    }

    return _react.createElement(
      'div',
      null,
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Filter process...',
        initialValue: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm'
      }),
      processComponent
    );
  }

}
exports.ProcessTable = ProcessTable; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */