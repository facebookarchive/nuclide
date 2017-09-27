'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _observableDom;

function _load_observableDom() {
  return _observableDom = require('./observable-dom');
}

var _scrollIntoView;

function _load_scrollIntoView() {
  return _scrollIntoView = require('./scrollIntoView');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

/* globals HTMLElement */

const DEFAULT_MIN_COLUMN_WIDTH = 40;

const DefaultEmptyComponent = () => _react.createElement(
  'div',
  { className: 'nuclide-ui-table-empty-message' },
  'Empty table'
);

/**
 * Design concerns:
 *
 * 1. Because of how it's used throughout the codebase, this Table needs to do all of the folowing:
 *        * Fill the available width of its parent
 *        * Automatically be tall enough to accommodate its contents
 *        * Have a vertically scrollable body if its parent is too small to accommodate the contents
 * 2. We need to support min widths for columns. Resizing the window or one of the component's
 *    containers should not cause a column to dip below its min width.
 *
 * This ends up being a surprisingly constraining set of concerns!
 *
 *     * We must guarantee that the contents of the table do not define the container's size.
 *       Otherwise, this we would be unable to determine the "available area" without hiding the
 *       contents, measuring, and then showing the contents again. Likewise, we could get stuck in
 *       a loop where we set the contents' size, which triggers the resize observer, which causes
 *       us to remeasure the container size and adjust the contents, which triggers the resize
 *       observer...
 *     * We can't use CSS for min width. Resizing one column affects the width of another; if we
 *       make column A smaller, column B needs to get wider to fill the extra space. But using CSS
 *       for min-width means we wouldn't know the true size, and therefore how to adjust B
 *       appropriately.
 *
 * To address these, we define our columns using percentage widths. Unfortunately, this means that
 * our table may behave a little strangely when the available area is less than the sum of the
 * minimum widths of the columns. (Ideally, the table would scroll horizontally in this case.)
 */
class Table extends _react.Component {

  constructor(props) {
    super(props);

    this._handleResizerGlobalMouseMove = (event, startX, startWidths, location, tableWidth) => {
      const pxToRatio = px => px / tableWidth;

      const delta = pxToRatio(event.pageX - startX);
      const { leftColumnKey, rightColumnKey } = location;

      // Determine which column is shrinking and which is growing. This will allow us to apply the min
      // width limitations correctly.
      let shrinkingColumnKey;
      let growingColumnKey;
      if (delta < 0) {
        [shrinkingColumnKey, growingColumnKey] = [leftColumnKey, rightColumnKey];
      } else {
        [shrinkingColumnKey, growingColumnKey] = [rightColumnKey, leftColumnKey];
      }

      const prevShrinkingColumnWidth = startWidths[shrinkingColumnKey];
      const prevGrowingColumnWidth = startWidths[growingColumnKey];
      const shrinkingColumn = this.props.columns.find(column => column.key === shrinkingColumnKey);

      if (!(shrinkingColumn != null)) {
        throw new Error('Invariant violation: "shrinkingColumn != null"');
      }

      const shrinkingColumnMinWidth = pxToRatio(shrinkingColumn.minWidth == null ? DEFAULT_MIN_COLUMN_WIDTH : shrinkingColumn.minWidth);
      const nextShrinkingColumnWidth = Math.max(shrinkingColumnMinWidth, prevShrinkingColumnWidth - Math.abs(delta));
      const actualChange = nextShrinkingColumnWidth - prevShrinkingColumnWidth;
      const nextGrowingColumnWidth = prevGrowingColumnWidth - actualChange;

      this.setState({
        columnWidths: Object.assign({}, this.state.columnWidths, {
          [shrinkingColumnKey]: nextShrinkingColumnWidth,
          [growingColumnKey]: nextGrowingColumnWidth
        })
      });
    };

    this._resizingDisposable = null;
    this.state = {
      columnWidths: null,
      usingKeyboard: false
    };
  } // Active while resizing.


  _handleResizerMouseDown(event, resizerLocation) {
    if (this._resizingDisposable != null) {
      this._stopResizing();
    }
    // Prevent browser from initiating drag events on accidentally selected elements.
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    // $FlowFixMe
    const tableWidth = _reactDom.default.findDOMNode(this.refs.table).getBoundingClientRect().width;
    const startX = event.pageX;
    const startWidths = this.state.columnWidths;

    if (!(startWidths != null)) {
      throw new Error('Invariant violation: "startWidths != null"');
    }

    this._resizingDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousemove').subscribe(evt => {
      this._handleResizerGlobalMouseMove(evt, startX, startWidths, resizerLocation, tableWidth);
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mouseup').subscribe(() => {
      this._stopResizing();
    }));
  }

  _stopResizing() {
    if (this._resizingDisposable == null) {
      return;
    }
    this._resizingDisposable.dispose();
    this._resizingDisposable = null;
  }

  componentDidMount() {
    const el = _reactDom.default.findDOMNode(this);

    if (!(el instanceof HTMLElement)) {
      throw new Error('Invariant violation: "el instanceof HTMLElement"');
    }

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(new (_observableDom || _load_observableDom()).ResizeObservable(el).startWith(null).map(() => el.offsetWidth).filter(tableWidth => tableWidth > 0).subscribe(tableWidth => {
      // Update the column widths to account for minimum widths. This logic could definitely be
      // improved. As it is now, if you resize the table to be very small and then make it large
      // again, the proportions from when it was at its smallest will be preserved. If no
      // columns have min widths, then this is what you want. But if a minimum width prevented
      // one or more of the columns from shrinking, you'll probably consider them too wide when
      // the table's expanded.
      const preferredColumnWidths = this.state.columnWidths || getInitialPercentageWidths(this.props.columns);
      this.setState({
        columnWidths: ensureMinWidths(preferredColumnWidths, this._getMinWidths(), tableWidth, this.props.columns.map(c => c.key))
      });
    }), () => {
      this._stopResizing();
    }, atom.commands.add(el, {
      'core:move-up': event => {
        this.setState({ usingKeyboard: true });
        this._moveSelection(-1, event);
      },
      'core:move-down': event => {
        this.setState({ usingKeyboard: true });
        this._moveSelection(1, event);
      },
      'core:confirm': event => {
        this.setState({ usingKeyboard: true });
        const { rows, selectedIndex, onConfirm } = this.props;
        if (onConfirm == null || selectedIndex == null) {
          return;
        }
        const selectedRow = rows[selectedIndex];
        const selectedItem = selectedRow && selectedRow.data;
        if (selectedItem != null) {
          onConfirm(selectedItem, selectedIndex);
        }
      }
    }), () => {
      if (this._mouseMoveDisposable != null) {
        this._mouseMoveDisposable.dispose();
      }
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _getMinWidths() {
    const minWidths = {};
    this.props.columns.forEach(column => {
      minWidths[column.key] = column.minWidth;
    });
    return minWidths;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._tableBody != null && this.props.selectedIndex != null && this.props.selectedIndex !== prevProps.selectedIndex) {
      const selectedRow = this._tableBody.children[this.props.selectedIndex];
      if (selectedRow != null) {
        (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoViewIfNeeded)(selectedRow);
      }
    }
    if (this.state.usingKeyboard !== prevState.usingKeyboard) {
      if (this._mouseMoveDisposable != null) {
        this._mouseMoveDisposable.dispose();
      }
      if (this.state.usingKeyboard) {
        this._mouseMoveDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousemove').take(1).subscribe(() => {
          this.setState({ usingKeyboard: false });
        }));
      }
    }
  }

  focus() {
    if (this._tableBody == null) {
      return;
    }
    let el = document.activeElement;
    while (el != null) {
      if (el === this._tableBody) {
        // Already focused!
        return;
      }
      el = el.parentNode;
    }
    this._tableBody.focus();
  }

  _moveSelection(offset, event) {
    const { selectedIndex } = this.props;
    if (selectedIndex == null) {
      return;
    }
    const nextSelectedIndex = selectedIndex + offset;
    if (nextSelectedIndex < 0 || nextSelectedIndex >= this.props.rows.length || nextSelectedIndex === selectedIndex) {
      return;
    }
    this._selectRow({ index: nextSelectedIndex, event });
  }

  _selectRow(options) {
    const { index: selectedIndex, event, confirm } = options;
    const { onSelect, onWillSelect, rows } = this.props;
    if (onSelect == null) {
      return;
    }
    const selectedRow = rows[selectedIndex];
    const selectedItem = selectedRow.data;
    if (onWillSelect != null) {
      if (onWillSelect(selectedItem, selectedIndex, event) === false) {
        return;
      }
    }
    onSelect(selectedItem, selectedIndex, event);
    if (confirm && this.props.onConfirm != null) {
      this.props.onConfirm(selectedItem, selectedIndex);
    }
  }

  _handleSortByColumn(sortedBy) {
    const { onSort, sortDescending, sortedColumn } = this.props;
    if (onSort == null) {
      return;
    }
    onSort(sortedBy, sortDescending == null || sortedBy !== sortedColumn ? false : !sortDescending);
  }

  _renderEmptyCellContent() {
    return _react.createElement('div', null);
  }

  render() {
    return _react.createElement(
      'div',
      { className: this.props.className },
      this._renderContents()
    );
  }

  _renderContents() {
    const { columnWidths } = this.state;
    if (columnWidths == null) {
      // We don't have the table width yet so we can't render the columns.
      return null;
    }

    const {
      alternateBackground,
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
      var _ref;

      const { title, key, shouldRightAlign, cellClassName } = column;
      const leftColumnKey = column.key;
      const rightColumnKey = (_ref = columns[i + 1]) != null ? _ref.key : _ref;
      let resizer;
      if (leftColumnKey != null && rightColumnKey != null) {
        resizer = _react.createElement('div', {
          className: 'nuclide-ui-table-header-resize-handle',
          onMouseDown: event => {
            this._handleResizerMouseDown(event, {
              leftColumnKey,
              rightColumnKey
            });
          },
          onClick: e => {
            // Prevent sortable column header click event from firing.
            e.stopPropagation();
          }
        });
      }
      const width = columnWidths[key];
      const optionalHeaderCellProps = {};
      if (width != null) {
        optionalHeaderCellProps.style = { width: `${width * 100}%` };
      }
      let sortIndicator;
      let titleOverlay = title;
      if (sortable) {
        optionalHeaderCellProps.onClick = () => {
          this._handleSortByColumn(key);
        };
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
          className: (0, (_classnames || _load_classnames()).default)(cellClassName, {
            'nuclide-ui-table-cell-text-align-right': shouldRightAlign,
            'nuclide-ui-table-header-cell': true,
            'nuclide-ui-table-header-cell-sortable': sortable
          }),
          title: titleOverlay,
          key: key
        }, optionalHeaderCellProps),
        title,
        sortIndicator,
        resizer
      );
    });
    let body = rows.map((row, i) => {
      const { className: rowClassName, data } = row;
      const renderedRow = columns.map((column, j) => {
        const {
          key,
          cellClassName,
          component: Component,
          shouldRightAlign
        } = column;
        let datum = data[key];
        if (Component != null) {
          datum = _react.createElement(Component, { data: datum });
        } else if (datum == null) {
          datum = this._renderEmptyCellContent();
        }
        const cellStyle = {};
        const width = columnWidths[key];
        if (width != null) {
          cellStyle.width = `${width * 100}%`;
        }
        return _react.createElement(
          'div',
          {
            className: (0, (_classnames || _load_classnames()).default)(cellClassName, {
              'nuclide-ui-table-body-cell': true,
              'nuclide-ui-table-cell-text-align-right': shouldRightAlign
            }),
            key: j,
            style: cellStyle,
            title: typeof datum !== 'object' ? String(datum) : null },
          datum
        );
      });
      const rowProps = selectable ? {
        onClick: event => {
          this._selectRow({ index: i, event });
        },
        onDoubleClick: event => {
          this._selectRow({ index: i, event, confirm: true });
        }
      } : {};
      const isSelectedRow = selectedIndex != null && i === selectedIndex;
      return _react.createElement(
        'div',
        Object.assign({
          className: (0, (_classnames || _load_classnames()).default)(rowClassName, {
            'nuclide-ui-table-row': true,
            'nuclide-ui-table-row-selectable': selectable,
            'nuclide-ui-table-row-using-keyboard-nav': this.state.usingKeyboard,
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
    const bodyClassNames = (0, (_classnames || _load_classnames()).default)('nuclide-ui-table', 'nuclide-ui-table-body',
    // Using native-key-bindings prevents the up and down arrows from being captured.
    { 'native-key-bindings': !this.props.enableKeyboardNavigation });
    return [_react.createElement(
      'div',
      { key: 'header', className: 'nuclide-ui-table', ref: 'table' },
      _react.createElement(
        'div',
        { className: 'nuclide-ui-table-header' },
        header
      )
    ), _react.createElement(
      'div',
      { key: 'body', style: scrollableBodyStyle },
      _react.createElement(
        'div',
        {
          ref: el => {
            this._tableBody = el;
          },
          className: bodyClassNames,
          tabIndex: '-1' },
        body
      )
    )];
  }
}

exports.Table = Table; /**
                        * Get the initial size of each column as a percentage of the total.
                        */

function getInitialPercentageWidths(columns) {
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

/**
 * Convert percentage widths into actual pixel widths, taking into account minimum widths.
 */
function ensureMinWidths(preferredWidths, minWidths, tableWidth, columnOrder) {
  const adjusted = {};
  let remainingWidth = 1;
  columnOrder.forEach(columnName => {
    const minWidth = minWidths[columnName] || DEFAULT_MIN_COLUMN_WIDTH;
    const minWidthRatio = minWidth / tableWidth;
    const preferredWidth = preferredWidths[columnName];
    const width = Math.min(remainingWidth, Math.max(minWidthRatio, preferredWidth));
    adjusted[columnName] = width;
    remainingWidth -= width;
  });
  return adjusted;
}