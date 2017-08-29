'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _atom = require('atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DefaultEmptyComponent = () => _react.createElement(
  'div',
  { className: 'nuclide-ui-table-empty-message' },
  'Empty table'
);

// ColumnKey must be unique within the containing collection.
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

class Table extends _react.Component {

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
      const { key, width } = column;
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
    const { onSort, sortDescending, sortedColumn } = this.props;
    if (onSort == null) {
      return;
    }
    onSort(sortedBy, sortDescending == null || sortedBy !== sortedColumn ? false : !sortDescending);
  }

  _handleRowClick(selectedIndex, event) {
    const { onSelect, onWillSelect, rows } = this.props;
    if (onSelect == null) {
      return;
    }
    const selectedItem = rows[selectedIndex];
    if (onWillSelect != null) {
      if (onWillSelect(selectedItem, selectedIndex, event) === false) {
        return;
      }
    }
    onSelect(selectedItem.data, selectedIndex);
  }

  _renderEmptyCellContent() {
    return _react.createElement('div', null);
  }

  render() {
    const {
      alternateBackground,
      className,
      columns,
      headerTitle,
      maxBodyHeight,
      rows,
      selectable,
      selectedIndex,
      sortable,
      sortedColumn,
      sortDescending
    } = this.props;
    const header = headerTitle != null ? _react.createElement(
      'div',
      { className: 'nuclide-ui-table-header-cell nuclide-ui-table-full-header' },
      headerTitle
    ) : columns.map((column, i) => {
      const { title, key, shouldRightAlign } = column;
      const resizeHandle = i === columns.length - 1 ? null : _react.createElement('div', {
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
          width: width * 100 + '%'
        };
      }
      let sortIndicator;
      let titleOverlay = title;
      if (sortable) {
        optionalHeaderCellProps.onClick = this._handleSortByColumn.bind(this, key);
        titleOverlay += ' – click to sort';
        if (sortedColumn === key) {
          sortIndicator = _react.createElement(
            'span',
            { className: 'nuclide-ui-table-sort-indicator' },
            _react.createElement((_Icon || _load_Icon()).Icon, {
              icon: sortDescending ? 'triangle-down' : 'triangle-up'
            })
          );
        }
      }
      return _react.createElement(
        'div',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)({
            'nuclide-ui-table-cell-text-align-right': shouldRightAlign,
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
      const { className: rowClassName, data } = row;
      const renderedRow = columns.map((column, j) => {
        const { key, component: Component, shouldRightAlign } = column;
        let datum = data[key];
        if (Component != null) {
          datum = _react.createElement(Component, { data: datum });
        } else if (datum == null) {
          datum = this._renderEmptyCellContent();
        }
        const cellStyle = {};
        const width = this.state.columnWidthRatios[key];
        if (width != null) {
          cellStyle.width = width * 100 + '%';
        }
        return (
          // $FlowFixMe(>=0.53.0) Flow suppress
          _react.createElement(
            'div',
            {
              className: (0, (_classnames || _load_classnames()).default)({
                'nuclide-ui-table-body-cell': true,
                'nuclide-ui-table-cell-text-align-right': shouldRightAlign
              }),
              key: j,
              style: cellStyle,
              title: typeof datum !== 'object' ? String(datum) : null },
            datum
          )
        );
      });
      const rowProps = {};
      if (selectable) {
        rowProps.onClick = this._handleRowClick.bind(this, i);
      }
      const isSelectedRow = selectedIndex != null && i === selectedIndex;
      return _react.createElement(
        'div',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)(rowClassName, {
            'nuclide-ui-table-row': true,
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
      body = _react.createElement(EmptyComponent, null);
    }
    const scrollableBodyStyle = {};
    if (maxBodyHeight != null) {
      scrollableBodyStyle.maxHeight = maxBodyHeight;
      scrollableBodyStyle.overflowY = 'auto';
    }
    return _react.createElement(
      'div',
      { className: className },
      _react.createElement(
        'div',
        { className: 'nuclide-ui-table', ref: 'table' },
        _react.createElement(
          'div',
          { className: 'nuclide-ui-table-header' },
          header
        )
      ),
      _react.createElement(
        'div',
        { style: scrollableBodyStyle },
        _react.createElement(
          'div',
          {
            className: 'nuclide-ui-table nuclide-ui-table-body native-key-bindings',
            tabIndex: '-1' },
          body
        )
      )
    );
  }
}
exports.Table = Table;