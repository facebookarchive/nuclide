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

import type {Device} from '../types';

import React from 'react';
import {Table} from '../../../nuclide-ui/Table';
import {Subscription} from 'rxjs';

type Props = {
  setDevice: (?Device) => void,
  startFetchingDevices: () => Subscription,
  devices: Device[],
  device: ?Device,
};

type State = {
  selectedDeviceIndex: ?number,
};

export class DeviceTable extends React.Component {
  props: Props;
  state: State;
  _emptyComponent: () => React.Element<any>;
  _devicesSubscription: ?Subscription = null;

  constructor(props: Props) {
    super(props);
    this.state = {selectedDeviceIndex: null};
    (this: any)._handleDeviceTableSelection = this._handleDeviceTableSelection.bind(
      this,
    );
    this._emptyComponent = () => (
      <div className="padded">No devices connected</div>
    );
  }

  componentDidMount(): void {
    this._devicesSubscription = this.props.startFetchingDevices();
  }

  componentWillUnmount(): void {
    if (this._devicesSubscription != null) {
      this._devicesSubscription.unsubscribe();
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    const nextDevice = nextProps.device;
    let selectedDeviceIndex = null;
    if (nextDevice != null) {
      selectedDeviceIndex = nextProps.devices.findIndex(
        device => device.name === nextDevice.name,
      );
    }
    if (selectedDeviceIndex !== this.state.selectedDeviceIndex) {
      this.setState({selectedDeviceIndex});
    }
  }

  render(): React.Element<any> {
    const rows = this.props.devices.map(device => ({
      data: {name: device.displayName},
    }));
    const columns = [
      {
        key: 'name',
        title: 'Devices',
        width: 1.0,
      },
    ];

    return (
      <Table
        collapsable={false}
        columns={columns}
        fixedHeader={true}
        maxBodyHeight="99999px"
        emptyComponent={this._emptyComponent}
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
