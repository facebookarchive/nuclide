'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceAndProcess = undefined;

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../nuclide-adb');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../nuclide-commons-ui/AtomInput');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../nuclide-commons-ui/LoadingSpinner');
}

var _Table;

function _load_Table() {
  return _Table = require('../nuclide-commons-ui/Table');
}

var _collection;

function _load_collection() {
  return _collection = require('../nuclide-commons/collection');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../nuclide-commons/debounce'));
}

var _expected;

function _load_expected() {
  return _expected = require('../nuclide-commons/expected');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AdbDeviceSelector;

function _load_AdbDeviceSelector() {
  return _AdbDeviceSelector = require('./AdbDeviceSelector');
}

var _EmulatorUtils;

function _load_EmulatorUtils() {
  return _EmulatorUtils = require('./EmulatorUtils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DeviceAndProcess extends _react.Component {

  constructor(props) {
    super(props);

    this._handleDeviceChange = device => {
      const oldDevice = this.state.selectedDevice;
      if (oldDevice != null && device != null && oldDevice.name === device.name && oldDevice.port === device.port) {
        // Same device selected.
        return;
      }

      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();
        this._javaProcessSubscription = null;
      }

      this.setState({
        selectedDevice: device,
        javaProcesses: device == null ? (_expected || _load_expected()).Expect.value([]) : (_expected || _load_expected()).Expect.pendingValue([]),
        selectedProcess: null,
        selectedProcessName: this.props.deserialize()
      });

      if (device != null) {
        // If a device is selected, observe the Java processes on the device.
        const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(this.props.targetUri);
        this._javaProcessSubscription = _rxjsBundlesRxMinJs.Observable.interval(2000).startWith(0).switchMap(() => adbService.getJavaProcesses(device).refCount()).distinctUntilChanged((a, b) => (0, (_collection || _load_collection()).arrayEqual)(a, b, (x, y) => {
          return x.user === y.user && x.pid === y.pid && x.name === y.name;
        })).subscribe(javaProcesses => {
          this._javaProcessListChanged((_expected || _load_expected()).Expect.value(javaProcesses));
        });
      }
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({ sortedColumn, sortDescending });
    };

    this._sortRows = (processes, sortedColumnName, sortDescending) => {
      if (sortedColumnName == null) {
        return processes;
      }

      // Use a numerical comparison for the pid column, string compare for all the others.
      const compare = sortedColumnName === 'pid' ? (a, b, isAsc) => {
        const cmp = (a || 0) - (b || 0);
        return isAsc ? cmp : -cmp;
      } : (a, b, isAsc) => {
        const cmp = String(a).toLowerCase().localeCompare(String(b).toLowerCase());
        return isAsc ? cmp : -cmp;
      };

      const getter = row => row.data[sortedColumnName];
      return [...processes].sort((a, b) => {
        return compare(getter(a), getter(b), !sortDescending);
      });
    };

    this._handleSelectTableRow = (item, selectedIndex) => {
      var _ref;

      this.setState({
        selectedProcess: item,
        selectedProcessName: (_ref = item) != null ? _ref.name : _ref
      });
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._javaProcessSubscription = null;
    this._disposables.add(() => {
      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();
      }
    });
    this._setAdbPorts = (0, (_debounce || _load_debounce()).default)(this._setAdbPorts.bind(this), 1000);

    this.state = {
      selectedDevice: null,
      javaProcesses: (_expected || _load_expected()).Expect.value([]),
      selectedProcess: null,
      selectedProcessName: null,
      sortedColumn: 'name',
      sortDescending: false,
      adbPorts: ''
    };
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _setAdbPorts(value) {
    (0, (_EmulatorUtils || _load_EmulatorUtils()).setAdbPath)(this.props.targetUri, (await (0, (_EmulatorUtils || _load_EmulatorUtils()).getAdbPath)()));

    const parsedPorts = value.split(/,\s*/).map(port => parseInt(port.trim(), 10)).filter(port => !Number.isNaN(port));

    (0, (_EmulatorUtils || _load_EmulatorUtils()).addAdbPorts)(this.props.targetUri, parsedPorts);
    this.setState({ adbPorts: value, selectedDevice: null });
  }

  setState(partialState, callback) {
    const fullState = Object.assign({}, this.state, partialState);
    super.setState(fullState, () => {
      this.props.onSelect(fullState.selectedDevice, fullState.selectedProcess);
      callback && callback();
    });
  }

  _javaProcessListChanged(javaProcesses) {
    const selectedPid = this.state.selectedProcess == null ? null : this.state.selectedProcess.pid;
    let selectedProcess = javaProcesses.isPending || javaProcesses.isError ? null : javaProcesses.value.find(process => process.pid === selectedPid);

    if (this.state.selectedProcessName != null) {
      selectedProcess = javaProcesses.isPending || javaProcesses.isError ? null : javaProcesses.value.find(process => process.name === this.state.selectedProcessName);
    }

    this.setState({
      javaProcesses,
      selectedProcess,
      selectedProcessName: selectedProcess == null ? null : selectedProcess.name
    });
  }

  _getColumns() {
    return [{
      key: 'pid',
      title: 'PID',
      width: 0.1
    }, {
      key: 'user',
      title: 'User',
      width: 0.1
    }, {
      key: 'name',
      title: 'Name',
      width: 0.8
    }];
  }

  render() {
    const devicesLabel = this.state.adbPorts === '' ? '' : '(ADB port ' + this.state.adbPorts + ')';

    const emptyMessage = this.state.selectedDevice == null ? 'No device selected' : 'No debuggable Java processes found!';
    const emptyComponent = () => _react.createElement(
      'div',
      null,
      this.state.javaProcesses.isPending ? _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL' }) : emptyMessage
    );

    const processListRows = !this.state.javaProcesses.isPending && !this.state.javaProcesses.isError ? this._sortRows(this.state.javaProcesses.value.map(processRow => {
      const data = {
        pid: processRow.pid,
        user: processRow.user,
        name: processRow.name
      };
      return { data };
    }), this.state.sortedColumn, this.state.sortDescending) : [];

    const selectedRows = this.state.selectedProcess == null ? [] : processListRows.filter(row => this.state.selectedProcess == null || row.data.pid === this.state.selectedProcess.pid && row.data.name === this.state.selectedProcess.name);
    const selectedRowIndex = selectedRows.length === 1 ? processListRows.indexOf(selectedRows[0]) : -1;

    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'ADB Server Port: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)',
        title: 'Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)',
        value: this.state.adbPorts,
        onDidChange: value => this._setAdbPorts(value)
      }),
      _react.createElement(
        'label',
        null,
        'Device: ',
        devicesLabel
      ),
      _react.createElement((_AdbDeviceSelector || _load_AdbDeviceSelector()).AdbDeviceSelector, {
        onChange: this._handleDeviceChange,
        targetUri: this.props.targetUri
      }),
      _react.createElement(
        'label',
        null,
        'Debuggable Java processes: '
      ),
      _react.createElement((_Table || _load_Table()).Table, {
        tabIndex: '12',
        collapsable: false,
        columns: this._getColumns(),
        emptyComponent: emptyComponent,
        fixedHeader: true,
        maxBodyHeight: '99999px',
        rows: processListRows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        selectable: true,
        selectedIndex: selectedRowIndex,
        onSelect: this._handleSelectTableRow
      })
    );
  }
}
exports.DeviceAndProcess = DeviceAndProcess; /**
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