'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from '../lib/ActionTypes';
import createStateStream from '../lib/createStateStream';
import getInitialState from '../lib/getInitialState';
import Immutable from 'immutable';
import Rx from '@reactivex/rxjs';

describe('createStateStream', () => {

  it('registers a gadget', () => {
    const gadgetId = 'gadget-id-value';
    const gadget = {gadgetId};
    const action$ = new Rx.Subject();
    const state$ = createStateStream(action$, getInitialState());
    action$.next({
      type: ActionTypes.REGISTER_GADGET,
      payload: {gadget},
    });
    expect(state$.getValue().get('gadgets').get(gadgetId)).toBe(gadget);
  });

  it('clears the gadget list on deactivation', () => {
    const action$ = new Rx.Subject();
    const initialState = Immutable.Map({
      gadgets: Immutable.Map({
        a: {gadgetId: 'a'},
        b: {gadgetId: 'b'},
      }),
    });
    const state$ = createStateStream(action$, initialState);
    action$.next({type: ActionTypes.DEACTIVATE});
    expect(state$.getValue().get('gadgets').size).toBe(0);
  });

  it('removes unregistered gadgets', () => {
    const gadgetId = 'gadget-id-value';
    const action$ = new Rx.Subject();
    const initialState = Immutable.Map({
      gadgets: Immutable.Map({
        'gadget-id-value': {gadgetId},
        other: {gadgetId: 'other'},
      }),
    });
    const state$ = createStateStream(action$, initialState);
    action$.next({
      type: ActionTypes.UNREGISTER_GADGET,
      payload: {gadgetId},
    });
    const gadgets = state$.getValue().get('gadgets');
    expect(Array.from(gadgets.keys())).toEqual(['other']);
  });

});
