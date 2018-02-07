'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = undefined;
exports._calculateColumnWidths = _calculateColumnWidths;
exports._calculatePreferredColumnWidths = _calculatePreferredColumnWidths;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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

const DEFAULT_MIN_COLUMN_WIDTH = 40; /**
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

const DefaultEmptyComponent = () => _react.createElement(
  'div',
  { className: 'nuclide-ui-table-empty-message' },
  'Empty table'
);
// Same shape; the separate type is just used for documentation--Flow doesn't recognize a
// difference.


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
    this._resizeStarts = new _rxjsBundlesRxMinJs.Subject();
    this.state = {
      preferredColumnWidths: getInitialPreferredColumnWidths(props.columns),
      resizeOffset: null,
      tableWidth: 0,
      usingKeyboard: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If the state changed, we need to re-render.
    if (!(0, (_shallowequal || _load_shallowequal()).default)(nextState, this.state)) {
      return true;
    }

    if (!(0, (_shallowequal || _load_shallowequal()).default)(nextProps, this.props, compareCheapProps)) {
      return true;
    }

    if (!(0, (_collection || _load_collection()).arrayEqual)(nextProps.columns, this.props.columns, (_shallowequal || _load_shallowequal()).default)) {
      return true;
    }

    if (!(0, (_collection || _load_collection()).arrayEqual)(nextProps.rows, this.props.rows)) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    const el = (0, (_nullthrows || _load_nullthrows()).default)(this._rootNode);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // Update the column widths when the table is resized.
    new (_observableDom || _load_observableDom()).ResizeObservable(el).startWith(null).map(() => el.offsetWidth).filter(tableWidth => tableWidth > 0).subscribe(tableWidth => {
      this.setState({ tableWidth });
    }), this._resizeStarts.switchMap(({ event: startEvent, resizerLocation }) => {
      const startX = startEvent.pageX;
      return _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousemove').takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mouseup')).map(event => ({
        deltaPx: event.pageX - startX,
        resizerLocation
      })).concat(_rxjsBundlesRxMinJs.Observable.of(null));
    }).subscribe(resizeOffset => {
      if (resizeOffset == null) {
        // Finalize the resize by updating the user's preferred column widths to account for
        // their action. Note that these preferences are only updated when columns are resized
        // (NOT when the table is). This is important so that, if the user resizes the table
        // such that a column is at its minimum width and then resizes the table back to its
        // orignal size, their original column widths are restored.
        const preferredColumnWidths = _calculatePreferredColumnWidths({
          currentWidths: this._calculateColumnWidths(),
          tableWidth: this.state.tableWidth,
          minWidths: getMinWidths(this.props.columns)
        });

        // Update the preferred distributions and end the resize.
        this.setState({ preferredColumnWidths, resizeOffset: null });
      } else {
        this.setState({ resizeOffset });
      }
    }), atom.commands.add(el, {
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

  componentWillReceiveProps(nextProps) {
    // Did the columns change? If so, we need to recalculate the widths.
    const currentColumns = this.props.columns;
    const nextColumns = nextProps.columns;
    if (nextColumns.length !== currentColumns.length ||
    // If the columns just changed order, we want to keep their widths.
    !(0, (_collection || _load_collection()).areSetsEqual)(new Set(currentColumns.map(column => column.key)), new Set(nextColumns.map(column => column.key)))) {
      this.setState({
        preferredColumnWidths: getInitialPreferredColumnWidths(nextColumns)
      });
    }
  }

  _moveSelection(offset, event) {
    const { selectedIndex } = this.props;
    if (selectedIndex == null) {
      return;
    }
    const nextSelectedIndex = Math.max(0, Math.min(this.props.rows.length - 1, selectedIndex + offset));
    if (nextSelectedIndex === selectedIndex) {
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

  // Just a bound version of the `_calculateColumnWidths` function for convenience.
  _calculateColumnWidths() {
    return _calculateColumnWidths({
      preferredWidths: this.state.preferredColumnWidths,
      minWidths: getMinWidths(this.props.columns),
      tableWidth: this.state.tableWidth,
      columnOrder: this.props.columns.map(column => column.key),
      resizeOffset: this.state.resizeOffset
    });
  }

  _renderEmptyCellContent() {
    return _react.createElement('div', null);
  }

  render() {
    return _react.createElement(
      'div',
      {
        className: this.props.className,
        ref: rootNode => this._rootNode = rootNode },
      this._renderContents()
    );
  }

  _renderContents() {
    if (this.state.tableWidth === 0) {
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

    const columnWidths = this._calculateColumnWidths();

    const header = headerTitle != null ? _react.createElement(
      'div',
      { className: 'nuclide-ui-table-header-cell nuclide-ui-table-full-header' },
      headerTitle
    ) : columns.map((column, i) => {
      const { title, key, shouldRightAlign, cellClassName } = column;
      let resizer;
      if (i < columns.length - 1) {
        resizer = _react.createElement('div', {
          className: 'nuclide-ui-table-header-resize-handle',
          onMouseDown: event => {
            this._resizeStarts.next({ event, resizerLocation: i });
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
          switch (event.detail) {
            // This (`event.detail === 0`) shouldn't happen normally but does when the click is
            // triggered by the integration test.
            case 0:
            case 1:
              this._selectRow({ index: i, event });
              return;
            case 2:
              // We need to check `event.detail` (instead of using `onDoubleClick`) because
              // (for some reason) `onDoubleClick` is only firing sporadically.
              // TODO: Figure out why. Repros in the diagnostic table with React 16.0.0 and
              // Atom 1.22.0-beta1 (Chrome 56.0.2924.87). This may be because we're swapping out
              // the component on the click so a different one is receiving the second?
              this._selectRow({ index: i, event, confirm: true });
              return;
          }
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
          'data-row-index': i,
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
    const bodyClassNames = (0, (_classnames || _load_classnames()).default)('nuclide-ui-table', 'nuclide-ui-table-body', {
      // Using native-key-bindings prevents the up and down arrows from being captured.
      'native-key-bindings': !this.props.enableKeyboardNavigation,
      // Only enable text selection if the rows aren't selectable as these two things conflict.
      // TODO: Add the ability to copy text that doesn't involve text selection within selections.
      'nuclide-ui-table-body-selectable-text': !this.props.selectable
    });
    return [_react.createElement(
      'div',
      { key: 'header', className: 'nuclide-ui-table' },
      _react.createElement(
        'div',
        { className: 'nuclide-ui-table-header' },
        header
      )
    ), _react.createElement(
      'div',
      {
        key: 'body',
        style: scrollableBodyStyle,
        onFocus: event => {
          if (this.props.onBodyFocus != null) {
            this.props.onBodyFocus(event);
          }
        },
        onBlur: event => {
          if (this.props.onBodyBlur != null) {
            this.props.onBodyBlur(event);
          }
        } },
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

function getInitialPreferredColumnWidths(columns) {
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

function getMinWidths(columns) {
  const minWidths = {};
  columns.forEach(column => {
    minWidths[column.key] = column.minWidth == null ? DEFAULT_MIN_COLUMN_WIDTH : column.minWidth;
  });
  return minWidths;
}

/**
 * Calculate widths, taking into account the preferred and minimum widths. Exported for testing
 * only.
 */
function _calculateColumnWidths(options) {
  const {
    preferredWidths,
    minWidths: minWidthsPx,
    tableWidth,
    columnOrder,
    resizeOffset: resizeOffset_
  } = options;
  const resizeOffset = resizeOffset_ || { deltaPx: 0, resizerLocation: 0 };
  const widthsPx = {};

  // Calculate the pixel widths of each column given its desired percentage width and minimum pixel
  // width.
  {
    // Figure out how many pixels each column wants, given the current available width.
    let widthToAllocate = tableWidth;
    let columnsToAllocate = columnOrder;
    while (columnsToAllocate.length > 0 && widthToAllocate > 0) {
      const remainingPct = columnsToAllocate.map(columnName => preferredWidths[columnName]).reduce((a, b) => a + b, 0);
      const desiredWidthsPx = (0, (_collection || _load_collection()).objectFromPairs)(columnsToAllocate.map(columnName => {
        const desiredPct = preferredWidths[columnName] / remainingPct;
        const desiredPx = Math.round(desiredPct * widthToAllocate);
        return [columnName, desiredPx];
      }));

      // Allocate widths for the columns who want less than their minimum width.
      let remainingPx = widthToAllocate;
      let remainingColumns = [];
      columnsToAllocate.forEach(columnName => {
        const desiredPx = desiredWidthsPx[columnName];
        const minPx = minWidthsPx[columnName];
        if (minPx >= desiredPx) {
          widthsPx[columnName] = Math.min(minPx, remainingPx);
          remainingPx -= widthsPx[columnName];
        } else {
          remainingColumns.push(columnName);
        }
      });

      // If we didn't need to truncate any of the columns, give them all their desired width.
      if (columnsToAllocate.length === remainingColumns.length) {
        Object.assign(widthsPx, desiredWidthsPx);
        remainingColumns = [];
      }

      // If we had to truncate any of the columns, that changes the calculations for how big the
      // remaining columns want to be, so make another pass.
      widthToAllocate = remainingPx;
      columnsToAllocate = remainingColumns;
    }
  }

  {
    // Adjust the column widths according to the resized column.
    const { deltaPx, resizerLocation } = resizeOffset;
    const leftColumns = columnOrder.slice(0, resizerLocation + 1);
    const rightColumns = columnOrder.slice(resizerLocation + 1);

    const [shrinkingColumns, growingColumn] = deltaPx < 0 ? [leftColumns.reverse(), rightColumns[0]] : [rightColumns, leftColumns[leftColumns.length - 1]];
    const targetChange = Math.abs(deltaPx);
    let cumulativeChange = 0;

    for (const columnName of shrinkingColumns) {
      const startWidth = widthsPx[columnName];
      const minWidth = minWidthsPx[columnName];
      const remainingWidth = targetChange - cumulativeChange;
      const newWidth = Math.max(minWidth, startWidth - remainingWidth);
      const change = Math.abs(startWidth - newWidth);
      cumulativeChange += change;
      widthsPx[columnName] = newWidth;
      if (cumulativeChange >= targetChange) {
        break;
      }
    }

    widthsPx[growingColumn] += cumulativeChange;
  }

  // Convert all the widths from pixels to percentages.
  const widths = {};
  {
    let remainingWidth = 1;
    columnOrder.forEach((columnName, i) => {
      const isLastColumn = i === columnOrder.length - 1;
      if (isLastColumn) {
        // Give the last column all the remaining to account for rounding issues.
        widths[columnName] = remainingWidth;
      } else {
        widths[columnName] = widthsPx[columnName] / tableWidth;
        remainingWidth -= widths[columnName];
      }
    });
  }

  return widths;
}

/**
 * Given the current (percentage) widths of each column, determines what user-preferred distribution
 * this represents. Exported for testing only.
 */
function _calculatePreferredColumnWidths(options) {
  const { currentWidths, tableWidth, minWidths: minWidthsPx } = options;
  const currentWidthsPx = (0, (_collection || _load_collection()).objectMapValues)(currentWidths, w => w * tableWidth);

  // If any column is at its minimum width, we take that to mean that the user wants the column
  // remain at its minimum if the table is resized (as opposed to maintaining the same percentage).
  // Accordingly, we make that column's preferred width 0.

  const preferredColumnWidths = {};

  // Figure out which columns are at their minimum widths.
  let remainingPx = 0; // The width that isn't accounted for after minWidth.
  const columnsNotAtMinimum = [];
  for (const [columnName, widthPx] of Object.entries(currentWidthsPx)) {
    if (!(typeof widthPx === 'number')) {
      throw new Error('Invariant violation: "typeof widthPx === \'number\'"');
    }

    const minWidthPx = minWidthsPx[columnName];
    if (Math.floor(widthPx) <= minWidthPx) {
      // Keep it at its min-width.
      preferredColumnWidths[columnName] = 0;
    } else {
      remainingPx += widthPx;
      columnsNotAtMinimum.push([columnName, widthPx]);
    }
  }

  // Now distribute the widths of the other columns.
  let remainingPct = 1;
  columnsNotAtMinimum.forEach(([columnName, width], index) => {
    const isLastColumn = index === columnsNotAtMinimum.length - 1;
    if (isLastColumn) {
      // We give the last column the remaining width just to be certain they all add up to 1.
      preferredColumnWidths[columnName] = remainingPct;
    } else {
      preferredColumnWidths[columnName] = width / remainingPx;
      remainingPct -= preferredColumnWidths[columnName];
    }
  });

  return preferredColumnWidths;
}

/**
 * An equality check for comparing Props using `shallowEqual()`. This only performs the cheap
 * checks and assumes that the rows and columns are equal. (They can be checked separatedly iff
 * necessary.)
 */
function compareCheapProps(a, b, key) {
  switch (key) {
    case undefined:
      // This is a magic way of telling `shallowEqual()` to use the default comparison for the
      // props objects (inspect its members).
      return undefined;
    case 'rows':
    case 'columns':
      // We'll check these later iff we need to since they're more expensive.
      return true;
    default:
      return a === b;
  }
}