'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, Store} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import * as ActionTypes from './ActionTypes';
import invariant from 'assert';
import {Observable} from 'rxjs';

export function setDiffOptionEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.SET_DIFF_OPTION).switchMap(action => {
    invariant(action.type === ActionTypes.SET_DIFF_OPTION);
    // TODO(most): Use action.payload to do stuff
    return Observable.empty();
  });
}
