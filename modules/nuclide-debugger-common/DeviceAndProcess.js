"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceAndProcess = void 0;

function _nuclideAdb() {
  const data = require("../nuclide-adb");

  _nuclideAdb = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
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

function _collection() {
  const data = require("../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _expected() {
  const data = require("../nuclide-commons/expected");

  _expected = function () {
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

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AdbDeviceSelector() {
  const data = require("./AdbDeviceSelector");

  _AdbDeviceSelector = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class DeviceAndProcess extends React.Component {
  constructor(props) {
    super(props);

    this._handleDeviceChange = device => {
      const oldDevice = this.state.selectedDevice;

      if (oldDevice != null && device != null && oldDevice.serial === device.serial) {
        // Same device selected.
        return;
      }

      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();

        this._javaProcessSubscription = null;
      }

      this.setState({
        selectedDevice: device,
        javaProcesses: device == null ? _expected().Expect.value([]) : _expected().Expect.pending(),
        selectedProcess: null,
        selectedProcessName: this.props.deserialize()
      });

      if (device != null) {
        // If a device is selected, observe the Java processes on the device.
        const adbService = (0, _nuclideAdb().getAdbServiceByNuclideUri)(this.props.targetUri);
        this._javaProcessSubscription = _RxMin.Observable.interval(2000).startWith(0).switchMap(() => adbService.getJavaProcesses(device.serial).refCount()).distinctUntilChanged((a, b) => (0, _collection().arrayEqual)(a, b, (x, y) => {
          return x.user === y.user && x.pid === y.pid && x.name === y.name;
        })).subscribe(javaProcesses => {
          this._javaProcessListChanged(_expected().Expect.value(javaProcesses));
        });
      }
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({
        sortedColumn,
        sortDescending
      });
    };

    this._sortRows = (processes, sortedColumnName, sortDescending) => {
      if (sortedColumnName == null) {
        return processes;
      } // Use a numerical comparison for the pid column, string compare for all the others.


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

    this._disposables = new (_UniversalDisposable().default)();
    this._javaProcessSubscription = null;

    this._disposables.add(() => {
      if (this._javaProcessSubscription != null) {
        this._javaProcessSubscription.unsubscribe();
      }
    });

    this.state = {
      selectedDevice: null,
      javaProcesses: _expected().Expect.value([]),
      selectedProcess: null,
      selectedProcessName: null,
      sortedColumn: 'name',
      sortDescending: false
    };
  }

  componentWillUnmount() {
    this._disposables.dispose();
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
    let selectedProcess = javaProcesses.getOrDefault([]).find(process => process.pid === selectedPid);

    if (this.state.selectedProcessName != null) {
      selectedProcess = javaProcesses.getOrDefault([]).find(process => process.name === this.state.selectedProcessName);
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
    const emptyMessage = this.state.selectedDevice == null ? 'No device selected' : 'No debuggable Java processes found!';

    const emptyComponent = () => React.createElement("div", null, this.state.javaProcesses.isPending ? React.createElement(_LoadingSpinner().LoadingSpinner, {
      size: "EXTRA_SMALL"
    }) : emptyMessage);

    let shouldHighlightRow = _ => false;

    try {
      // $FlowFB
      shouldHighlightRow = require("./fb-isFBProcessName").isFBProcessName;
    } catch (e) {}

    const processListRows = this._sortRows(this.state.javaProcesses.getOrDefault([]).map(processRow => {
      const data = {
        pid: processRow.pid,
        user: processRow.user,
        name: processRow.name
      };
      const highlightRow = shouldHighlightRow(processRow.name);
      return {
        data,
        className: highlightRow ? 'device-and-process-table-highlight-row' : undefined
      };
    }), this.state.sortedColumn, this.state.sortDescending);

    const selectedRows = this.state.selectedProcess == null ? [] : processListRows.filter(row => this.state.selectedProcess == null || row.data.pid === this.state.selectedProcess.pid && row.data.name === this.state.selectedProcess.name);
    const selectedRowIndex = selectedRows.length === 1 ? processListRows.indexOf(selectedRows[0]) : -1;
    return React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Device:"), React.createElement(_AdbDeviceSelector().AdbDeviceSelector, {
      onChange: this._handleDeviceChange,
      targetUri: this.props.targetUri
    }), React.createElement("label", null, "Debuggable Java processes: "), React.createElement(_Table().Table, {
      collapsable: false,
      columns: this._getColumns(),
      emptyComponent: emptyComponent,
      fixedHeader: true,
      maxBodyHeight: "30em",
      rows: processListRows,
      sortable: true,
      onSort: this._handleSort,
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending,
      selectable: true,
      selectedIndex: selectedRowIndex,
      onSelect: this._handleSelectTableRow
    }));
  }

}

exports.DeviceAndProcess = DeviceAndProcess;