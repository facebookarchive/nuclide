'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessTable = undefined;

var _react = _interopRequireDefault(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ProcessTable extends _react.default.Component {

  constructor(props) {
    super(props);

    this._processesSubscription = null;
    this._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    this._handleSort = this._handleSort.bind(this);

    this.state = {
      filterText: '',
      sortedColumn: 'cpuUsage',
      sortDescending: true
    };
  }

  componentDidMount() {
    this._processesSubscription = this.props.startFetchingProcesses();
  }

  componentWillUnmount() {
    if (this._processesSubscription != null) {
      this._processesSubscription.unsubscribe();
    }
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

  _handleSort(sortedColumn, sortDescending) {
    this.setState({ sortedColumn, sortDescending });
  }

  _sortProcesses(processes, sortedColumnName, sortDescending) {
    if (sortedColumnName == null) {
      return processes;
    }
    // compare numerically pid, cpu and mem
    const compare = ['cpuUsage', 'memUsage', 'pid'].includes(sortedColumnName) ? (a, b, isAsc) => {
      const cmp = (a || Number.NEGATIVE_INFINITY) - (b || Number.NEGATIVE_INFINITY);
      return isAsc ? cmp : -cmp;
    } : (a, b, isAsc) => {
      const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
      return isAsc ? cmp : -cmp;
    };

    return processes.sort((a, b) => compare(a[sortedColumnName], b[sortedColumnName], !sortDescending));
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const rows = this._sortProcesses(this.props.processes.filter(item => filterRegex.test(item.user) || filterRegex.test(`${item.pid}`) || filterRegex.test(item.name)), this.state.sortedColumn, this.state.sortDescending).map(item => ({
      data: {
        pid: _react.default.createElement(
          'span',
          null,
          this._getKillButton(item.name),
          ' ',
          item.pid
        ),
        user: item.user,
        name: item.name,
        cpuUsage: this._formatCpuUsage(item.cpuUsage),
        memUsage: this._formatMemUsage(item.memUsage)
      }
    }));
    const columns = [{
      key: 'pid',
      title: 'PID',
      width: 0.17
    }, {
      key: 'name',
      title: 'Name',
      width: 0.38
    }, {
      key: 'user',
      title: 'User',
      width: 0.15
    }, {
      key: 'cpuUsage',
      title: 'CPU',
      width: 0.15
    }, {
      key: 'memUsage',
      title: 'Mem',
      width: 0.15
    }];
    const emptyComponent = () => _react.default.createElement(
      'div',
      { className: 'padded' },
      'No information'
    );

    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Filter process...',
        initialValue: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm'
      }),
      _react.default.createElement((_Table || _load_Table()).Table, {
        collapsable: false,
        columns: columns,
        maxBodyHeight: '99999px',
        emptyComponent: emptyComponent,
        rows: rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending
      })
    );
  }

  _handleFilterTextChange(text) {
    this.setState({
      filterText: text
    });
  }

  _getKillButton(packageName) {
    const killProcess = this.props.killProcess;
    if (killProcess == null) {
      return null;
    }
    return _react.default.createElement(
      'span',
      {
        className: 'nuclide-device-panel-link-with-icon',
        onClick: () => killProcess(packageName),
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: 'Kill process',
          delay: 300,
          placement: 'left'
        }) },
      _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'x' })
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