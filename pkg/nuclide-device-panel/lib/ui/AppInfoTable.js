/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {AppInfoRow} from '../types';

import * as React from 'react';
import {Table} from 'nuclide-commons-ui/Table';
import {AppInfoValueCell} from './AppInfoValueCell';

type Props = {
  title: string,
  rows: Array<AppInfoRow>,
};

export class AppInfoTable extends React.PureComponent<Props> {
  render(): React.Node {
    const rows = this.props.rows.map(row => ({
      data: {property: row.name, rowData: row},
    }));
    const columns = [
      {
        key: 'property',
        title: 'Property',
        width: 0.4,
      },
      {
        component: AppInfoValueCell,
        key: 'rowData',
        title: 'Value',
        width: 0.6,
      },
    ];
    const emptyComponent = () => <div className="padded">No information</div>;

    return (
      <div>
        <Table
          collapsable={false}
          columns={columns}
          maxBodyHeight="99999px"
          emptyComponent={emptyComponent}
          rows={rows}
          headerTitle={this.props.title}
          enableKeyboardNavigation={true}
        />
      </div>
    );
  }
}
