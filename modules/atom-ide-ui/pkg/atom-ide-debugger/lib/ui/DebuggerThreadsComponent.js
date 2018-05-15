'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));














var _react = _interopRequireWildcard(require('react'));var _event;

function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _observable;
function _load_observable() {return _observable = require('../../../../../nuclide-commons/observable');}
var _reactDom = _interopRequireDefault(require('react-dom'));var _Icon;
function _load_Icon() {return _Icon = require('../../../../../nuclide-commons-ui/Icon');}var _Table;
function _load_Table() {return _Table = require('../../../../../nuclide-commons-ui/Table');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _LoadingSpinner;
function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}var _scrollIntoView;



function _load_scrollIntoView() {return _scrollIntoView = require('../../../../../nuclide-commons-ui/scrollIntoView');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
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























const activeThreadIndicatorComponent = props =>
_react.createElement('div', { className: 'debugger-thread-list-item-current-indicator' },
  props.cellData ?
  _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) :
  null);



class DebuggerThreadsComponent extends _react.Component


{



  constructor(props) {var _this;
    _this = super(props);this.


















































    _handleThreadsChanged = () => {
      this.setState(this._getState());
    };this.









    _handleSelectThread = (() => {var _ref = (0, _asyncToGenerator.default)(function* (data) {
        const { service } = _this.props;
        const matchedThread = _this.state.threadList.filter(
        function (t) {return t.threadId === data.id;});if (!(


        matchedThread.length === 1)) {throw new Error('Invariant violation: "matchedThread.length === 1"');}
        const thread = matchedThread[0];
        yield service.getModel().fetchCallStack(thread);
        _this.props.service.focusStackFrame(null, thread, null, true);
      });return function (_x) {return _ref.apply(this, arguments);};})();this.

    _handleSort = (sortedColumn, sortDescending) => {
      this.setState({ sortedColumn, sortDescending });
    };this.

    _sortRows = (
    threads,
    sortedColumnName,
    sortDescending) =>
    {
      if (sortedColumnName == null) {
        return threads;
      }

      // Use a numerical comparison for the ID column, string compare for all the others.
      const compare =
      sortedColumnName.toLowerCase() === 'id' ?
      (a, b, isAsc) => {
        const cmp = (a || 0) - (b || 0);
        return isAsc ? cmp : -cmp;
      } :
      (a, b, isAsc) => {
        const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
        return isAsc ? cmp : -cmp;
      };

      const getter = row => row.data[sortedColumnName];
      return [...threads].sort((a, b) => {
        return compare(getter(a), getter(b), !sortDescending);
      });
    };this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();this.state = Object.assign({ sortedColumn: null, sortDescending: false, threadList: [], selectedThreadId: -1, threadsLoading: false }, this._getState());}componentDidMount() {const { service } = this.props;const { viewModel } = service;const model = service.getModel();this._disposables.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, (_event || _load_event()).observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model))).let((0, (_observable || _load_observable()).fastDebounce)(150)).subscribe(this._handleThreadsChanged));}componentWillUnmount() {this._disposables.dispose();}componentDidUpdate() {// Ensure the selected thread is scrolled into view.
    this._scrollSelectedThreadIntoView();}_scrollSelectedThreadIntoView() {const listNode = _reactDom.default.findDOMNode(this._threadTable);if (listNode) {const selectedRows = // $FlowFixMe
      listNode.getElementsByClassName('debugger-thread-list-item-selected');if (selectedRows && selectedRows.length > 0) {(0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoViewIfNeeded)(selectedRows[0], false);}}}_getState() {const { focusedThread, focusedProcess } = this.props.service.viewModel;return { threadList: focusedProcess == null ? [] : focusedProcess.getAllThreads(), selectedThreadId: focusedThread == null ? -1 : focusedThread.threadId };}render() {
    const { threadList, selectedThreadId } = this.state;
    const activeThreadCol = {
      component: activeThreadIndicatorComponent,
      title: '',
      key: 'isSelected',
      width: 0.05 };


    let supportsTerminateThreadsRequest = false;
    const { focusedProcess } = this.props.service.viewModel;
    if (
    focusedProcess != null &&
    focusedProcess.session != null &&
    Boolean(
    focusedProcess.session.capabilities.supportsTerminateThreadsRequest))

    {
      supportsTerminateThreadsRequest = true;
    }

    const columns = [
    activeThreadCol,
    {
      title: 'ID',
      key: 'id',
      width: 0.1 },

    {
      title: 'Name',
      key: 'name',
      width: 0.15 },

    {
      title: 'Address',
      key: 'address',
      width: supportsTerminateThreadsRequest ? 0.35 : 0.45 },

    {
      title: 'Stop Reason',
      key: 'stopReason',
      width: 0.25 }];



    if (supportsTerminateThreadsRequest) {
      columns.push({
        title: 'Terminate',
        key: 'terminateThread',
        width: 0.1,
        component: () =>
        _react.createElement((_Icon || _load_Icon()).Icon, {
          icon: 'x',
          title: 'Terminate Thread',
          onClick: event => {
            atom.commands.dispatch(
            event.target.parentElement,
            'debugger:terminate-thread');

            event.stopPropagation();
          } }) });



    }

    const emptyComponent = () =>
    _react.createElement('div', { className: 'debugger-thread-list-empty' },
      threadList == null ? '(threads unavailable)' : 'no threads to display');


    const rows =
    threadList == null ?
    [] :
    threadList.map(thread => {
      const stoppedDetails = thread.stoppedDetails;
      const callstack = thread.getCallStack();
      const cellData = {
        data: {
          id: thread.threadId,
          name: thread.name,
          address: callstack.length === 0 ? null : callstack[0].name,
          stopped: thread.stopped,
          stopReason:
          stoppedDetails == null ?
          null :
          stoppedDetails.description != null ?
          stoppedDetails.description :
          stoppedDetails.reason,
          isSelected: thread.threadId === selectedThreadId,
          terminateThread: thread.threadId } };


      if (thread.threadId === selectedThreadId) {
        cellData.className =
        'debugger-thread-list-item debugger-thread-list-item-selected';
      } else {
        cellData.className = 'debugger-thread-list-item';
      }

      // Decorate the cells with the thread ID they correspond to
      // so context menus know what thread to target for commands.
      cellData.rowAttributes = {
        'data-threadid': thread.threadId };


      return cellData;
    });

    if (this.state.threadsLoading) {
      return (
        _react.createElement('div', { className: 'debugger-thread-loading', title: 'Loading threads...' },
          _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM })));


    }

    return (
      _react.createElement((_Table || _load_Table()).Table, {
        columns: columns,
        emptyComponent: emptyComponent,
        rows: this._sortRows(
        rows,
        this.state.sortedColumn,
        this.state.sortDescending),

        selectable: cellData => cellData.stopped,
        resizable: true,
        onSelect: this._handleSelectThread,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        ref: table => {
          this._threadTable = table;
        } }));


  }}exports.default = DebuggerThreadsComponent;