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

      const deviceMap = Promise.all(Array.from(state.deviceFetchers).map(fetcher => {
        return fetcher.fetch(state.host)
          .then(deviceList => [fetcher.getType(), deviceList]);
      })).then(deviceLists => new Map(deviceLists));

      return Observable
        .fromPromise(deviceMap)
        .switchMap(devices => Observable.of(Actions.setDevices(devices)));
    });
 }
