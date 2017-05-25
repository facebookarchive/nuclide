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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Device, Process, ProcessTask} from '../types';
import type {Expected} from '../../../nuclide-expected';

import {DeviceTask} from '../DeviceTask';
import React from 'react';
import {
  PanelComponentScroller,
} from 'nuclide-commons-ui/PanelComponentScroller';
import {Subscription} from 'rxjs';
import invariant from 'invariant';
import {Selectors} from './Selectors';
import {DeviceTable} from './DeviceTable';
import {DevicePanel} from './DevicePanel';

export type Props = {|
  setHost: (host: NuclideUri) => void,
  setDeviceType: (deviceType: string) => void,
  setDevice: (device: ?Device) => void,
  startFetchingDevices: () => Subscription,
  startFetchingProcesses: () => Subscription,
  processTasks: ProcessTask[],
  hosts: NuclideUri[],
  devices: Expected<Device[]>,
  host: NuclideUri,
  deviceTypes: string[],
  deviceType: ?string,
  deviceTasks: DeviceTask[],
  device: ?Device,
  infoTables: Map<string, Map<string, string>>,
  processes: Process[],
  isDeviceConnected: boolean,
|};

export class RootPanel extends React.Component {
  props: Props;
  _devicesSubscription: ?Subscription = null;

  constructor(props: Props) {
    super(props);
    invariant(props.hosts.length > 0);
    (this: any)._goToRootPanel = this._goToRootPanel.bind(this);
  }

  componentDidMount(): void {
    this._devicesSubscription = this.props.startFetchingDevices();
  }

  componentWillUnmount(): void {
    if (this._devicesSubscription != null) {
      this._devicesSubscription.unsubscribe();
    }
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

  _goToRootPanel(): void {
    this.props.setDevice(null);
  }

  _getInnerPanel(): React.Element<any> {
    if (this.props.device != null) {
      return (
        <div className="block">
          <DevicePanel
            infoTables={this.props.infoTables}
            processes={this.props.processes}
            processTasks={this.props.processTasks}
            deviceTasks={this.props.deviceTasks}
            goToRootPanel={this._goToRootPanel}
            startFetchingProcesses={this.props.startFetchingProcesses}
            isDeviceConnected={this.props.isDeviceConnected}
          />
        </div>
      );
    }
    return (
      <div>
        <div className="block">
          <Selectors
            deviceType={this.props.deviceType}
            deviceTypes={this.props.deviceTypes}
            hosts={this.props.hosts}
            host={this.props.host}
            setDeviceType={this.props.setDeviceType}
            setHost={this.props.setHost}
          />
        </div>
        <div className="block">
          {this._createDeviceTable()}
        </div>
      </div>
    );
  }

  render(): React.Element<any> {
    return (
      <PanelComponentScroller>
        <div className="nuclide-device-panel-container">
          {this._getInnerPanel()}
        </div>
      </PanelComponentScroller>
    );
  }
}
