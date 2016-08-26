'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {Disposable} from 'atom';

// ColumnKey must be unique within the containing collection.
type ColumnKey = string;
type Column = {
  title: string,
  key: ColumnKey,
  // Percentage. The `width`s of all columns must add up to 1.
  width?: number,
};
type Row = {
  [key: ColumnKey]: ?mixed;
};
type WidthMap = {
  [key: ColumnKey]: number,
};
type Props = {
  /**
   * Optional classname for the entire table.
   */
   className?: string,
  /**
   * Optional max-height for the body container.
   * Useful for making the table scrollable while keeping the header fixed.
   */
  maxBodyHeight?: string,
  columns: Array<Column>,
  rows: Array<Row>,
  /**
   * Whether to shade even and odd items differently. Default behavior is `true`.
   */
  alternateBackground?: number,
  /**
   * Whether column widths can be resized interactively via drag&drop. Default behavior is `true`.
   */
  resizeable?: boolean,
  children?: React.Element<any>,
};
type State = {
  columnWidthRatios: WidthMap,
};

export class Table extends React.Component {
  props: Props;
  state: State;
  _globalEventsDisposable: ?Disposable;
  _resizeStartX: ?number;
  _tableWidth: ?number;
  _columnBeingResized: ?ColumnKey;

  constructor(props: Props) {
    super(props);
    this._globalEventsDisposable = null;
    this._resizeStartX = null;
    this._tableWidth = null;
    this._columnBeingResized = null;
    (this: any)._handleResizerGlobalMouseUp = this._handleResizerGlobalMouseUp.bind(this);
    (this: any)._handleResizerGlobalMouseMove = this._handleResizerGlobalMouseMove.bind(this);
    this.state = {
      columnWidthRatios: this._getInitialWidthsForColumns(this.props.columns),
    };
  }

  _getInitialWidthsForColumns(columns: Array<Column>): WidthMap {
    const columnWidthRatios = {};
    let assignedWidth = 0;
    const unresolvedColumns = [];
    columns.forEach(column => {
      const {
        key,
        width,
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
  _updateWidths(resizedColumn: ColumnKey, newColumnSize: number): boolean {
    const {columnWidthRatios} = this.state;
    const {columns} = this.props;
    const originalColumnSize = columnWidthRatios[resizedColumn];
    const columnAfterResizedColumn = columns[
      columns.findIndex(column => column.key === resizedColumn) + 1
    ].key;
    const followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
    const constrainedNewColumnSize =
      Math.max(0, Math.min(newColumnSize, followingColumnSize + originalColumnSize));
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
          columnWidthRatios[resizedColumn] - constrainedNewColumnSize + columnWidthRatios[key];
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

  _handleResizerMouseDown(key: ColumnKey, event: SyntheticMouseEvent): void {
    if (this._globalEventsDisposable != null) {
      this._unsubscribeFromGlobalEvents();
    }
    // Prevent browser from initiating drag events on accidentally selected elements.
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    // $FlowIssue https://github.com/facebook/flow/issues/770
    document.addEventListener('mousemove', this._handleResizerGlobalMouseMove);
    // $FlowIssue https://github.com/facebook/flow/issues/770
    document.addEventListener('mouseup', this._handleResizerGlobalMouseUp);
    this._resizeStartX = event.pageX;
    this._tableWidth = ReactDOM.findDOMNode(this.refs.table).getBoundingClientRect().width;
    this._columnBeingResized = key;
    this._globalEventsDisposable = new Disposable(() => {
      // $FlowIssue https://github.com/facebook/flow/issues/770
      document.removeEventListener('mousemove', this._handleResizerGlobalMouseMove);
      // $FlowIssue https://github.com/facebook/flow/issues/770
      document.removeEventListener('mouseup', this._handleResizerGlobalMouseUp);
      this._resizeStartX = null;
      this._tableWidth = null;
      this._columnBeingResized = null;
    });
  }

  _unsubscribeFromGlobalEvents(): void {
    if (this._globalEventsDisposable == null) {
      return;
    }
    this._globalEventsDisposable.dispose();
    this._globalEventsDisposable = null;
  }

  _handleResizerGlobalMouseUp(event: MouseEvent): void {
    this._unsubscribeFromGlobalEvents();
  }

  _handleResizerGlobalMouseMove(event: MouseEvent): void {
    if (
      this._resizeStartX == null ||
      this._tableWidth == null ||
      this._columnBeingResized == null
    ) {
      return;
    }
    const {pageX} = ((event: any): MouseEvent);
    const deltaX = pageX - this._resizeStartX;
    const currentColumnSize = this.state.columnWidthRatios[this._columnBeingResized];
    const didUpdate = this._updateWidths(
      this._columnBeingResized,
      (this._tableWidth * currentColumnSize + deltaX) / this._tableWidth,
    );
    if (didUpdate) {
      this._resizeStartX = pageX;
    }
  }

  _dispose(): void {
    this._unsubscribeFromGlobalEvents();
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  _renderEmptyCellContent(): React.Element<any> {
    return <div />;
  }

  render(): React.Element<any> {
    const {
      alternateBackground,
      className,
      columns,
      maxBodyHeight,
      rows,
    } = this.props;
    const header = columns.map((column, i) => {
      const {
        title,
        key,
      } = column;
      const resizeHandle = i === columns.length - 1
        ? null
        : <div
            className="nuclide-ui-table-header-resize-handle"
            onMouseDown={this._handleResizerMouseDown.bind(this, key)}
          />;
      const width = this.state.columnWidthRatios[key];
      const optionalHeaderCellProps = {};
      if (width != null) {
        optionalHeaderCellProps.style = {
          width: width + '%',
        };
      }
      return (
        <th
          className="nuclide-ui-table-header-cell"
          title={title}
          key={key}
          {...optionalHeaderCellProps}>
          {title}
          {resizeHandle}
        </th>
      );
    });
    const body = rows.map((row, i) => {
      const renderedRow = columns.map((column, j) => {
        const {
          key,
        } = column;
        let datum = row[key];
        if (datum == null) {
          datum = this._renderEmptyCellContent();
        }

        const cellStyle = {};
        if (i === 0) {
          const width = this.state.columnWidthRatios[key];
          if (width != null) {
            cellStyle.width = width + '%';
          }
        }
        return (
          <td
            className="nuclide-ui-table-body-cell"
            key={j}
            style={cellStyle}>
            {datum}
          </td>
        );
      });
      return (
        <tr
          className={classnames({
            'nuclide-ui-table-row-alternate': alternateBackground !== false && i % 2 === 1,
          })}
          key={i}>
          {renderedRow}
        </tr>
      );
    });
    const scrollableBodyStyle = {};
    if (maxBodyHeight != null) {
      scrollableBodyStyle.maxHeight = maxBodyHeight;
      scrollableBodyStyle.overflowY = 'auto';
    }
    return (
      <div className={className}>
        <table
          className="nuclide-ui-table"
          ref="table">
          <thead className="nuclide-ui-table-header"><tr>{header}</tr></thead>
        </table>
        <div style={scrollableBodyStyle}>
          <table className="nuclide-ui-table nuclide-ui-table-body">
            <tbody>{body}</tbody>
          </table>
        </div>
      </div>
    );
  }
}
