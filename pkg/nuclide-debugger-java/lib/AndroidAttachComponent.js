'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AndroidAttachComponent = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));
















var _react = _interopRequireWildcard(require('react'));var _AdbDeviceSelector;
function _load_AdbDeviceSelector() {return _AdbDeviceSelector = require('./AdbDeviceSelector');}var _Table;
function _load_Table() {return _Table = require('../../../modules/nuclide-commons-ui/Table');}var _AtomInput;
function _load_AtomInput() {return _AtomInput = require('../../../modules/nuclide-commons-ui/AtomInput');}var _JavaDebuggerServiceHelpers;
function _load_JavaDebuggerServiceHelpers() {return _JavaDebuggerServiceHelpers = require('./JavaDebuggerServiceHelpers');}



var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));}var _debounce;
function _load_debounce() {return _debounce = _interopRequireDefault(require('../../../modules/nuclide-commons/debounce'));}var _nuclideDebuggerCommon;
function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');}var _EmulatorUtils;



function _load_EmulatorUtils() {return _EmulatorUtils = require('./EmulatorUtils');}var _LoadingSpinner;





function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../modules/nuclide-commons-ui/LoadingSpinner');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));}var _expected;
function _load_expected() {return _expected = require('../../../modules/nuclide-commons/expected');}var _utils;
function _load_utils() {return _utils = require('../../../modules/nuclide-adb/lib/utils');}var _collection;

function _load_collection() {return _collection = require('../../../modules/nuclide-commons/collection');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}




















class AndroidAttachComponent extends _react.Component {




  constructor(props) {var _this;
    _this = super(props);this.






















































































































































    _handleSort = (sortedColumn, sortDescending) => {
      this.setState({ sortedColumn, sortDescending });
    };this.

    _handleSelectTableRow = (
    item,
    selectedIndex) =>
    {
      this.setState({
        selectedProcess: item,
        selectedProcessName: item == null ? null : item.name });

    };this.





















    _sortRows = (
    processes,
    sortedColumnName,
    sortDescending) =>
    {
      if (sortedColumnName == null) {
        return processes;
      }

      // Use a numerical comparison for the pid column, string compare for all the others.
      const compare =
      sortedColumnName === 'pid' ?
      (a, b, isAsc) => {
        const cmp = (a || 0) - (b || 0);
        return isAsc ? cmp : -cmp;
      } :
      (a, b, isAsc) => {
        const cmp = String(a).
        toLowerCase().
        localeCompare(String(b).toLowerCase());
        return isAsc ? cmp : -cmp;
      };

      const getter = row => row.data[sortedColumnName];
      return [...processes].sort((a, b) => {
        return compare(getter(a), getter(b), !sortDescending);
      });
    };this.



































































































    _handleAttachClick = (0, _asyncToGenerator.default)(function* () {
      const adbService = (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).getAdbService)(_this.props.targetUri);
      const action = null;
      const activity = null;
      const device = _this.state.selectedDevice;if (!(
      device != null)) {throw new Error('No device selected.');}

      const selectedProcess = _this.state.selectedProcess;
      if (selectedProcess == null) {
        return;
      }

      const packageName = selectedProcess.name;

      yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).debugAndroidDebuggerService)(
      parseInt(selectedProcess.pid, 10),
      adbService,
      null /* service */,
      activity,
      action,
      device,
      packageName,
      _this.props.targetUri /* adbServiceUri */,
      _this.props.targetUri);


      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        selectedDeviceName:
        _this.state.selectedDevice == null ? '' : _this.state.selectedDevice.name,
        selectedProcessName: packageName });

    });this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();this._deserializedSavedSettings = false;this._javaProcessSubscription = null;this._disposables.add(() => {if (this._javaProcessSubscription != null) {this._javaProcessSubscription.unsubscribe();}});this._setAdbPorts = (0, (_debounce || _load_debounce()).default)(this._setAdbPorts.bind(this), 1000);this._handleDeviceChange = this._handleDeviceChange.bind(this);this.state = { selectedDevice: null, javaProcesses: (_expected || _load_expected()).Expect.value([]), selectedProcess: null, selectedProcessName: null, sortedColumn: 'name', sortDescending: false, adbPorts: '', adbPath: null };}_getAdbParameters() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {_this2.setState({ adbPorts: (yield (0, (_EmulatorUtils || _load_EmulatorUtils()).getAdbPorts)(_this2.props.targetUri)).join(', '), adbPath: (_nuclideUri || _load_nuclideUri()).default.isRemote(_this2.props.targetUri) ? yield (0, (_EmulatorUtils || _load_EmulatorUtils()).getAdbPath)() : 'adb' });})();}componentDidMount() {var _this3 = this;this._getAdbParameters();this._disposables.add(atom.commands.add('atom-workspace', { 'core:confirm': (() => {var _ref2 = (0, _asyncToGenerator.default)(function* () {if (_this3._debugButtonShouldEnable()) {yield _this3._handleAttachClick();}});return function coreConfirm() {return _ref2.apply(this, arguments);};})() }));(0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {this.setState({ selectedProcessName: savedSettings.selectedProcessName });});}componentWillUnmount() {this._disposables.dispose();}setState(newState) {super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));}_debugButtonShouldEnable() {return this.state.selectedProcess != null && this.state.selectedDevice != null;}_handleDeviceChange(device) {const oldDevice = this.state.selectedDevice;if (oldDevice != null && device != null && oldDevice.name === device.name && oldDevice.port === device.port) {// Same device selected.
      return;}this.setState({ selectedDevice: device, javaProcesses: device == null ? (_expected || _load_expected()).Expect.value([]) : (_expected || _load_expected()).Expect.pendingValue([]), selectedProcess: null });if (this._javaProcessSubscription != null) {this._javaProcessSubscription.unsubscribe();this._javaProcessSubscription = null;}if (device != null) {// If a device is selected, observe the Java processes on the device.
      const adbService = (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(this.props.targetUri);if (!(adbService != null)) {throw new Error('Invariant violation: "adbService != null"');}this._javaProcessSubscription = _rxjsBundlesRxMinJs.Observable.interval(2000).startWith(0).switchMap(() => adbService.getJavaProcesses(device).refCount()).distinctUntilChanged((a, b) => (0, (_collection || _load_collection()).arrayEqual)(a, b, (x, y) => {return x.user === y.user && x.pid === y.pid && x.name === y.name;})).subscribe(javaProcesses => {this._javaProcessListChanged((_expected || _load_expected()).Expect.value(javaProcesses));});}}_getSerializationArgs() {return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'Java - Android'];}_javaProcessListChanged(javaProcesses) {const selectedPid = this.state.selectedProcess == null ? null : this.state.selectedProcess.pid;let selectedProcess = javaProcesses.isPending || javaProcesses.isError ? null : javaProcesses.value.find(process => process.pid === selectedPid);if (this.state.selectedProcessName != null) {selectedProcess = javaProcesses.isPending || javaProcesses.isError ? null : javaProcesses.value.find(process => process.name === this.state.selectedProcessName);}this.setState({ javaProcesses, selectedProcess, selectedProcessName: selectedProcess == null ? null : selectedProcess.name });}_getColumns() {return [{ key: 'pid', title: 'PID', width: 0.1 }, { key: 'user', title: 'User', width: 0.1 }, { key: 'name', title: 'Name', width: 0.8 }];}_setAdbPorts(value) {(0, (_EmulatorUtils || _load_EmulatorUtils()).setAdbPath)(this.props.targetUri, this.state.adbPath || '');const parsedPorts = value.split(/,\s*/).map(port => parseInt(port.trim(), 10)).filter(port => !Number.isNaN(port));(0, (_EmulatorUtils || _load_EmulatorUtils()).addAdbPorts)(this.props.targetUri, parsedPorts);this.setState({ adbPorts: value });}render() {const processListRows = !this.state.javaProcesses.isPending && !this.state.javaProcesses.isError ? this._sortRows(this.state.javaProcesses.value.map(processRow => {const data = { pid: processRow.pid, user: processRow.user, name: processRow.name };return { data };}), this.state.sortedColumn, this.state.sortDescending) : [];const emptyMessage = this.state.selectedDevice == null ? 'No device selected' : 'No debuggable Java processes found!';const emptyComponent = () => _react.createElement('div', null, this.state.javaProcesses.isPending ? _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL' }) : emptyMessage);const selectedRows = this.state.selectedProcess == null ? [] : processListRows.filter(row => this.state.selectedProcess == null || row.data.pid === this.state.selectedProcess.pid && row.data.name === this.state.selectedProcess.name);const selectedRowIndex = selectedRows.length === 1 ? processListRows.indexOf(selectedRows[0]) : -1;const devicesLabel = this.state.adbPorts === '' ? '' : '(ADB port ' + this.state.adbPorts + ')';return _react.createElement('div', { className: 'block' }, _react.createElement('label', null, 'ADB Server Port: '), _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, { placeholderText: 'Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)', title: 'Optional. (For One World devices, specify ANDROID_ADB_SERVER_PORT from one_world_adb)', value: this.state.adbPorts, onDidChange: value => this._setAdbPorts(value) }), _react.createElement('label', null, 'Device: ', devicesLabel), _react.createElement((_AdbDeviceSelector || _load_AdbDeviceSelector()).AdbDeviceSelector, { tabIndex: '11', onChange: this._handleDeviceChange, targetUri: this.props.targetUri }), _react.createElement('label', null, 'Debuggable Java processes: '), _react.createElement((_Table || _load_Table()).Table, { tabIndex: '12', collapsable: false, columns: this._getColumns(), emptyComponent: emptyComponent, fixedHeader: true, maxBodyHeight: '99999px', rows: processListRows, sortable: true, onSort: this._handleSort, sortedColumn: this.state.sortedColumn, sortDescending: this.state.sortDescending, selectable: true, selectedIndex: selectedRowIndex, onSelect: this._handleSelectTableRow }));}}exports.AndroidAttachComponent = AndroidAttachComponent; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */