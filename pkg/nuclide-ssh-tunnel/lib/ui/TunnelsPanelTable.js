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
import type {OpenTunnel, Tunnel} from '../types';

import {shortenHostname} from '../../../nuclide-socket-rpc/lib/Tunnel';
import TunnelCloseButton from './TunnelCloseButton';
import {Table} from 'nuclide-commons-ui/Table';
import * as React from 'react';

type Props = {
  tunnels: Array<[Tunnel, OpenTunnel]>,
  closeTunnel: (tunnel: Tunnel) => void,
};

export class TunnelsPanelTable extends React.Component<Props> {
  render(): React.Node {
    const columns = [
      {
        title: 'Description',
        key: 'description',
      },
      {
        title: 'From',
        key: 'from',
      },
      {
        title: 'To',
        key: 'to',
      },
      {
        title: 'Status',
        key: 'status',
      },
      {
        title: '',
        key: 'close',
        width: 0,
        minWidth: 35,
      },
    ];
    const rows = this.props.tunnels.map(([tunnel, openTunnel]) => {
      const {from, to} = tunnel;
      return {
        className: 'nuclide-ssh-tunnels-table-row',
        data: {
          description: tunnel.description,
          from: `${shortenHostname(from.host)}:${from.port}`,
          to: `${shortenHostname(to.host)}:${to.port}`,
          status: openTunnel.state,
          close: (
            <TunnelCloseButton
              tunnel={tunnel}
              closeTunnel={this.props.closeTunnel}
            />
          ),
        },
      };
    });
    return (
      <Table
        emptyComponent={() => (
          <div className="nuclide-ssh-tunnels-table-empty-message">
            No SSH tunnels are open.
          </div>
        )}
        rows={rows}
        columns={columns}
        selectable={true}
      />
    );
  }
}
