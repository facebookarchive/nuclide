'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action} from '../types/Action';

import * as ActionTypes from './ActionTypes';
import Immutable from 'immutable';
import Rx from '@reactivex/rxjs';

/**
 * Convert a stream of actions into a stream of application states.
 */
export default function createStateStream(
  action$: Rx.Observable<Action>,
  initialState: Immutable.Map,
): Rx.BehaviorSubject<Immutable.Map> {
  const state$: Rx.BehaviorSubject<Immutable.Map> = new Rx.BehaviorSubject(initialState);
  action$.scan(handleAction, initialState).subscribe(state$);
  return state$;
}

/**
 * Transform the state based on the given action and return the result.
 */
function handleAction(state: Immutable.Map, action: Action): Immutable.Map {
  switch (action.type) {

    case ActionTypes.CREATE_PANE_ITEM: {
      const {item, props, component} = action.payload;
      return state.merge({
        components: state.get('components').set(item, component),
        props: state.get('props').set(item, props),
      });
    }

    case ActionTypes.DEACTIVATE: {
      return state.set('gadgets', Immutable.Map());
    }

    case ActionTypes.DESTROY_PANE_ITEM: {
      const {item} = action.payload;
      return state.merge({
        components: state.get('components').delete(item),
        props: state.get('props').delete(item),
      });
    }

    case ActionTypes.REGISTER_GADGET: {
      const gadgets = state.get('gadgets');
      const {gadget} = action.payload;
      return state.set(
        'gadgets',
        gadgets.set(gadget.gadgetId, gadget),
      );
    }

    case ActionTypes.UNREGISTER_GADGET: {
      const gadgets = state.get('gadgets');
      const {gadgetId} = action.payload;
      return state.set(
        'gadgets',
        gadgets.filter(gadget => gadget.gadgetId !== gadgetId),
      );
    }

    case ActionTypes.UPDATE_PANE_ITEM: {
      const {item, props} = action.payload;
      return state.set(
        'props',
        state.get('props').set(item, props),
      );
    }

    default:
      throw new Error('Unhandled action type: ' + action.type);

  }
}
