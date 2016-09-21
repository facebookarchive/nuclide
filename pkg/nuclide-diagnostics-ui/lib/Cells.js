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
import {React} from 'react-for-atom';
import {Icon} from '../../nuclide-ui/lib/Icon';


type CellProps = {
  children?: mixed,
  onClick?: Function,
  sortable?: boolean,
  style?: Object,
  title?: string,
};

/*
 * Returns markup similar to that produced by fixed-data-table v0.6.0.
 */
export function Cell(props: CellProps): React.Element<any> {
  return (
    <div
      className={classnames({
        public_fixedDataTableCell_main: true,
        public_fixedDataTableCell_main_sortable: props.sortable,
      })}
      onClick={props.onClick}
      style={props.style}
      title={props.title}>
      {props.children}
    </div>
  );
}

export const SortDirections = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC',
});

export const ColumnKeys = Object.freeze({
  TYPE: 'TYPE',
  PROVIDER: 'PROVIDER',
  FILE: 'FILE',
  RANGE: 'RANGE',
  DESCRIPTION: 'DESCRIPTION',
});

type SortHeaderCellProps = {
  children?: mixed,
  columnKey: string,
  onSortChange: (columnKey: string, sortDirection: string) => void,
  sortDirection: string,
  style?: Object,
  title?: string,
};

/*
 * Returns a header cell as in fixed-data-table's SortExample.
 */
export class SortHeaderCell extends React.Component {
  props: SortHeaderCellProps;

  constructor(props: SortHeaderCellProps) {
    super(props);
    (this: any)._onSortChange = this._onSortChange.bind(this);
  }

  _onSortChange(e: SyntheticMouseEvent) {
    e.preventDefault();
    this.props.onSortChange(
      this.props.columnKey,
      this._reverseSortDirection(this.props.sortDirection),
    );
  }

  _reverseSortDirection(sortDirection: string): string {
    return sortDirection === SortDirections.DESC ? SortDirections.ASC : SortDirections.DESC;
  }

  render() {
    const {sortDirection, children, style} = this.props;
    const sortIcon = (
      <span>
        <Icon
          icon={sortDirection === SortDirections.DESC ? 'triangle-down' : 'triangle-up'}
          className="public_fixedDataTableCell_main_sortable_icon"
        />
      </span>
    );

    return (
      <Cell style={style} onClick={this._onSortChange} sortable={true}>
        {children} {sortDirection ? sortIcon : ''}
      </Cell>
    );
  }
}
