'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _atom = require('atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DefaultEmptyComponent = () => _react.default.createElement(
  'div',
  { className: 'nuclide-ui-table-empty-message' },
  'Empty table'
);

// ColumnKey must be unique within the containing collection.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Table extends _react.default.Component {

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
      const {
        key,
        width
      } = column;
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
    const { columnWidthRatios } = this.state;
    const { columns } = this.props;
    const originalColumnSize = columnWidthRatios[resizedColumn];
    const columnAfterResizedColumn = columns[columns.findIndex(column => column.key === resizedColumn) + 1].key;
    const followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
    const constrainedNewColumnSize = Math.max(0, Math.min(newColumnSize, followingColumnSize + originalColumnSize));
    if (Math.abs(newColumnSize - constrainedNewColumnSize) > Number.EPSILON) {
      return false;
    }
    const updatedColumnWidths = {};
    columns.forEach(column => {
      const { key } = column;
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
    // $FlowFixMe
    this._tableWidth = _reactDom.default.findDOMNode(this.refs.table).getBoundingClientRect().width;
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
    const { pageX } = event;
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
    const {
      onSort,
      sortDescending,
      sortedColumn
    } = this.props;
    if (onSort == null) {
      return;
    }
    onSort(sortedBy, sortDescending == null || sortedBy !== sortedColumn ? false : !sortDescending);
  }

  _handleRowClick(selectedIndex, event) {
    const {
      onSelect,
      rows
    } = this.props;
    if (onSelect == null) {
      return;
    }
    const selectedItem = rows[selectedIndex];
    onSelect(selectedItem.data, selectedIndex);
  }

  _renderEmptyCellContent() {
    return _react.default.createElement('div', null);
  }

  render() {
    const {
      alternateBackground,
      className,
      columns,
      maxBodyHeight,
      rows,
      selectable,
      selectedIndex,
      sortable,
      sortedColumn,
      sortDescending
    } = this.props;
    const header = columns.map((column, i) => {
      const {
        title,
        key
      } = column;
      const resizeHandle = i === columns.length - 1 ? null : _react.default.createElement('div', {
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
          sortIndicator = _react.default.createElement(
            'span',
            null,
            ' ',
            _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: sortDescending ? 'triangle-down' : 'triangle-up' })
          );
        }
      }
      return _react.default.createElement(
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
      const {
        className: rowClassName,
        data
      } = row;
      const renderedRow = columns.map((column, j) => {
        const {
          key,
          component: Component
        } = column;
        let datum = data[key];
        if (Component != null) {
          datum = _react.default.createElement(Component, { data: datum });
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
        return _react.default.createElement(
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
      return _react.default.createElement(
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
      body = _react.default.createElement(
        'tr',
        null,
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement(EmptyComponent, null)
        )
      );
    }
    const scrollableBodyStyle = {};
    if (maxBodyHeight != null) {
      scrollableBodyStyle.maxHeight = maxBodyHeight;
      scrollableBodyStyle.overflowY = 'auto';
    }
    return _react.default.createElement(
      'div',
      { className: className },
      _react.default.createElement(
        'table',
        {
          className: 'nuclide-ui-table',
          ref: 'table' },
        _react.default.createElement(
          'thead',
          { className: 'nuclide-ui-table-header' },
          _react.default.createElement(
            'tr',
            null,
            header
          )
        )
      ),
      _react.default.createElement(
        'div',
        { style: scrollableBodyStyle },
        _react.default.createElement(
          'table',
          {
            className: 'nuclide-ui-table nuclide-ui-table-body native-key-bindings',
            tabIndex: '-1' },
          _react.default.createElement(
            'tbody',
            null,
            body
          )
        )
      )
    );
  }
}
exports.Table = Table;