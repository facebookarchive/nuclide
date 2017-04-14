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

import type {Device} from '../types';

type Props = {
  devices: Device[],
};

export class DeviceTable extends React.Component {
  props: Props;

  render(): React.Element<any> {
    if (this.props.devices.length === 0) {
      return <div />;
    }

    const rows = this.props.devices.map(device => ({data: {name: device.displayName}}));

    const columns = [
      {
        key: 'name',
        title: 'Device',
        width: 1.0,
      },
    ];

    return (
      <Table
        collapsable={false}
        columns={columns}
        fixedHeader={true}
        maxBodyHeight="99999px"
        rows={rows}
        selectable={true}
      />
    );
  }
}
