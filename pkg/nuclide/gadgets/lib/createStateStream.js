'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from './ActionTypes';
import Immutable from 'immutable';
import Rx from 'rx';

/**
 * Convert a stream of actions into a stream of application states.
 */
export default function createStateStream(
  action$: Rx.Observable,
  initialState: Immutable.Map,
): Rx.Observable {
  const state$ = new Rx.BehaviorSubject(initialState);
  action$.scan(handleAction, initialState).subscribe(state$);
  return state$;
}

/**
 * Transform the state based on the given action and return the result.
 */
function handleAction(state, action) {
  switch (action.type) {

    case ActionTypes.DEACTIVATE: {
      return state.set('gadgets', Immutable.Map());
    }

    case ActionTypes.REGISTER_GADGET: {
      const gadgets = state.get('gadgets');
      const {gadget} = action.payload;
      return state.set(
        'gadgets',
        gadgets.set(gadget.gadgetId, gadget),
      );
    }

  }
}
