/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {Table} from '../../../nuclide-ui/Table';

type Props = {
  table: Map<string, string>,
  title: string,
};

export class InfoTable extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const rows = Array.from(this.props.table.entries())
      .map(([key, value]) => ({data: {property: key, value}}));
    const columns = [
      {
        key: 'property',
        title: 'Property',
      },
      {
        key: 'value',
        title: 'Value',
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
