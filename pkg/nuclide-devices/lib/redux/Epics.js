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

import {Observable} from 'rxjs';
import * as Actions from './Actions';
import invariant from 'invariant';
import {arrayFlatten, arrayCompact} from '../../../commons-node/collection';
import {
  getDeviceListProviders,
  getDeviceInfoProviders,
  getDeviceProcessesProviders,
  getDeviceActionsProviders,
} from '../providers';

import type {ActionsObservable} from '../../../commons-node/redux-observable';
import type {Action, Store, AppState, DeviceAction, Process} from '../types';

export function setDevicesEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.REFRESH_DEVICES).switchMap(action => {
    invariant(action.type === Actions.REFRESH_DEVICES);
    const state = store.getState();
    for (const fetcher of getDeviceListProviders()) {
      if (fetcher.getType() === state.deviceType) {
        return Observable.fromPromise(
          fetcher.fetch(state.host),
        ).switchMap(devices => Observable.of(Actions.setDevices(devices)));
      }
    }
    return Observable.empty();
  });
}

export function setDeviceEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_DEVICE).switchMap(action => {
    invariant(action.type === Actions.SET_DEVICE);
    const state = store.getState();
    return Observable.merge(
      Observable.fromPromise(getInfoTables(state)).switchMap(infoTables =>
        Observable.of(Actions.setInfoTables(infoTables)),
      ),
      Observable.fromPromise(getProcessTable(state)).switchMap(processTable =>
        Observable.of(Actions.setProcessTable(processTable)),
      ),
      Observable.fromPromise(getDeviceActions(state)).switchMap(deviceActions =>
        Observable.of(Actions.setDeviceActions(deviceActions)),
      ),
    );
  });
}

async function getInfoTables(
  state: AppState,
): Promise<Map<string, Map<string, string>>> {
  const device = state.device;
  if (device == null) {
    return new Map();
  }
  const sortedProviders = Array.from(getDeviceInfoProviders())
    .filter(provider => provider.getType() === state.deviceType)
    .sort((a, b) => {
      const pa = a.getPriority === undefined ? -1 : a.getPriority();
      const pb = b.getPriority === undefined ? -1 : b.getPriority();
      return pb - pa;
    });
  const infoTables = await Promise.all(
    sortedProviders.map(async provider => {
      if (!await provider.isSupported(state.host)) {
        return null;
      }
      return [
        provider.getTitle(),
        await provider.fetch(state.host, device.name),
      ];
    }),
  );
  return new Map(arrayCompact(infoTables));
}

async function getProcessTable(state: AppState): Promise<Array<Process>> {
  const device = state.device;
  if (device == null) {
    return [];
  }
  const providers = Array.from(getDeviceProcessesProviders()).filter(
    provider => provider.getType() === state.deviceType,
  );
  if (providers[0]) {
    return providers[0].fetch(state.host, device.name);
  }
  return [];
}

async function getDeviceActions(state: AppState): Promise<DeviceAction[]> {
  const device = state.device;
  if (device == null) {
    return [];
  }
  const actions = await Promise.all(
    Array.from(getDeviceActionsProviders())
      .filter(provider => provider.getType() === state.deviceType)
      .map(async provider => {
        if (!await provider.isSupported(state.host)) {
          return null;
        }
        return provider.getActions(state.host, device.name);
      }),
  );
  return arrayFlatten(arrayCompact(actions)).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
