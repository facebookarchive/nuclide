'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState} from '..';

import Rx from 'rxjs';

const HANDLED_ACTION_TYPES = [];

export function applyActionMiddleware(
  actions: Rx.Observable<Action>,
  getState: () => AppState,
): Rx.Observable<Action> {
  const output = Rx.Observable.merge(
    // Skip unhandled ActionTypes.
    actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1)
  );
  return output.share();
}
