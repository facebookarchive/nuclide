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
import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import {DevicePanel} from './ui/DevicePanel';
import {Observable} from 'rxjs';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import * as Actions from './redux/Actions';

import type {Props} from './ui/DevicePanel';
import type {Store, AppState} from './types';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/devices';

export class DevicesPanelState {
  _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth(): number {
    return 300;
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'right';
  }

  _appStateToProps(state: AppState): Props {
    const refreshDevices = host => {
      this._store.dispatch(Actions.refreshDevices());
    };
    const setHost = host => {
      this._store.dispatch(Actions.setHost(host));
    };
    const setDeviceType = deviceType => {
      this._store.dispatch(Actions.setDeviceType(deviceType));
    };
    const setDevice = device => {
      this._store.dispatch(Actions.setDevice(device));
    };
    return {
      devices: state.devices,
      hosts: state.hosts,
      host: state.host,
      deviceTypes: state.deviceTypes,
      deviceType: state.deviceType,
      device: state.device,
      infoTables: state.infoTables,
      processTable: state.processTable,
      deviceActions: state.deviceActions,
      refreshDevices,
      setHost,
      setDeviceType,
      setDevice,
    };
  }

  getElement(): HTMLElement {
    const PreparedDevicePanel = bindObservableAsProps(
      // $FlowFixMe: Teach flow about Symbol.observable
      Observable.from(this._store)
        .distinctUntilChanged()
        .map(state => this._appStateToProps(state)),
      DevicePanel,
    );

    return renderReactRoot(<PreparedDevicePanel />);
  }

  serialize(): {deserializer: string} {
    return {
      deserializer: 'nuclide.DevicePanelState',
    };
  }
}
