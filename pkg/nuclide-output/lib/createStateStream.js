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
        records: state.records.concat(record).slice(-state.maxMessageCount),
      };
    }
    case ActionTypes.MAX_MESSAGE_COUNT_UPDATED: {
      const {maxMessageCount} = action.payload;
      if (maxMessageCount <= 0) {
        return state;
      }
      return {
        ...state,
        maxMessageCount,
        records: state.records.slice(-maxMessageCount),
      };
    }
    case ActionTypes.PROVIDER_REGISTERED: {
      const {recordProvider, subscription} = action.payload;
      return {
        ...state,
        providers: new Map(state.providers).set(recordProvider.source, recordProvider),
        providerSubscriptions:
          new Map(state.providerSubscriptions).set(recordProvider.source, subscription),
      };
    }
    case ActionTypes.RECORDS_CLEARED: {
      return {
        ...state,
        records: [],
      };
    }
    case ActionTypes.REGISTER_EXECUTOR: {
      const {executor} = action.payload;
      return {
        ...state,
        executors: new Map(state.executors).set(executor.id, executor),
      };
    }
    case ActionTypes.SOURCE_REMOVED: {
      const {source} = action.payload;
      const providers = new Map(state.providers);
      const providerSubscriptions = new Map(state.providerSubscriptions);
      providers.delete(source);
      providerSubscriptions.delete(source);
      return {
        ...state,
        providers,
        providerSubscriptions,
      };
    }
    case ActionTypes.UNREGISTER_EXECUTOR: {
      const {executor} = action.payload;
      const executors = new Map(state.executors);
      executors.delete(executor.id);
      return {
        ...state,
        executors,
      };
    }
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}
