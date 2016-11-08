'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DefaultEmptyComponent = () => _reactForAtom.React.createElement(
  'div',
  { className: 'nuclide-ui-table-empty-message' },
  'Empty table'
);

// ColumnKey must be unique within the containing collection.
let Table = exports.Table = class Table extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._globalEventsDisposable = null;
    this._resizeStartX = null;
    this._tableWidth = null;
    this._columnBeingResized = null;
    this._handleResizerGlobalMouseUp = this._handleResizerGlobalMouseUp.bind(this);
    this._handleResizerGlobalMouseMove = this._handleResizerGlobalMouseMove.bind(this);
    this.state = {
      columnWidthRatios: this._getInitialWidthsForColumns(this.props.columns)
    };
  }

  _getInitialWidthsForColumns(columns) {
    const columnWidthRatios = {};
    let assignedWidth = 0;
    const unresolvedColumns = [];
    columns.forEach(column => {
      const key = column.key,
            width = column.width;

      if (width != null) {
        columnWidthRatios[key] = width;
        assignedWidth += width;
      } else {
        unresolvedColumns.push(column);
      }
    });
    const residualColumnWidth = (1 - assignedWidth) / unresolvedColumns.length;
    unresolvedColumns.forEach(column => {
      columnWidthRatios[column.key] = residualColumnWidth;
    });
    return columnWidthRatios;
  }

  /* Applies sizing constraints, and returns whether the column width actually changed. */
  _updateWidths(resizedColumn, newColumnSize) {
    const columnWidthRatios = this.state.columnWidthRatios;
    const columns = this.props.columns;

    const originalColumnSize = columnWidthRatios[resizedColumn];
    const columnAfterResizedColumn = columns[columns.findIndex(column => column.key === resizedColumn) + 1].key;
    const followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
    const constrainedNewColumnSize = Math.max(0, Math.min(newColumnSize, followingColumnSize + originalColumnSize));
    if (Math.abs(newColumnSize - constrainedNewColumnSize) > Number.EPSILON) {
      return false;
    }
    const updatedColumnWidths = {};
    columns.forEach(column => {
      const key = column.key;

      let width;
      if (column.key === resizedColumn) {
        width = constrainedNewColumnSize;
      } else if (column.key === columnAfterResizedColumn) {
        width = columnWidthRatios[resizedColumn] - constrainedNewColumnSize + columnWidthRatios[key];
      } else {
        width = columnWidthRatios[key];
      }
      updatedColumnWidths[key] = width;
    });
    this.setState({
      columnWidthRatios: updatedColumnWidths
    });
    return true;
  }

  _handleResizerMouseDown(key, event) {
    if (this._globalEventsDisposable != null) {
      this._unsubscribeFromGlobalEvents();
    }
    // Prevent browser from initiating drag events on accidentally selected elements.
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    document.addEventListener('mousemove', this._handleResizerGlobalMouseMove);
    document.addEventListener('mouseup', this._handleResizerGlobalMouseUp);
    this._resizeStartX = event.pageX;
    this._tableWidth = _reactForAtom.ReactDOM.findDOMNode(this.refs.table).getBoundingClientRect().width;
    this._columnBeingResized = key;
    this._globalEventsDisposable = new _atom.Disposable(() => {
      document.removeEventListener('mousemove', this._handleResizerGlobalMouseMove);
      document.removeEventListener('mouseup', this._handleResizerGlobalMouseUp);
      this._resizeStartX = null;
      this._tableWidth = null;
      this._columnBeingResized = null;
    });
  }

  _unsubscribeFromGlobalEvents() {
    if (this._globalEventsDisposable == null) {
      return;
    }
    this._globalEventsDisposable.dispose();
    this._globalEventsDisposable = null;
  }

  _handleResizerGlobalMouseUp(event) {
    this._unsubscribeFromGlobalEvents();
  }

  _handleResizerGlobalMouseMove(event) {
    if (this._resizeStartX == null || this._tableWidth == null || this._columnBeingResized == null) {
      return;
    }
    var _ref = event;
    const pageX = _ref.pageX;

    const deltaX = pageX - this._resizeStartX;
    const currentColumnSize = this.state.columnWidthRatios[this._columnBeingResized];
    const didUpdate = this._updateWidths(this._columnBeingResized, (this._tableWidth * currentColumnSize + deltaX) / this._tableWidth);
    if (didUpdate) {
      this._resizeStartX = pageX;
    }
  }

  _dispose() {
    this._unsubscribeFromGlobalEvents();
  }

  componentWillUnmount() {
    this._dispose();
  }

  _handleSortByColumn(sortedBy) {
    var _props = this.props;
    const onSort = _props.onSort,
          sortDescending = _props.sortDescending,
          sortedColumn = _props.sortedColumn;

    if (onSort == null) {
      return;
    }
    onSort(sortedBy, sortDescending == null || sortedBy !== sortedColumn ? false : !sortDescending);
  }

  _handleRowClick(selectedIndex, event) {
    var _props2 = this.props;
    const onSelect = _props2.onSelect,
          rows = _props2.rows;

    if (onSelect == null) {
      return;
    }
    const selectedItem = rows[selectedIndex];
    onSelect(selectedItem.data, selectedIndex);
  }

  _renderEmptyCellContent() {
    return _reactForAtom.React.createElement('div', null);
  }

  render() {
    var _props3 = this.props;
    const alternateBackground = _props3.alternateBackground,
          className = _props3.className,
          columns = _props3.columns,
          maxBodyHeight = _props3.maxBodyHeight,
          rows = _props3.rows,
          selectable = _props3.selectable,
          selectedIndex = _props3.selectedIndex,
          sortable = _props3.sortable,
          sortedColumn = _props3.sortedColumn,
          sortDescending = _props3.sortDescending;

    const header = columns.map((column, i) => {
      const title = column.title,
            key = column.key;

      const resizeHandle = i === columns.length - 1 ? null : _reactForAtom.React.createElement('div', {
        className: 'nuclide-ui-table-header-resize-handle',
        onMouseDown: this._handleResizerMouseDown.bind(this, key),
        onClick: e => {
          // Prevent sortable column header click event from firing.
          e.stopPropagation();
        }
      });
      const width = this.state.columnWidthRatios[key];
      const optionalHeaderCellProps = {};
      if (width != null) {
        optionalHeaderCellProps.style = {
          width: width + '%'
        };
      }
      let sortIndicator;
      let titleOverlay = title;
      if (sortable) {
        optionalHeaderCellProps.onClick = this._handleSortByColumn.bind(this, key);
        titleOverlay += ' – click to sort';
        if (sortedColumn === key) {
          sortIndicator = _reactForAtom.React.createElement(
            'span',
            null,
            ' ',
            _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: sortDescending ? 'triangle-down' : 'triangle-up' })
          );
        }
      }
      return _reactForAtom.React.createElement(
        'th',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)({
            'nuclide-ui-table-header-cell': true,
            'nuclide-ui-table-header-cell-sortable': sortable
          }),
          title: titleOverlay,
          key: key
        }, optionalHeaderCellProps),
        title,
        sortIndicator,
        resizeHandle
      );
    });
    let body = rows.map((row, i) => {
      const rowClassName = row.className,
            data = row.data;

      const renderedRow = columns.map((column, j) => {
        const key = column.key,
              Component = column.component;

        let datum = data[key];
        if (Component != null) {
          datum = _reactForAtom.React.createElement(Component, { data: datum });
        } else if (datum == null) {
          datum = this._renderEmptyCellContent();
        }
        const cellStyle = {};
        if (i === 0) {
          const width = this.state.columnWidthRatios[key];
          if (width != null) {
            cellStyle.width = width + '%';
          }
        }
        return _reactForAtom.React.createElement(
          'td',
          {
            className: 'nuclide-ui-table-body-cell',
            key: j,
            style: cellStyle },
          datum
        );
      });
      const rowProps = {};
      if (selectable) {
        rowProps.onClick = this._handleRowClick.bind(this, i);
      }
      const isSelectedRow = selectedIndex != null && i === selectedIndex;
      return _reactForAtom.React.createElement(
        'tr',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)(rowClassName, {
            'nuclide-ui-table-row-selectable': selectable,
            'nuclide-ui-table-row-selected': isSelectedRow,
            'nuclide-ui-table-row-alternate': alternateBackground !== false && i % 2 === 1,
            'nuclide-ui-table-collapsed-row': this.props.collapsable && !isSelectedRow
          }),
          key: i
        }, rowProps),
        renderedRow
      );
    });
    if (rows.length === 0) {
      const EmptyComponent = this.props.emptyComponent || DefaultEmptyComponent;
      body = _reactForAtom.React.createElement(
        'tr',
        null,
        _reactForAtom.React.createElement(
          'td',
          null,
          _reactForAtom.React.createElement(EmptyComponent, null)
        )
      );
    }
    const scrollableBodyStyle = {};
    if (maxBodyHeight != null) {
      scrollableBodyStyle.maxHeight = maxBodyHeight;
      scrollableBodyStyle.overflowY = 'auto';
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: className },
      _reactForAtom.React.createElement(
        'table',
        {
          className: 'nuclide-ui-table',
          ref: 'table' },
        _reactForAtom.React.createElement(
          'thead',
          { className: 'nuclide-ui-table-header' },
          _reactForAtom.React.createElement(
            'tr',
            null,
            header
          )
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { style: scrollableBodyStyle },
        _reactForAtom.React.createElement(
          'table',
          { className: 'nuclide-ui-table nuclide-ui-table-body' },
          _reactForAtom.React.createElement(
            'tbody',
            null,
            body
          )
        )
      )
    );
  }
};