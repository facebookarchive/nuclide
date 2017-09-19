/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* globals HTMLElement */

import invariant from 'assert';
import classnames from 'classnames';
import idx from 'idx';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {Observable} from 'rxjs';
import {Icon} from './Icon';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {ResizeObservable} from './observable-dom';

const DEFAULT_MIN_COLUMN_WIDTH = 40;

const DefaultEmptyComponent = () =>
  <div className="nuclide-ui-table-empty-message">Empty table</div>;

export type Column<T: Object> = {
  title: string,
  key: $Keys<T>,
  // Percentage. The `width`s of all columns must add up to 1.
  width?: number,
  // Optional React component for rendering cell contents.
  // The component receives the cell value via `props.data`.
  component?: React.ComponentType<any>,
  shouldRightAlign?: boolean,
  // A class to add to the cell. This will be added to both the header and body; you can
  // differentiate between them with `.nuclide-ui-table-header-cell` and
  // `.nuclide-ui-table-body-cell`.
  cellClassName?: string,
  // A minimum width (in pixels) for the column.
  minWidth?: number,
};
export type Row<T: Object> = {
  +className?: string,
  +data: T,
};
type WidthMap<T> = {
  [key: $Keys<T>]: number,
};
type Props<T> = {
  /**
   * Optional classname for the entire table.
   */
  className?: string,
  /**
   * Optional max-height for the body container.
   * Useful for making the table scrollable while keeping the header fixed.
   */
  maxBodyHeight?: string,
  columns: Array<Column<T>>,
  rows: Array<Row<T>>,
  /**
   * Whether to shade even and odd items differently. Default behavior is `true`.
   */
  alternateBackground?: number,
  /**
   * Whether column widths can be resized interactively via drag&drop. Default behavior is `true`.
   */
  resizable?: boolean,
  children?: React.Element<any>,
  /**
   * Whether columns can be sorted.
   * If specified, `onSort`, `sortedColumn`, and `sortDescending` must also be specified.
   */
  sortable?: boolean,
  onSort?: (sortedBy: $Keys<T>, sortDescending: boolean) => void,
  sortedColumn?: ?$Keys<T>,
  sortDescending?: boolean,
  /**
   * Whether items can be selected.
   * If specified, `onSelect` must also be specified.
   */
  selectable?: boolean,
  selectedIndex?: ?number,
  /**
   * Handler to be called upon selection. Called iff `selectable` is `true`.
   */
  onSelect?: (selectedItem: any, selectedIndex: number) => mixed,
  /**
   * Callback to be invoked before calling onSelect. Called iff `selectable` is `true`.
   * If this callback returns false, row selection is canceled.
   */
  onWillSelect?: (
    selectedItem: any,
    selectedIndex: number,
    event: SyntheticMouseEvent<>,
  ) => boolean,
  /**
   * Optional React Component to override the default message when zero rows are provided.
   * Useful for showing loading spinners and custom messages.
   */
  emptyComponent?: React.ComponentType<any>,
  /**
   * Whether a table row will be collapsed if its content is too large
   */
  collapsable?: boolean,
  /**
   * Whether there's a header title spanning all cells instead of the column titles.
   * It disables the 'sortable' prop.
   */
  headerTitle?: string,
};

type State<T> = {|
  columnWidths: ?WidthMap<T>,
|};

type ResizerLocation<T> = {
  leftColumnKey: $Keys<T>,
  rightColumnKey: $Keys<T>,
};

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
export class Table<T: Object> extends React.Component<Props<T>, State<T>> {
  _resizingDisposable: ?IDisposable; // Active while resizing.
  _disposables: UniversalDisposable;

  constructor(props: Props<T>) {
    super(props);
    this._resizingDisposable = null;
    this.state = {
      columnWidths: null,
    };
  }

  _handleResizerMouseDown(
    event: SyntheticMouseEvent<>,
    resizerLocation: ResizerLocation<T>,
  ): void {
    if (this._resizingDisposable != null) {
      this._stopResizing();
    }
    // Prevent browser from initiating drag events on accidentally selected elements.
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    // $FlowFixMe
    const tableWidth = ReactDOM.findDOMNode(
      this.refs.table,
    ).getBoundingClientRect().width;
    const startX = event.pageX;
    const startWidths = this.state.columnWidths;
    invariant(startWidths != null);
    this._resizingDisposable = new UniversalDisposable(
      Observable.fromEvent(document, 'mousemove').subscribe(evt => {
        this._handleResizerGlobalMouseMove(
          evt,
          startX,
          startWidths,
          resizerLocation,
          tableWidth,
        );
      }),
      Observable.fromEvent(document, 'mouseup').subscribe(() => {
        this._stopResizing();
      }),
    );
  }

  _stopResizing(): void {
    if (this._resizingDisposable == null) {
      return;
    }
    this._resizingDisposable.dispose();
    this._resizingDisposable = null;
  }

  _handleResizerGlobalMouseMove = (
    event: MouseEvent,
    startX: number,
    startWidths: WidthMap<T>,
    location: ResizerLocation<T>,
    tableWidth: number,
  ): void => {
    const pxToRatio = px => px / tableWidth;

    const delta = pxToRatio(event.pageX - startX);
    const {leftColumnKey, rightColumnKey} = location;

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
    const shrinkingColumn = this.props.columns.find(
      column => column.key === shrinkingColumnKey,
    );
    invariant(shrinkingColumn != null);
    const shrinkingColumnMinWidth = pxToRatio(
      shrinkingColumn.minWidth == null
        ? DEFAULT_MIN_COLUMN_WIDTH
        : shrinkingColumn.minWidth,
    );
    const nextShrinkingColumnWidth = Math.max(
      shrinkingColumnMinWidth,
      prevShrinkingColumnWidth - Math.abs(delta),
    );
    const actualChange = nextShrinkingColumnWidth - prevShrinkingColumnWidth;
    const nextGrowingColumnWidth = prevGrowingColumnWidth - actualChange;

    this.setState({
      columnWidths: {
        ...this.state.columnWidths,
        [shrinkingColumnKey]: nextShrinkingColumnWidth,
        [growingColumnKey]: nextGrowingColumnWidth,
      },
    });
  };

  componentDidMount(): void {
    const el = ReactDOM.findDOMNode(this);
    invariant(el instanceof HTMLElement);
    this._disposables = new UniversalDisposable(
      new ResizeObservable(el)
        .startWith((null: any))
        .map(() => el.offsetWidth)
        .filter(tableWidth => tableWidth > 0)
        .subscribe(tableWidth => {
          // Update the column widths to account for minimum widths. This logic could definitely be
          // improved. As it is now, if you resize the table to be very small and then make it large
          // again, the proportions from when it was at its smallest will be preserved. If no
          // columns have min widths, then this is what you want. But if a minimum width prevented
          // one or more of the columns from shrinking, you'll probably consider them too wide when
          // the table's expanded.
          const preferredColumnWidths =
            this.state.columnWidths ||
            getInitialPercentageWidths(this.props.columns);
          this.setState({
            columnWidths: ensureMinWidths(
              preferredColumnWidths,
              this._getMinWidths(),
              tableWidth,
              this.props.columns.map(c => c.key),
            ),
          });
        }),
      () => {
        this._stopResizing();
      },
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _getMinWidths(): WidthMap<T> {
    const minWidths = {};
    this.props.columns.forEach(column => {
      minWidths[column.key] = column.minWidth;
    });
    return minWidths;
  }

  _handleSortByColumn(sortedBy: $Keys<T>): void {
    const {onSort, sortDescending, sortedColumn} = this.props;
    if (onSort == null) {
      return;
    }
    onSort(
      sortedBy,
      sortDescending == null || sortedBy !== sortedColumn
        ? false
        : !sortDescending,
    );
  }

  _handleRowClick(selectedIndex: number, event: SyntheticMouseEvent<>): void {
    const {onSelect, onWillSelect, rows} = this.props;
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

  _renderEmptyCellContent(): React.Element<any> {
    return <div />;
  }

  render(): React.Node {
    return (
      <div className={this.props.className}>
        {this._renderContents()}
      </div>
    );
  }

  _renderContents(): React.Node {
    const {columnWidths} = this.state;
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
      sortDescending,
    } = this.props;
    const header =
      headerTitle != null
        ? <div className="nuclide-ui-table-header-cell nuclide-ui-table-full-header">
            {headerTitle}
          </div>
        : columns.map((column, i) => {
            const {title, key, shouldRightAlign, cellClassName} = column;
            const leftColumnKey = column.key;
            const rightColumnKey = idx(columns[i + 1], _ => _.key);
            let resizer;
            if (leftColumnKey != null && rightColumnKey != null) {
              resizer = (
                <div
                  className="nuclide-ui-table-header-resize-handle"
                  onMouseDown={event => {
                    this._handleResizerMouseDown(event, {
                      leftColumnKey,
                      rightColumnKey,
                    });
                  }}
                  onClick={(e: SyntheticMouseEvent<>) => {
                    // Prevent sortable column header click event from firing.
                    e.stopPropagation();
                  }}
                />
              );
            }
            const width = columnWidths[key];
            const optionalHeaderCellProps = {};
            if (width != null) {
              optionalHeaderCellProps.style = {width: `${width * 100}%`};
            }
            let sortIndicator;
            let titleOverlay = title;
            if (sortable) {
              optionalHeaderCellProps.onClick = () => {
                this._handleSortByColumn(key);
              };
              titleOverlay += ' – click to sort';
              if (sortedColumn === key) {
                sortIndicator = (
                  <span className="nuclide-ui-table-sort-indicator">
                    <Icon
                      icon={sortDescending ? 'triangle-down' : 'triangle-up'}
                    />
                  </span>
                );
              }
            }
            return (
              <div
                className={classnames(cellClassName, {
                  'nuclide-ui-table-cell-text-align-right': shouldRightAlign,
                  'nuclide-ui-table-header-cell': true,
                  'nuclide-ui-table-header-cell-sortable': sortable,
                })}
                title={titleOverlay}
                key={key}
                {...optionalHeaderCellProps}>
                {title}
                {sortIndicator}
                {resizer}
              </div>
            );
          });
    let body = rows.map((row, i) => {
      const {className: rowClassName, data} = row;
      const renderedRow = columns.map((column, j) => {
        const {
          key,
          cellClassName,
          component: Component,
          shouldRightAlign,
        } = column;
        let datum = data[key];
        if (Component != null) {
          datum = <Component data={datum} />;
        } else if (datum == null) {
          datum = this._renderEmptyCellContent();
        }
        const cellStyle = {};
        const width = columnWidths[key];
        if (width != null) {
          cellStyle.width = `${width * 100}%`;
        }
        return (
          <div
            className={classnames(cellClassName, {
              'nuclide-ui-table-body-cell': true,
              'nuclide-ui-table-cell-text-align-right': shouldRightAlign,
            })}
            key={j}
            style={cellStyle}
            title={typeof datum !== 'object' ? String(datum) : null}>
            {datum}
          </div>
        );
      });
      const rowProps = {};
      if (selectable) {
        rowProps.onClick = event => {
          this._handleRowClick(i, event);
        };
      }
      const isSelectedRow = selectedIndex != null && i === selectedIndex;
      return (
        <div
          className={classnames(rowClassName, {
            'nuclide-ui-table-row': true,
            'nuclide-ui-table-row-selectable': selectable,
            'nuclide-ui-table-row-selected': isSelectedRow,
            'nuclide-ui-table-row-alternate':
              alternateBackground !== false && i % 2 === 1,
            'nuclide-ui-table-collapsed-row':
              this.props.collapsable && !isSelectedRow,
          })}
          key={i}
          {...rowProps}>
          {renderedRow}
        </div>
      );
    });
    if (rows.length === 0) {
      const EmptyComponent = this.props.emptyComponent || DefaultEmptyComponent;
      body = <EmptyComponent />;
    }
    const scrollableBodyStyle = {};
    if (maxBodyHeight != null) {
      scrollableBodyStyle.maxHeight = maxBodyHeight;
      scrollableBodyStyle.overflowY = 'auto';
    }
    return [
      <div key="header" className="nuclide-ui-table" ref="table">
        <div className="nuclide-ui-table-header">
          {header}
        </div>
      </div>,
      <div key="body" style={scrollableBodyStyle}>
        <div
          className="nuclide-ui-table nuclide-ui-table-body native-key-bindings"
          tabIndex="-1">
          {body}
        </div>
      </div>,
    ];
  }
}

/**
 * Get the initial size of each column as a percentage of the total.
 */
function getInitialPercentageWidths<T: Object>(
  columns: Array<Column<T>>,
): WidthMap<T> {
  const columnWidthRatios = {};
  let assignedWidth = 0;
  const unresolvedColumns = [];
  columns.forEach(column => {
    const {key, width} = column;
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
function ensureMinWidths<T: Object>(
  preferredWidths: WidthMap<T>,
  minWidths: WidthMap<T>,
  tableWidth: number,
  columnOrder: Array<$Keys<T>>,
): WidthMap<T> {
  const adjusted = {};
  let remainingWidth = 1;
  columnOrder.forEach(columnName => {
    const minWidth = minWidths[columnName] || DEFAULT_MIN_COLUMN_WIDTH;
    const minWidthRatio = minWidth / tableWidth;
    const preferredWidth = preferredWidths[columnName];
    const width = Math.min(
      remainingWidth,
      Math.max(minWidthRatio, preferredWidth),
    );
    adjusted[columnName] = width;
    remainingWidth -= width;
  });
  return adjusted;
}
