'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState} from './types';

import * as ActionTypes from './ActionTypes';
import Rx from 'rx';

export default function createStateStream(
  action$: Rx.Observable<Object>,
  initialState: AppState,
): Rx.BehaviorSubject<AppState> {
  const state$ = new Rx.BehaviorSubject(initialState);
  action$.scan(accumulateState, initialState)
    .throttle(100)
    .subscribe(state$);
  return state$;
}

function accumulateState(state: AppState, action: Object): AppState {
  switch (action.type) {
    case ActionTypes.MESSAGE_RECEIVED: {
      const {record} = action.payload;
      return {
        ...state,
        // TODO: Trim array when we hit a (configurable) max
        records: state.records.concat(record),
      };
    }
    case ActionTypes.PROVIDER_REGISTERED: {
      const {outputProvider} = action.payload;
      return {
        ...state,
        providers: new Map(state.providers).set(outputProvider.source, outputProvider),
      };
    }
    case ActionTypes.SOURCE_REMOVED: {
      const {source} = action.payload;
      const providers = new Map(state.providers);
      providers.delete(source);
      return {
        ...state,
        providers,
      };
    }
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}
