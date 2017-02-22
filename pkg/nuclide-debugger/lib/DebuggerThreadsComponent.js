'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerThreadsComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('../../nuclide-ui/Icon');
}

var _Table;

function _load_Table() {
  return _Table = require('../../nuclide-ui/Table');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const activeThreadIndicatorComponent = props => _reactForAtom.React.createElement(
  'div',
  { className: 'nuclide-debugger-thread-list-item-current-indicator' },
  props.cellData ? _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) : null
);

class DebuggerThreadsComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSelectThread = this._handleSelectThread.bind(this);
    this._handleSort = this._handleSort.bind(this);
    this._sortRows = this._sortRows.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      threadList: props.threadStore.getThreadList(),
      selectedThreadId: props.threadStore.getSelectedThreadId(),
      sortedColumn: null,
      sortDescending: false
    };
  }

  componentDidMount() {
    const { threadStore } = this.props;
    this._disposables.add(threadStore.onChange(() => {
      this.setState({
        threadList: threadStore.getThreadList(),
        selectedThreadId: threadStore.getSelectedThreadId()
      });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleSelectThread(data) {
    this.props.bridge.selectThread(data.id);
  }

  _handleSort(sortedColumn, sortDescending) {
    this.setState({ sortedColumn, sortDescending });
  }

  _sortRows(threads, sortedColumnName, sortDescending) {
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
  }

  render() {
    const {
      threadList,
      selectedThreadId
    } = this.state;
    const activeThreadCol = {
      component: activeThreadIndicatorComponent,
      title: '',
      key: 'isSelected',
      width: 0.05
    };

    const defaultColumns = [activeThreadCol, {
      title: 'ID',
      key: 'id',
      width: 0.15
    }, {
      title: 'Address',
      key: 'address',
      width: 0.55
    }, {
      title: 'Stop Reason',
      key: 'stopReason',
      width: 0.25
    }];

    // Individual debuggers can override the displayed columns.
    const customColumns = this.props.customThreadColumns.length === 0 ? [] : [activeThreadCol].concat(this.props.customThreadColumns.map(col => ({
      title: col.title,
      key: col.key
    })));

    const columns = customColumns.length > 0 ? customColumns : defaultColumns;
    const emptyComponent = () => _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-thread-list-empty' },
      threadList == null ? '(threads unavailable)' : 'no threads to display'
    );
    const rows = threadList == null ? [] : threadList.map((threadItem, i) => {
      const cellData = {
        data: Object.assign({}, threadItem, {
          isSelected: Number(threadItem.id) === selectedThreadId
        })
      };
      if (Number(threadItem.id) === selectedThreadId) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'nuclide-debugger-thread-list-item-selected';
      }
      return cellData;
    });
    return _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
      columns: columns,
      emptyComponent: emptyComponent,
      rows: this._sortRows(rows, this.state.sortedColumn, this.state.sortDescending),
      selectable: true,
      resizable: true,
      onSelect: this._handleSelectThread,
      sortable: true,
      onSort: this._handleSort,
      sortedColumn: this.state.sortedColumn,
      sortDescending: this.state.sortDescending
    });
  }
}
exports.DebuggerThreadsComponent = DebuggerThreadsComponent;