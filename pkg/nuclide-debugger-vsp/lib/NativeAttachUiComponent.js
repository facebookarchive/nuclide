'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const PROCESS_UPDATES_INTERVAL_MS = 2000;

function getColumns() {
  return [{
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
}

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

class NativeAttachUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);

    this._updateList = processes => {
      const processList = processes.map(process => {
        return {
          process: (_nuclideUri || _load_nuclideUri()).default.basename(process.command),
          pid: process.pid,
          command: process.commandWithArgs
        };
      });

      this.setState({ processList });
    };

    this._handleFilterTextChange = text => {
      // Check if we've filtered down to one option and select if so
      let selectedProcess = this.state.selectedProcess;
      const filteredProcesses = filterProcesses(this.state.processList, text);
      if (filteredProcesses.length === 1) {
        selectedProcess = filteredProcesses[0];
      }

      this.setState({
        filterText: text,
        selectedProcess
      });
    };

    this._handleSelectTableRow = (selectedProcess, selectedIndex) => {
      this.setState({ selectedProcess });
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({
        sortedColumn,
        sortDescending
      });
    };

    this._handleAttachButtonClick = (0, _asyncToGenerator.default)(function* () {
      const selectedProcess = _this.state.selectedProcess;
      if (selectedProcess == null) {
        return;
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-native-debugger-attach-from-dialog');
      const pid = selectedProcess.pid;
      const attachInfo = yield (0, (_utils || _load_utils()).getGdbAttachProcessInfo)(_this.props.targetUri, pid, _this.state.sourcePath);

      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      debuggerService.startDebugging(attachInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {}, {
        sortDescending: _this.state.sortDescending,
        sortedColumn: _this.state.sortedColumn,
        filterText: _this.state.filterText,
        sourcePath: _this.state.sourcePath
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      processList: [],
      selectedProcess: null,
      sortDescending: false,
      sortedColumn: null,
      filterText: '',
      sourcePath: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'gdb'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount() {
    const defaults = {
      sortDescending: false,
      sortedColumn: null,
      filterText: '',
      sourcePath: ''
    };

    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState(Object.assign({}, transientSettings, defaults));
    });

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachButtonClick();
        }
      }
    }));

    this._disposables.add(_rxjsBundlesRxMinJs.Observable.interval(PROCESS_UPDATES_INTERVAL_MS).startWith(0).flatMap(_ => (0, (_process || _load_process()).psTree)()).subscribe(this._updateList));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _debugButtonShouldEnable() {
    return this.state.selectedProcess != null;
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

    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'p',
        null,
        'Attach to a running native process'
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Search...',
        value: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm',
        autofocus: true
      }),
      _react.createElement((_Table || _load_Table()).Table, {
        columns: getColumns(),
        fixedHeader: true,
        maxBodyHeight: '30em',
        rows: rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        selectable: true,
        selectedIndex: selectedIndex,
        onSelect: this._handleSelectTableRow,
        collapsable: true
      }),
      _react.createElement(
        'label',
        null,
        'Source path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Optional base path for sources',
        value: this.state.sourcePath,
        onDidChange: value => this.setState({ sourcePath: value })
      })
    );
  }

}
exports.default = NativeAttachUiComponent;