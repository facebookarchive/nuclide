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

import type {Props} from './ui/RootPanel';

import type {Store, AppState, Device, Process} from './types';
import React from 'react';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {RootPanel} from './ui/RootPanel';
import {Observable} from 'rxjs';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import * as Actions from './redux/Actions';
import {getProviders} from './providers';
import shallowEqual from 'shallowequal';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/devices';

export class DevicesPanelState {
  _store: Store;
  _deviceObs: Observable<Device[]>;
  _processesObs: Observable<Process[]>;

  constructor(store: Store) {
    this._store = store;
    // $FlowFixMe: Teach flow about Symbol.observable
    this._deviceObs = Observable.from(this._store)
      .distinctUntilChanged(
        (stateA, stateB) =>
          stateA.deviceType === stateB.deviceType &&
          stateA.host === stateB.host,
      )
      .switchMap(state => {
        if (state.deviceType === null) {
          return Observable.empty();
        }
        for (const fetcher of getProviders().deviceList) {
          if (fetcher.getType() === state.deviceType) {
            return fetcher
              .observe(state.host)
              .do(devices => this._store.dispatch(Actions.setDevices(devices)));
          }
        }
      });
    // $FlowFixMe: Teach flow about Symbol.observable
    this._processesObs = Observable.from(this._store)
      .distinctUntilChanged(
        (stateA, stateB) =>
          stateA.deviceType === stateB.deviceType &&
          stateA.host === stateB.host &&
          shallowEqual(stateA.device, stateB.device),
      )
      .switchMap(state => {
        if (state.device === null) {
          return Observable.empty();
        }
        const providers = Array.from(getProviders().deviceProcesses).filter(
          provider => provider.getType() === state.deviceType,
        );
        if (providers[0] != null) {
          return providers[0].observe(state.host, state.device.name);
        }
        return Observable.empty();
      })
      .do(processes => this._store.dispatch(Actions.setProcesses(processes)));
  }

  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth(): number {
    return 400;
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'right';
  }

  _appStateToProps(state: AppState): Props {
    const startFetchingDevices = () => {
      return this._deviceObs.subscribe();
    };
    const startFetchingProcesses = () => {
      return this._processesObs.subscribe();
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
      processes: state.processes,
      deviceTasks: state.deviceTasks,
      startFetchingDevices,
      startFetchingProcesses,
      setHost,
      setDeviceType,
      setDevice,
      killProcess: state.processKiller,
    };
  }

  getElement(): HTMLElement {
    const PreparedDevicePanel = bindObservableAsProps(
      // $FlowFixMe: Teach flow about Symbol.observable
      Observable.from(this._store)
        .distinctUntilChanged()
        .map(state => this._appStateToProps(state)),
      RootPanel,
    );

    return renderReactRoot(<PreparedDevicePanel />);
  }

  serialize(): {deserializer: string} {
    return {
      deserializer: 'nuclide.DevicePanelState',
    };
  }
}
