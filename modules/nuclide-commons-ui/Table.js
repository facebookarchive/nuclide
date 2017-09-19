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

import classnames from 'classnames';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {Observable} from 'rxjs';
import {Icon} from './Icon';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

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
type State<T> = {
  columnWidthRatios: WidthMap<T>,
};

export class Table<T: Object> extends React.Component<Props<T>, State<T>> {
  _resizingDisposable: ?IDisposable; // Active while resizing.
  _resizeStartX: ?number;
  _tableWidth: ?number;
  _columnBeingResized: ?$Keys<T>;
  _disposables: UniversalDisposable;

  constructor(props: Props<T>) {
    super(props);
    this._resizingDisposable = null;
    this._resizeStartX = null;
    this._tableWidth = null;
    this._columnBeingResized = null;
    this.state = {
      columnWidthRatios: getInitialPercentageWidths(this.props.columns),
    };
    this._disposables = new UniversalDisposable(() => {
      this._stopResizing();
    });
  }

  /* Applies sizing constraints, and returns whether the column width actually changed. */
  _updateWidths(resizedColumn: $Keys<T>, newColumnSize: number): boolean {
    const {columnWidthRatios} = this.state;
    const {columns} = this.props;
    const originalColumnSize = columnWidthRatios[resizedColumn];
    const columnAfterResizedColumn =
      columns[columns.findIndex(column => column.key === resizedColumn) + 1]
        .key;
    const followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
    const constrainedNewColumnSize = Math.max(
      0,
      Math.min(newColumnSize, followingColumnSize + originalColumnSize),
    );
    if (Math.abs(newColumnSize - constrainedNewColumnSize) > Number.EPSILON) {
      return false;
    }
    const updatedColumnWidths = {};
    columns.forEach(column => {
      const {key} = column;
      let width;
      if (column.key === resizedColumn) {
        width = constrainedNewColumnSize;
      } else if (column.key === columnAfterResizedColumn) {
        width =
          columnWidthRatios[resizedColumn] -
          constrainedNewColumnSize +
          columnWidthRatios[key];
      } else {
        width = columnWidthRatios[key];
      }
      updatedColumnWidths[key] = width;
    });
    this.setState({
      columnWidthRatios: updatedColumnWidths,
    });
    return true;
  }

  _handleResizerMouseDown(key: $Keys<T>, event: SyntheticMouseEvent<>): void {
    if (this._resizingDisposable != null) {
      this._stopResizing();
    }
    // Prevent browser from initiating drag events on accidentally selected elements.
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    this._resizeStartX = event.pageX;
    // $FlowFixMe
    this._tableWidth = ReactDOM.findDOMNode(
      this.refs.table,
    ).getBoundingClientRect().width;
    this._columnBeingResized = key;
    this._resizingDisposable = new UniversalDisposable(
      Observable.fromEvent(document, 'mousemove').subscribe(
        this._handleResizerGlobalMouseMove,
      ),
      Observable.fromEvent(document, 'mouseup').subscribe(() => {
        this._stopResizing();
      }),
      () => {
        this._resizeStartX = null;
        this._tableWidth = null;
        this._columnBeingResized = null;
      },
    );
  }

  _stopResizing(): void {
    if (this._resizingDisposable == null) {
      return;
    }
    this._resizingDisposable.dispose();
    this._resizingDisposable = null;
  }

  _handleResizerGlobalMouseMove = (event: MouseEvent): void => {
    if (
      this._resizeStartX == null ||
      this._tableWidth == null ||
      this._columnBeingResized == null
    ) {
      return;
    }
    const {pageX} = ((event: any): MouseEvent);
    const deltaX = pageX - this._resizeStartX;
    const currentColumnSize = this.state.columnWidthRatios[
      this._columnBeingResized
    ];
    const didUpdate = this._updateWidths(
      this._columnBeingResized,
      (this._tableWidth * currentColumnSize + deltaX) / this._tableWidth,
    );
    if (didUpdate) {
      this._resizeStartX = pageX;
    }
  };

  componentWillUnmount(): void {
    this._disposables.dispose();
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
      sortDescending,
    } = this.props;
    const header =
      headerTitle != null
        ? <div className="nuclide-ui-table-header-cell nuclide-ui-table-full-header">
            {headerTitle}
          </div>
        : columns.map((column, i) => {
            const {title, key, shouldRightAlign, cellClassName} = column;
            const resizeHandle =
              i === columns.length - 1
                ? null
                : <div
                    className="nuclide-ui-table-header-resize-handle"
                    onMouseDown={event => {
                      this._handleResizerMouseDown(key, event);
                    }}
                    onClick={(e: SyntheticMouseEvent<>) => {
                      // Prevent sortable column header click event from firing.
                      e.stopPropagation();
                    }}
                  />;
            const width = this.state.columnWidthRatios[key];
            const optionalHeaderCellProps = {};
            if (width != null) {
              optionalHeaderCellProps.style = {
                width: width * 100 + '%',
              };
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
                {resizeHandle}
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
        const width = this.state.columnWidthRatios[key];
        if (width != null) {
          cellStyle.width = width * 100 + '%';
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
    return (
      <div className={className}>
        <div className="nuclide-ui-table" ref="table">
          <div className="nuclide-ui-table-header">
            {header}
          </div>
        </div>
        <div style={scrollableBodyStyle}>
          <div
            className="nuclide-ui-table nuclide-ui-table-body native-key-bindings"
            tabIndex="-1">
            {body}
          </div>
        </div>
      </div>
    );
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
