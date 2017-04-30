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
import {
  PanelComponentScroller,
} from '../../../nuclide-ui/PanelComponentScroller';
import {Observable, Subscription} from 'rxjs';
import invariant from 'invariant';
import {Selectors} from './Selectors';
import {DeviceTable} from './DeviceTable';
import {InfoTable} from './InfoTable';

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {Device, DeviceAction} from '../types';

export type Props = {
  refreshDevices: () => void,
  setHost: (host: NuclideUri) => void,
  setDeviceType: (deviceType: string) => void,
  setDevice: (device: ?Device) => void,
  hosts: NuclideUri[],
  devices: Device[],
  host: NuclideUri,
  deviceTypes: string[],
  deviceType: ?string,
  deviceActions: DeviceAction[],
  device: ?Device,
  infoTables: Map<string, Map<string, string>>,
};

export class DevicePanel extends React.Component {
  props: Props;
  _deviceFetcherSubscription: Subscription;

  constructor(props: Props) {
    super(props);
    invariant(props.hosts.length > 0);
    this._deviceFetcherSubscription = new Subscription();
  }

  componentDidMount(): void {
    this._deviceFetcherSubscription = Observable.interval(3000)
      .startWith(0)
      .subscribe(() => this.props.refreshDevices());
  }

  componentWillUnmount(): void {
    this._deviceFetcherSubscription.unsubscribe();
  }

  _createDeviceTable(): ?React.Element<any> {
    if (this.props.deviceType === null) {
      return null;
    }
    return (
      <DeviceTable
        devices={this.props.devices}
        device={this.props.device}
        setDevice={this.props.setDevice}
      />
    );
  }

  _createInfoTables(): React.Element<any>[] {
    return Array.from(
      this.props.infoTables.entries(),
    ).map(([title, infoTable]) => (
      <div className="block" key={title}>
        <InfoTable title={title} table={infoTable} />
      </div>
    ));
  }

  render(): React.Element<any> {
    return (
      <PanelComponentScroller>
        <div className="nuclide-device-panel-container">
          <div className="block">
            <Selectors
              deviceType={this.props.deviceType}
              deviceTypes={this.props.deviceTypes}
              hosts={this.props.hosts}
              host={this.props.host}
              setDeviceType={this.props.setDeviceType}
              setHost={this.props.setHost}
              deviceActions={this.props.deviceActions}
            />
          </div>
          <div className="block">
            {this._createDeviceTable()}
          </div>
          {this._createInfoTables()}
        </div>
      </PanelComponentScroller>
    );
  }
}
