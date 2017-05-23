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

import type {Tunnel} from '../types';

import {Table} from 'nuclide-commons-ui/Table';
import React from 'react';

type Props = {
  tunnels: Array<Tunnel>,
};

export class TunnelsPanelTable extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const columns = [
      {
        title: 'From',
        key: 'from',
      },
      {
        title: 'To',
        key: 'to',
      },
    ];
    const rows = this.props.tunnels.map(tunnel => ({
      className: 'nuclide-ssh-tunnels-table-row',
      data: {
        from: `${tunnel.from.host}:${tunnel.from.port}`,
        to: `${tunnel.to.host}:${tunnel.to.port}`,
      },
    }));
    return (
      <Table
        emptyComponent={() => (
          <div className="nuclide-ssh-tunnels-table-empty-message">
            No SSH tunnels are open.
          </div>
        )}
        className="nuclide-ssh-tunnels-table"
        rows={rows}
        columns={columns}
        selectable={true}
      />
    );
  }
}
