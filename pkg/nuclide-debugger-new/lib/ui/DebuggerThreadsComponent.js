'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _scrollIntoView;

function _load_scrollIntoView() {
  return _scrollIntoView = require('nuclide-commons-ui/scrollIntoView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const activeThreadIndicatorComponent = props => _react.createElement(
  'div',
  { className: 'nuclide-debugger-thread-list-item-current-indicator' },
  props.cellData ? _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) : null
);

class DebuggerThreadsComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleSelectThread = data => {
      this.props.service.focusStackFrame(null, data, null, true);
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({ sortedColumn, sortDescending });
    };

    this._sortRows = (threads, sortedColumnName, sortDescending) => {
      if (sortedColumnName == null) {
        return threads;
      }

      // Use a numerical comparison for the ID column, string compare for all the others.
      const compare = sortedColumnName.toLowerCase() === 'id' ? (a, b, isAsc) => {
        const cmp = (a || 0) - (b || 0);
        return isAsc ? cmp : -cmp;
      } : (a, b, isAsc) => {
        const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
        return isAsc ? cmp : -cmp;
      };

      const getter = row => row.data[sortedColumnName];
      return [...threads].sort((a, b) => {
        return compare(getter(a), getter(b), !sortDescending);
      });
    };

    this._handleThreadsChanged = (0, (_debounce || _load_debounce()).default)(this._handleThreadsChanged, 150);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = Object.assign({
      sortedColumn: null,
      sortDescending: false,
      threadList: [],
      selectedThreadId: -1,
      threadsLoading: false
    }, this._getState());
  }

  componentDidMount() {
    this._disposables.add(this.props.service.getModel().onDidChangeCallStack(() => this._handleThreadsChanged()));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate() {
    // Ensure the selected thread is scrolled into view.
    this._scrollSelectedThreadIntoView();
  }

  _scrollSelectedThreadIntoView() {
    const listNode = _reactDom.default.findDOMNode(this._threadTable);
    if (listNode) {
      const selectedRows =
      // $FlowFixMe
      listNode.getElementsByClassName('nuclide-debugger-thread-list-item-selected');

      if (selectedRows && selectedRows.length > 0) {
        (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoViewIfNeeded)(selectedRows[0], false);
      }
    }
  }

  _handleThreadsChanged() {
    this.setState(this._getState());
  }

  _getState() {
    const { focusedThread, focusedProcess } = this.props.service.viewModel;
    return {
      threadList: focusedProcess == null ? [] : focusedProcess.getAllThreads(),
      selectedThreadId: focusedThread == null ? -1 : focusedThread.threadId,
      threadsLoading: false // TODO
    };
  }

  render() {
    const { threadList, selectedThreadId } = this.state;
    const activeThreadCol = {
      component: activeThreadIndicatorComponent,
      title: '',
      key: 'isSelected',
      width: 0.05
    };

    const columns = [activeThreadCol, {
      title: 'ID',
      key: 'id',
      width: 0.1
    }, {
      title: 'Name',
      key: 'name',
      width: 0.15
    }, {
      title: 'Address',
      key: 'address',
      width: 0.45
    }, {
      title: 'Stop Reason',
      key: 'stopReason',
      width: 0.25
    }];

    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-thread-list-empty' },
      threadList == null ? '(threads unavailable)' : 'no threads to display'
    );
    const rows = threadList == null ? [] : threadList.map(thread => {
      const stoppedDetails = thread.stoppedDetails;
      const callstack = thread.getCallStack();
      const cellData = {
        data: {
          id: thread.threadId,
          name: thread.name,
          address: callstack.length === 0 ? null : callstack[0].name,
          stopReason: stoppedDetails == null ? null : stoppedDetails.reason,
          isSelected: thread.threadId === selectedThreadId
        }
      };
      if (thread.threadId === selectedThreadId) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'nuclide-debugger-thread-list-item-selected';
      }
      return cellData;
    });

    if (this.state.threadsLoading) {
      return _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-thread-loading',
          title: 'Loading threads...' },
        _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.MEDIUM })
      );
    }

    return _react.createElement((_Table || _load_Table()).Table, {
      columns: columns,
      emptyComponent: emptyComponent,
      rows: this._sortRows(rows, this.state.sortedColumn, this.state.sortDescending),
      selectable: true,
      resizable: true,
      onSelect: this._handleSelectThread,
      sortable: true,
      onSort: this._handleSort,
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending,
      ref: table => {
        this._threadTable = table;
      }
    });
  }
}
exports.default = DebuggerThreadsComponent;