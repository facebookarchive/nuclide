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

import React from 'react';
import {Table} from '../../../nuclide-ui/Table';
import type {Process} from '../types';

type Props = {
  table: Array<Process>,
  title: string,
};

export class ProcessTable extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const rows = this.props.table.map(x => ({data: x}));
    const columns = [
      {
        key: 'pid',
        title: 'PID',
      },
      {
        key: 'user',
        title: 'User',
      },
      {
        key: 'name',
        title: 'Name',
      },
    ];
    const emptyComponent = () => <div className="padded">No information</div>;

    return (
      <div>
        <strong>{this.props.title}</strong>
        <Table
          collapsable={false}
          columns={columns}
          maxBodyHeight="99999px"
          emptyComponent={emptyComponent}
          rows={rows}
        />
      </div>
    );
  }
}
