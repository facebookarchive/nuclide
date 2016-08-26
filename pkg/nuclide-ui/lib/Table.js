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
} from 'react-for-atom';

// ColumnKey must be unique within the containing collection.
type ColumnKey = string;
type Column = {
  title: string,
  key: ColumnKey,
};
type Row = {
  [key: ColumnKey]: ?mixed;
};

type Props = {
  columns: Array<Column>,
  rows: Array<Row>,
  /**
   * Whether to shade even and odd items differently. Default behavior is `true`.
   */
  alternateBackground?: number,
  children?: React.Element<any>,
};

export class Table extends React.Component {
  props: Props;

  _renderEmptyCellContent(): React.Element<any> {
    return <div />;
  }

  render(): React.Element<any> {
    const {
      alternateBackground,
      columns,
      rows,
    } = this.props;
    const header = columns.map((column, i) => {
      const {
        title,
        key,
      } = column;
      return (
        <th
          className="nuclide-ui-table-header-cell"
          title={title}
          key={key}>
          {title}
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
        return (
          <td className="nuclide-ui-table-body-cell" key={j}>{datum}</td>
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
    return (
      <table
        className="nuclide-ui-table"
        ref="table">
        <thead className="nuclide-ui-table-header"><tr>{header}</tr></thead>
        <tbody>{body}</tbody>
      </table>
    );
  }
}
