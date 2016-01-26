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
import Rx from 'rx';

const emptyAppState = {
  records: [],
};

describe('createStateStream', () => {

  describe('MESSAGE_RECEIVED', () => {
    let finalState;
    let initialRecords;

    beforeEach(() => {
      waitsForPromise(async () => {
        initialRecords = [];
        const initialState = {
          ...emptyAppState,
          records: initialRecords,
        };
        const action$ = new Rx.Subject();
        const state$ = createStateStream(action$, initialState).publishLast();
        state$.connect();
        action$.onNext({
          type: ActionTypes.MESSAGE_RECEIVED,
          payload: {
            record: {
              level: 'info',
              text: 'Hello World',
            },
          },
        });
        action$.onCompleted();
        finalState = await state$.toPromise();
      });
    });

    it('adds records', () => {
      expect(finalState.records.length).toBe(1);
    });

    it("doesn't mutate the original records list", () => {
      expect(initialRecords.length).toBe(0);
    });

  });

});
