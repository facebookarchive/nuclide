'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ActionsObservable} from '../../../commons-node/redux-observable';
import type {Store} from '../types';
import type {Action} from './Actions';

import {Observable} from 'rxjs';
import * as Actions from './Actions';

export function setProjectRootEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_PROJECT_ROOT)
    .switchMap(action => {
      return Observable.empty();
    });
}

export function setBuildTargetEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_BUILD_TARGET)
    .switchMap(action => {
      return Observable.empty();
    });
}

export function fetchDevicesEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.FETCH_DEVICES)
    .switchMap(action => {
      return Observable.empty();
    });
}
