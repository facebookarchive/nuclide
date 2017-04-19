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
import type {Action, Store} from '../types';

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
      const device = state.device;
      if (device == null) {
        return Observable.empty();
      }
      const infoTables = new Map();
      const promise = Promise.all(Array.from(state.deviceInfoProviders)
        .filter(provider => provider.getType() === state.deviceType)
        .map(provider => provider.fetch(state.host, device)
                           .then(infoTable => infoTables.set(provider.getTitle(), infoTable))));
      return Observable.fromPromise(promise)
        .switchMap(_ => Observable.of(Actions.setInfoTables(infoTables)));
    });
}
