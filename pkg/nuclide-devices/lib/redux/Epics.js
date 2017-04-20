/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {Observable} from 'rxjs';
import * as Actions from './Actions';
import invariant from 'invariant';

import type {ActionsObservable} from '../../../commons-node/redux-observable';
import type {Action, Store, AppState} from '../types';

export function setDevicesEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.REFRESH_DEVICES)
    .switchMap(action => {
      invariant(action.type === Actions.REFRESH_DEVICES);
      const state = store.getState();
      for (const fetcher of state.deviceFetchers) {
        if (fetcher.getType() === state.deviceType) {
          return Observable.fromPromise(fetcher.fetch(state.host))
          .switchMap(devices => Observable.of(Actions.setDevices(devices)));
        }
      }
      return Observable.empty();
    });
}

export function setDeviceEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_DEVICE)
    .switchMap(action => {
      invariant(action.type === Actions.SET_DEVICE);
      const state = store.getState();
      return Observable.fromPromise(getInfoTables(state))
        .switchMap(infoTables => Observable.of(Actions.setInfoTables(infoTables)));
    });
}

async function getInfoTables(state: AppState): Promise<Map<string, Map<string, string>>> {
  const device = state.device;
  if (device == null) {
    return new Map();
  }
  const sortedProviders = Array.from(state.deviceInfoProviders)
    .filter(provider => provider.getType() === state.deviceType)
    .sort((a, b) => {
      const pa = a.getPriority === undefined ? -1 : a.getPriority();
      const pb = b.getPriority === undefined ? -1 : b.getPriority();
      return pb - pa;
    });
  const infoTables = await Promise.all(sortedProviders.map(async provider => {
    return [provider.getTitle(), await provider.fetch(state.host, device.name)];
  }));
  return new Map(infoTables);
}
