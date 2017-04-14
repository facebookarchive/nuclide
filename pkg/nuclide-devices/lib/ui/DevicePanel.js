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
import {mapEqual, arrayEqual, mapFilter} from '../../../commons-node/collection';
import invariant from 'invariant';
import {Dropdown} from '../../../nuclide-ui/Dropdown';
import {DeviceTable} from './DeviceTable';

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {Device} from '../types';

type Props = {
  getDevices(host: NuclideUri): Promise<Map<string, Device[]>>,
  hosts: NuclideUri[],
};

type State = {
  devices: Map<string, Device[]>,
  selectedHost: NuclideUri,
  selectedDeviceType: ?string,
};

export class DevicePanel extends React.Component {
  props: Props;
  state: State;
  _deviceFetcherSubscription: Subscription;

  constructor(props: Props) {
    super(props);
    invariant(props.hosts.length > 0);
    this.state = {devices: new Map(), selectedHost: props.hosts[0], selectedDeviceType: null};
    this._deviceFetcherSubscription = new Subscription();
    (this: any)._handleHostDropdownChange = this._handleHostDropdownChange.bind(this);
    (this: any)._handleDeviceTypeDropdownChange = this._handleDeviceTypeDropdownChange.bind(this);
  }

  componentDidMount(): void {
    this._deviceFetcherSubscription = Observable.interval(3000)
      .startWith(0)
      .switchMap(() => this.props.getDevices(this.state.selectedHost))
      .distinctUntilChanged((previous, current) => {
        return mapEqual(previous, current, (a, b) => arrayEqual(a, b, (x, y) => x.name === y.name));
      }).subscribe(devices => this.setState({devices}));
  }

  componentWillUnmount(): void {
    this._deviceFetcherSubscription.unsubscribe();
  }

  _handleHostDropdownChange(selectedHost: NuclideUri): void {
    this.setState({selectedHost});
  }

  _handleDeviceTypeDropdownChange(selectedDeviceType: ?string): void {
    this.setState({selectedDeviceType});
  }

  _createSelectorSection(): React.Element<any> {
    const hostOptions = this.props.hosts.map(host => ({value: host, label: host}));
    const typeOptions = Array.from(this.state.devices.keys())
      .map(type => ({value: type, label: type}));
    if (typeOptions.length === 0) {
      typeOptions.push({value: null, label: 'No devices connected'});
    }
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
              onChange={this._handleHostDropdownChange}
              value={this.state.selectedHost}
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
              disabled={this.state.devices.size === 0}
              onChange={this._handleDeviceTypeDropdownChange}
              value={this.state.selectedDeviceType}
            />
          </td>
        </tr>
      </table>
    );
  }

  _createDeviceTable(): React.Element<any> {
    const selectedDeviceType = this.state.devices.size > 0 && this.state.selectedDeviceType == null
      ? this.state.devices.keys().next().value
      : this.state.selectedDeviceType;

    const devices = Array.from(
      mapFilter(
        this.state.devices,
        (type, _) => type === selectedDeviceType,
      ).values(),
    )[0] || [];

    return (
      <DeviceTable devices={devices} />
    );
  }

  render(): React.Element<any> {
    return (
      <PanelComponentScroller>
        <div style={{flexDirection: 'column', padding: '5px 5px 0px 5px', flex: '0 0 100%'}}>
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
