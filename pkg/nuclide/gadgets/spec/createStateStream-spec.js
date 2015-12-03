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
import Rx from 'rx';

describe('createStateStream', () => {

  it('registers a gadget', () => {
    const gadgetId = 'gadget-id-value';
    const gadget = {gadgetId};
    const action$ = Rx.Observable.of({
      type: ActionTypes.REGISTER_GADGET,
      payload: {gadget},
    });
    const state$ = createStateStream(action$, getInitialState());
    expect(state$.getValue().get('gadgets').get(gadgetId)).toBe(gadget);
  });

  it('clears the gadget list on deactivation', () => {
    const action$ = Rx.Observable.of({type: ActionTypes.DEACTIVATE});
    const initialState = Immutable.Map({
      gadgets: Immutable.Map({
        a: {gadgetId: 'a'},
        b: {gadgetId: 'b'},
      }),
    });
    const state$ = createStateStream(action$, initialState);
    expect(state$.getValue().get('gadgets').size).toBe(0);
  });

});
