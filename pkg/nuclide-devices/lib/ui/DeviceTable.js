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
  device: ?Device,
  setDevice: (?Device) => void,
};

type State = {
  selectedDeviceIndex: ?number,
};

export class DeviceTable extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {selectedDeviceIndex: null};
    (this: any)._handleDeviceTableSelection = this._handleDeviceTableSelection.bind(this);
  }

  componentWillReceiveProps(nextProps: Props): void {
    const nextDevice = nextProps.device;
    let selectedDeviceIndex = null;
    if (nextDevice != null) {
      selectedDeviceIndex = nextProps.devices.findIndex(device => device.name === nextDevice.name);
    }
    if (selectedDeviceIndex !== this.state.selectedDeviceIndex) {
      this.setState({selectedDeviceIndex});
    }
  }

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
        selectable={true}
        selectedIndex={this.state.selectedDeviceIndex}
        onSelect={this._handleDeviceTableSelection}
        rows={rows}
      />
    );
  }

  _handleDeviceTableSelection(item: any, selectedDeviceIndex: number): void {
    this.setState(
      {selectedDeviceIndex},
      this.props.setDevice(this.props.devices[selectedDeviceIndex]),
    );
  }
}
