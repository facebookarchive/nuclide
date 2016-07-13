'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Action,
  BookShelfState,
} from './types';

import {Observable} from 'rxjs';

const HANDLED_ACTION_TYPES = [];

export function applyActionMiddleware(
  actions: Observable<Action>,
  getState: () => BookShelfState,
): Observable<Action> {
  const output = Observable.merge(
    // Let the unhandled ActionTypes pass through.
    actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1),
  );
  return output.share();
}
