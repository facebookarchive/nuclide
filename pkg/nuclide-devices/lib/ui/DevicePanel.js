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
import {arrayEqual} from '../../../commons-node/collection';
import invariant from 'invariant';

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {Device} from '../types';

type Props = {
  getDevices(host: NuclideUri): Promise<Device[]>,
  hosts: NuclideUri[],
};

type State = {
  devices: Device[],
  currentHost: NuclideUri,
};

export class DevicePanel extends React.Component {
  props: Props;
  state: State;
  _deviceFetcherSubscription: Subscription;

  constructor(props: Props) {
    super(props);
    invariant(props.hosts.length > 0);
    this.state = {devices: [], currentHost: props.hosts[0]};
    this._deviceFetcherSubscription = new Subscription();
  }

  componentDidMount(): void {
    this._deviceFetcherSubscription = Observable.interval(3000)
      .switchMap(() => this.props.getDevices(this.state.currentHost))
      .distinctUntilChanged((previous, current) => (
        arrayEqual(
          previous,
          current,
          (a, b) => a.name === b.name && a.type === b.type,
        )
      )).subscribe(devices => this.setState({devices}));
  }

  componentWillUnmount(): void {
    this._deviceFetcherSubscription.unsubscribe();
  }

  render(): React.Element<any> {
    return (
      <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
        <PanelComponentScroller>
          <div className="padded" style={{flex: 1, minWidth: 'min-content'}}>
            {this.state.devices.map(device => <span key={device.name}>{device.displayName}</span>)}
          </div>
        </PanelComponentScroller>
      </div>
    );
  }
}
