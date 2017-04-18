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
import {PanelComponentScroller} from '../../../nuclide-ui/PanelComponentScroller';
import {Observable, Subscription} from 'rxjs';
import invariant from 'invariant';
import {Dropdown} from '../../../nuclide-ui/Dropdown';
import {DeviceTable} from './DeviceTable';

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {Device} from '../types';

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
  device: ?Device,
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
      .do(() => this.props.refreshDevices())
      .subscribe();
  }

  componentWillUnmount(): void {
    this._deviceFetcherSubscription.unsubscribe();
  }

  _createSelectorSection(): React.Element<any> {
    const hostOptions = this.props.hosts.map(host => ({value: host, label: host}));
    const typeOptions = this.props.deviceTypes.map(type => ({value: type, label: type}));
    typeOptions.splice(0, 0, {value: null, label: 'Select...'});
    return (
      <table>
        <tr>
          <td>
            <label className="inline-block">Connection:</label>
          </td>
          <td>
            <Dropdown
              className="inline-block"
              options={hostOptions}
              onChange={this.props.setHost}
              value={this.props.host}
            />
          </td>
        </tr>
        <tr>
          <td>
            <label className="inline-block">Device type:</label>
          </td>
          <td>
            <Dropdown
              className="inline-block"
              options={typeOptions}
              onChange={this.props.setDeviceType}
              value={this.props.deviceType}
            />
          </td>
        </tr>
      </table>
    );
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

  render(): React.Element<any> {
    return (
      <PanelComponentScroller>
        <div className="nuclide-device-panel-container">
          <div className="block">
            {this._createSelectorSection()}
          </div>
          <div className="block">
            {this._createDeviceTable()}
          </div>
        </div>
      </PanelComponentScroller>
    );
  }
}
